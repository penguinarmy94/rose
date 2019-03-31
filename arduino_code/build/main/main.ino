#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"



//#define FRONTPRIORITY
//#define TURNBASED
#define STOPPED
  
Motor left(8, 7 , 6); //7, 8, 6
Motor right(9, 10, 11); //10, 9, 11
Microphone a(3);
Microphone b(5);
LaserSensor lasersensor;
int aMax;
int aSample;
int bSample;
int bMax;
char fromPi[10];
int count;
int state;
PIData piCommand;
int i = 0;
int turn;

LaserSensor laserSensor;
int waitSensor = 0;
int turning = 0;
int wait = 0;

const unsigned long sampleWindow = 50;
unsigned long micTime;
unsigned long debugTime;

void setup() 
{
Serial.begin(9600); //Unusued in project. Mainly for debugging purposes.
//Serial1.begin(9600);
Wire.begin();
a.clearBuffer();
b.clearBuffer();
//laserSensor.setNumber(1);
//laserSensor.setHighAccuracy();
debugTime = millis();
}

void loop()
{
//readLaser();
if (!Serial.available())
{
  micTime = millis();
  while(millis() - micTime < sampleWindow)
  {
    record(a, b);
  }
  storeAmplitude(a, b);
  if(millis() - debugTime > 500)
  {
    Serial.println(a.getMax());
    Serial.println(b.getMax());
    Serial.println();
    debugTime = millis();
  }
}
else
{
  parsePackage(piCommand);
  commandFromPi(piCommand, a, b, left, right);
  
}
}


void readLaser() {
  Forward(left, right, 150);
  state = laserSensor.getState();
  #ifdef FRONTPRIORITY 
  if (state)
  {
    if (BLOCKED_FRONT & state)
    {
      turn = (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? 1: 0; //1 for left, 0 for right
      while (laserSensor.getState() & BLOCKED_FRONT)
      {
        (turn) ? Right(left, right, 175) : Left(left, right, 175);
        delay(100);
      }
    }
    else if (BLOCKED_LEFT & state)
    {
      Left(left, right, 175);
    }
    else
    {
      Right(left, right, 175);
    }
  }
  delay(100);
  #endif

  #ifdef STOPPED
  if (state)
  {
    Halt(left, right);
    delay(930);
    int leftblock = laserSensor.getValue(LEFT_SENSOR);
    delay(70);
    int rightblock = laserSensor.getValue(RIGHT_SENSOR);
    if (leftblock < rightblock) {
      Right(left, right, 225);
      while(state & (BLOCKED_FRONT | BLOCKED_LEFT)){
        state = laserSensor.getState();
        delay(70);
      }
      Halt(left, right);
    }
    else
    {
      Left(left, right, 225);
      while(state & (BLOCKED_FRONT | BLOCKED_RIGHT)){
        state = laserSensor.getState();
        delay(70);
      }
      Halt(left, right);     
    }   
  }
  delay(70);
  #endif
  
  #ifdef TURNBASED
  int prev;
  int next;
  if (state)
  {
    if (BLOCKED_FRONT & state)
    {
      if (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR))
      {
        prev = -1;
        next = 0;
        while(prev < next)
        {
          prev = laserSensor.getValue(LEFT_SENSOR);
          Left(left, right, 200);
          delay(100);
          next = laserSensor.getValue(LEFT_SENSOR);
        }
      }
      else
      {
        prev = -1;
        next = 0;
        while(prev < next)
        {
          prev = laserSensor.getValue(RIGHT_SENSOR);
          Right(left, right, 200);
          delay(100);
          next = laserSensor.getValue(RIGHT_SENSOR);
        }      
    }
  }
    else if (BLOCKED_LEFT & state)
    {
      Right(left, right, 200);
      delay(100);
    }
    else
    {
      Left(left, right, 225);
      delay(100);
    }
}
#endif
}
