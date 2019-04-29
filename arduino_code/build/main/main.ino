#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"

#define METHOD3

Motor motorRight(6, 5, 7); 
Motor motorLeft(4, 3, 2); 

Microphone a(0);
Microphone b(1);
LaserSensor lasersensor;
int aMax;
int aSample;
int bSample;
int bMax;
char fromPi[10];
int count;
PIData piCommand;
int i = 0;
int turn;

LaserSensor laserSensor;
int waitSensor = 0;
int turning = 0;
int wait = 0;

//Obstacle Avoidance
  int state;
  bool checkprev;
  bool checknext;
  bool turnleftsensor;
  int prev;
  int next;
  unsigned long time;

const unsigned long sampleWindow = 50;
unsigned long micTime;

int turn_preferred_direction = MOTOR_TURN_CLOCKWISE;

// Motor Flags
bool isBlocked = false;
bool isTurning = false;
bool isTrackback = false;
int motorTurnAngle = 0;
int direction = 0;
int lastDirection = MOTOR_TURN_PREFERRED_DIRECTION;

int waitMotor = 0;
int waitTurn = 0;
int lastSensorRead = 0;

unsigned long turntimer;
bool turnflag;



void setup() 
{
Serial.begin(9600); //Unusued in project. Mainly for debugging purposes.
Serial.setTimeout(15); //Approximation of 1000/96, 10 chars max per transaction
Wire.begin();
laserSensor.setNumber(SENSORS);
//laserSensor.setHighAccuracy();
micTime = millis();
turnflag = false;
prev = -1;
next = 0;
}

void loop()
{  

while (!Serial.available())
{
  getSoundSample(a, b, micTime, sampleWindow);
  if(millis() - micTime < sampleWindow)
  {
    record(a, b);
  }
  else
  {
    storeAmplitude(a, b);
    micTime = millis();
  }  
}
  parsePackage(piCommand, fromPi, sizeof(fromPi));
  commandFromPi(piCommand, a, b, motorLeft, motorRight);  
}

bool checkSensors(unsigned long &time, bool leftsensor, int &prev, int &next, bool &checkprev, bool &checknext)
{
  bool result = false; //Default result to false until next is farther than previous
  if(!checkprev)
  {
    prev = (leftsensor) ? laserSensor.getValue(LEFT_SENSOR) : laserSensor.getValue(RIGHT_SENSOR); //Check appropriate sensor value

    //set previous flag to true
    checknext = false;
    checkprev = true;
    time = millis(); //Start timer
  }
  
  else if (millis() - time > 50)
  {
    //Code waits 50ms before checking the laser again  
    next = (leftsensor) ? laserSensor.getValue(LEFT_SENSOR) : laserSensor.getValue(RIGHT_SENSOR);


    //Unnecessary but next flag put to true for consistency
    checkprev = false;
    checknext = true;

    //Loop ends when next is greater than previous. This happens when robot has moved past the parallel of the wall
    result = (next > prev);
  }
  
  return result;
}

void noBlock()
{
  if(!turning & !state){
  Forward(motorLeft, motorRight, 250); //Always go forward if there is nothing in the way

  //Reset the previous and next values for when turning is needed
  prev = -1;
  next = 0;
  }
}

