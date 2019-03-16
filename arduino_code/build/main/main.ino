#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"



//#define FRONTPRIORITY
#define TURNBASED
  
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

void setup() 
{
Serial.begin(9600); //Unusued in project. Mainly for debugging purposes.
Serial1.begin(9600);
Wire.begin();
a.clearBuffer();
b.clearBuffer();
laserSensor.setNumber(SENSORS);
laserSensor.setHighAccuracy();
}

void loop()
{
readLaser();
if (!Serial1.available())
{
  if (count < 1000)
    {
      aSample = a.record();
      bSample = b.record();
      aMax = (aSample > aMax) ? aSample : aMax;
      bMax = (bSample > bMax) ? bSample : bMax;
      count ++;
    }   
  else
  {
    a.storeIntoBuffer(aMax);
    b.storeIntoBuffer(bMax);
    aMax = 0;
    bMax = 0;
    count = 0;  
  }
}
else
{
  parsePackage(piCommand);
  commandFromPi(piCommand, a, b, left, right);
}
    delay(1);
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
        (turn) ? Left(left, right, 155) : Right(left, right, 175);
        delay(1);
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
    delay(70);
  }
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
          Right(left, right, 150);
          delay(70);
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
          Left(left, right, 150);
          delay(70);
          next = laserSensor.getValue(RIGHT_SENSOR);
        }      
    }
  }
    else if (BLOCKED_LEFT & state)
    {
      Left(left, right, 175);
      delay(70);
    }
    else
    {
      Right(left, right, 175);
      delay(70);
    }
}
#endif
}
