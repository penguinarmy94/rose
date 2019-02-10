#include "Motor.h"
#include "Microphone.h"
#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"

struct PIData {
  char direction;
  int distance;
  };
  
Motor left(10, 9, 11);
Motor right(8, 7, 6);
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

LaserSensor laserSensor;
int waitSensor = 0;
int turning = 0;
int wait = 0;

void setup() 
{
Serial.begin(9600);
Wire.begin();
a.clearBuffer();
b.clearBuffer();
//laserSensor.setNumber(SENSORS);
}

void loop()
{
if (!Serial.available())
{
//readLaser(); 
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
    count = 0;  
  }
}
else
{
  parsePackage(piCommand);
    if (piCommand.direction == 'y')
      {
        aMax = a.getMax();
        bMax = b.getMax();
        if (aMax > bMax)
        {
          Serial.println("a was louder than b");
          Serial.println(aMax);
          Serial.println(bMax);
          Serial.println("--------");
        }
        else
        {
          Serial.println("b was louder than a");
          Serial.println(aMax);
          Serial.println(bMax);
          Serial.println("--------");
        }        
        a.clearBuffer();
        b.clearBuffer();
        aMax = 0;
        bMax = 0; 
      }
}
delay(1);
}

void Forward(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.forward(speed);
}

void Backward(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.backward(speed);
}

void Left(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.forward(speed);
}

void Right(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.backward(speed);
}

void Halt(Motor left, Motor right)
{
  left.halt();
  right.halt();
}

void parsePackage(PIData &package)
{
  Serial.readBytesUntil('-', fromPi, 10); 
  package.direction = fromPi[0];
  int dist = 0;
  int i = 1;
  while(fromPi[i] >= '0' && i < 10)
    {
      dist *= 10;
      dist += (fromPi[i] - '0');
      i++;
    }
    package.distance = dist;
  for (int j = 0; j < 10; j++)
    {
      fromPi[j] = 0;  
    }
}

void readLaser() {
  state = laserSensor.getState();
  if (state > 0) {
    if (!waitSensor  && !turning) {
      waitSensor = 25;
    } 
    else if (waitSensor) {
      waitSensor--;
    }
      if (!waitSensor) {
        turning = 1;
        if (BLOCKED == state) {
          Right(left, right, 75);
        } 
//        else if (BLOCKED_LEFT == state) {
//          Serial.println("Turn right");
//          Right(left, right, 150);
//        } 
//        else if (BLOCKED_RIGHT == state) {
//          Serial.println("Turn left");
//          Left(left, right, 150);
//        }
      }
   }
    else {
      waitSensor = 0;
      turning = 0;
      Forward(left, right, 75);
  }
 
  if (wait++ > 10) {
    wait = 0;
    if (waitSensor || turning) {
      Halt(left, right);
      //Serial.println("Zzz.....");
    } else {
      Forward(left, right, 75);
      //Serial.println("Chugga Chugga Choo Choo");
    }  
  }
}