void readLaser() {  
  #ifdef METHOD1
  state = laserSensor.getState(); 
  if(!turning & !state){
  noBlock();
  }
  
  else
  { 
  if(!turning)
  {
    //First instance of something being blocked
    turnleftsensor = laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR); //Preference to left, but figure out who turns based on which sensor is less

    //Flags for previous and next being checked are false
    checkprev = false;
    checknext = false;

    //Turn flag is set to true
    turning = true;
    
    //Handle turning of obstacle avoidance. Put in this loop so turning is called once.
    (turnleftsensor) ? Right(left, right, 250) : Left(left, right, 250); //Turn based on which sensor showed farther values
  }
  
  if (checkSensors(time, turnleftsensor, prev, next, checkprev, checknext))
  {
    //Reset all flags when turning has gone past the parallel point of the wall
    turning = false;
    checkprev = false;
    checknext = false;
    Forward(left, right, 250);
  }
  }
  #endif
  #ifdef METHOD2
  int distance = laserSensor.getValue(FRONT_SENSOR);
  if (distance <= SENSOR_STOP_DISTANCE  && !isTurning) {
    //Serial.println("Start Turning");
    
    motorLeft.halt();
    motorRight.halt();

    if (waitTurn++ > MOTOR_TURN_DELAY) {
      
      waitTurn = 0;
      isTurning = true;
      isTrackback = false;
      motorTurnAngle = MOTOR_PREFERRED_TURN_ANGLE;
      
      int sensorRead = laserSensor.getValue(LEFT_SENSOR);
      if (sensorRead <= SENSOR_BLOCK_DISTANCE) {
        direction = MOTOR_TURN_CLOCKWISE;
        lastSensorRead = sensorRead;
      }

      sensorRead = laserSensor.getValue(RIGHT_SENSOR);
      if (sensorRead <= SENSOR_BLOCK_DISTANCE) {
        if (direction = MOTOR_TURN_CLOCKWISE) {
          motorTurnAngle = 180;
        }
        else {
          direction = lastDirection;
          if (MOTOR_TURN_COUNTERCLOCKWISE == direction) {
            lastSensorRead = sensorRead;  
          }
        }
      }
    }   
  }
  else if (isTurning) {
    //Serial.println("Turning");

    if (waitTurn++ > MOTOR_TURN_DURATION) {
      motorTurnAngle -= MOTOR_ANGLE_PER_ITERATION;
    
      if (MOTOR_TURN_CLOCKWISE == direction) {
          motorLeft.setForward(MOTOR_MIN_SPEED);
          motorRight.setReverse(MOTOR_MIN_SPEED);
      }
      else {
          motorLeft.setReverse(MOTOR_MIN_SPEED);
          motorRight.setForward(MOTOR_MIN_SPEED);
      }

      if (motorTurnAngle <= 0) {
        isTurning = false;
      }
      else {
        isTurning = !isTrackback;
      }
    }
    else {
      motorLeft.halt();
      motorRight.halt();

      if (MOTOR_TURN_CLOCKWISE == direction) {
        int sensorRead = laserSensor.getValue(LEFT_SENSOR); 
        sensorRead += laserSensor.getValue(LEFT_SENSOR); 
        sensorRead += laserSensor.getValue(LEFT_SENSOR);
        sensorRead = (int) (sensorRead / 3);
          
        if (sensorRead/3 <= lastSensorRead + SENSOR_ERROR_BUFFER) {
          lastSensorRead = sensorRead;     
        }
        else {
          isTrackback = true;
        }
      }
      else {
        int sensorRead = laserSensor.getValue(RIGHT_SENSOR);
        sensorRead += laserSensor.getValue(RIGHT_SENSOR);
        sensorRead += laserSensor.getValue(RIGHT_SENSOR);  
        sensorRead = (int) (sensorRead / 3);
        
        if (sensorRead <= lastSensorRead + SENSOR_ERROR_BUFFER) {
          lastSensorRead = sensorRead;  
        }
        else {
          isTrackback = true;
        }
      }

      if (isTrackback) direction = -direction;
    }
  }
  else {
    //Serial.println("Driving");   
    waitTurn = 0;
  }
  #endif
  #ifdef METHOD3
  unsigned long turnStart;
  int frontSensor = laserSensor.getValue(FRONT_SENSOR);
  if(frontSensor <= SENSOR_STOP_DISTANCE){
    Halt(motorLeft, motorRight);
    int leftSensor = laserSensor.getValue(LEFT_SENSOR);
    bool leftBlocked = leftSensor <= SENSOR_STOP_DISTANCE;
    int rightSensor = laserSensor.getValue(RIGHT_SENSOR);
    bool rightBlocked = rightSensor <= SENSOR_STOP_DISTANCE;
    turnStart = millis();
    if(leftBlocked && rightBlocked)
    {
      while(millis() - turnStart < 2000)
      {
        Left(motorLeft, motorRight, 255);
      }
    }
    else if(leftBlocked && !rightBlocked)
    {
      while(millis() - turnStart < 1000)
      {
        Left(motorLeft, motorRight, 255);
      }
    }
    else if(!leftBlocked && rightBlocked)
    {
      while(millis() - turnStart < 1000)
      {
        Left(motorLeft, motorRight, 255);
      }
    }
    else
    {
      while(millis() - turnStart < 2000)
      {
        (leftSensor < rightSensor) ? Right(motorLeft, motorRight, 255) : Left(motorLeft, motorRight, 255);
      }      
    }
    Halt(motorLeft, motorRight);
  }
  else
  {
    Forward(motorLeft, motorRight, 255);
  }
  #endif
}
