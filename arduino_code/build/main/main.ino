 #include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"


#define CONFIG1
/*
 * Below are the four possible configurations for the motors.
 * This assumes that PWM2 goes with pins 3 and 4 and PWM7 goes
 * with pins 5 and 6. I assume this part to at least be correct.
 * Just switch out the configs and test with all of the directionals
 * to observe which is correct.
 */

#ifdef CONFIG1  
Motor left(4, 3, 2); 
Motor right(6, 5, 7); 
#endif

#ifdef CONFIG2 
Motor left(3, 4, 2); 
Motor right(5, 6, 7); 
#endif

#ifdef CONFIG3 
Motor left(6, 5, 7); 
Motor right(4, 3, 2); 
#endif

#ifdef CONFIG4
Motor left(5, 6, 7); 
Motor right(3, 4, 2); 
#endif
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
int debug = True;

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
unsigned long debugTime;

unsigned long turntimer;
bool turnflag;


void setup() 
{
Serial.begin(9600); //Unusued in project. Mainly for debugging purposes.
Serial.setTimeout(15); //Approximation of 1000/96, 10 chars max per transaction
Wire.begin();
laserSensor.setNumber(SENSORS);
//laserSensor.setHighAccuracy();
debugTime = millis();
micTime = millis();
turnflag = false;
prev = -1;
next = 0;
}

void loop()
{
while (debug || !Serial.available())
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
  commandFromPi(piCommand, a, b, left, right);  
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
  
  else if (millis() - time > 100)
  {
    //Code waits 100ms before checking the laser again  
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
  Forward(left, right, 200); //Always go forward if there is nothing in the way

  //Reset the previous and next values for when turning is needed
  prev = -1;
  next = 0;
  }
}

void readLaser() {  
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
    (turnleftsensor) ? Right(left, right, 200) : Left(left, right, 200); //Turn based on which sensor showed farther values
  }
  
  if (checkSensors(time, turnleftsensor, prev, next, checkprev, checknext))
  {
    //Reset all flags when turning has gone past the parallel point of the wall
    turning = false;
    checkprev = false;
    checknext = false;
    Forward(left, right, 200);
  }
  }
}
