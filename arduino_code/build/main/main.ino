#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"

#define METHOD3

Motor motorRight(4, 3, 2); 
Motor motorLeft(6, 5, 7); 

Microphone a(0); //right mic
Microphone b(1); //left mic
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

void readLaser() {  
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
      while(millis() - turnStart < 1000)
      {
        (leftSensor < rightSensor) ? Right(motorLeft, motorRight, 255) : Left(motorLeft, motorRight, 255);
      }      
    }
    Halt(motorLeft, motorRight);
    delay(500);
  }
  else
  {
    Forward(motorLeft, motorRight, 255);
  }
}
