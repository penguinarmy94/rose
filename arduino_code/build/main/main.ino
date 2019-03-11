#include "Motor.h"
#include "Microphone.h"
#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"

struct PIData {
  char direction;
  int distance;
  };
  
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
    if (piCommand.direction == 'y')
      {
        aMax = a.getMax();
        bMax = b.getMax();
        if (aMax > (bMax - b.getCalibrationValue()))
        {
          Right(left, right, 175);
        }
        else
        {
          Left(left, right, 175);
        }        
        a.clearBuffer();
        b.clearBuffer();
        aMax = 0;
        bMax = 0; 
        Serial1.print("k-");
      }
    else if (piCommand.direction == 'c')
    {
      calibrateMicrophones(a, b);
      Serial1.print("k-");  
    }
    else if (piCommand.direction == 'f')
    {
      while (i < piCommand.distance)
      {
        readLaser();
        i++;
      }
      i = 0;
      Serial1.print("k-");
    }
    else if (piCommand.direction == 'b')
    {
      Left(left, right, 200);
      delay(100);
      while (i < piCommand.distance)
      {
        readLaser();
        i++;
      }
      i = 0;
      Serial1.print("k-");
    }
    else if (piCommand.direction == 'l')
    {
      Left(left, right, 200);
      delay(50);
      while (i < piCommand.distance)
      {
        readLaser();
        i++;
      }
      i = 0;
      Serial1.print("k-");
    }
    else if (piCommand.direction == 'r')
    {
      Right(left, right, 200);
      delay(50);
      while (i < piCommand.distance)
      {
        readLaser();
        i++;
      }
      i = 0;
      Serial1.print("k-");
    }
}
    delay(1000);
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

int getDistance(char arr[])
{
  int i = 1;
  int distance = 0;
  while (i < 10 && arr[i] != 0)
  {
    distance *= 10;
    distance += arr[i] - '0';
  }
  return distance;
}

void parsePackage(PIData &package)
{
  Serial1.readBytesUntil('-', fromPi, 10); 
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
  Forward(left, right, 150);
  state = laserSensor.getState();
  if (state)
  {
    if (BLOCKED_FRONT & state)
    {
      turn = (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? 1: 0; //1 for left, 0 for right
      while (laserSensor.getState() & BLOCKED_FRONT)
      {
        (turn==0) ? Left(left, right, 155) : Right(left, right, 175);
        delay(70);
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
    delay(70);
  }
//  if (state > 0) {
//    if (!waitSensor  && !turning) {
//      waitSensor = 25;
//    } 
//    else if (waitSensor) {
//      waitSensor--;
//    }
//      if (!waitSensor) {
//        turning = 1;
//        if (BLOCKED_FRONT & state) {
//          (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? Right(left, right, 200) : Left(left, right, 200);
//        } 
//        else 
//        {
//          (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? Right(left, right, 200) : Left(left, right, 200);
//        }
//      }
//   }
//    else {
//      waitSensor = 0;
//      turning = 0;
//      Forward(left, right, 175);
//  }
// 
//  if (wait++ > 10) {
//    wait = 0;
//    if (waitSensor || turning) {
//      Halt(left, right);
//    } else {
//      Forward(left, right, 200);
//    }  
//  }
}

void calibrateMicrophones(Microphone &a, Microphone &b)
{
  int aCumulative = 0;
  int bCumulative = 0;
  int aVal;
  int bVal;
  int calibration;
  int i = 0;
  while(i < 5000)
  {
    aVal = a.record();
    bVal = b.record();
    aCumulative = (aCumulative > aVal) ? aCumulative : aVal;
    bCumulative = (bCumulative > bVal) ? bCumulative : bVal;
    i++;
    delay(1);
  }
  b.setCalibrationValue(bCumulative - aCumulative);
}
