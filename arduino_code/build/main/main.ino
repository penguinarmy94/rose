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
}

void loop()
{
readLaser();  
if (!Serial.available())
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
        Serial.print(aMax);
        Serial.print(", ");
        Serial.println(bMax);
        if (aMax > (bMax - b.getCalibrationValue()))
        {
          Right(left, right, 175);
          Serial.println("A was Louder");
        }
        else
        {
          Left(left, right, 175);
          Serial.println("B was Louder");
        }        
        a.clearBuffer();
        b.clearBuffer();
        aMax = 0;
        bMax = 0; 
      }
    else if (piCommand.direction == 'c')
    {
      calibrateMicrophones(a, b);
      Serial.print("k-");  
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
  Serial.print("a-");  
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
        if (BLOCKED_FRONT & state) {
          (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? Right(left, right, 200) : Left(left, right, 200);
        } 
        else 
        {
          (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? Right(left, right, 200) : Left(left, right, 200);
        }
      }
   }
    else {
      waitSensor = 0;
      turning = 0;
      Forward(left, right, 175);
  }
 
  if (wait++ > 10) {
    wait = 0;
    if (waitSensor || turning) {
      Halt(left, right);
    } else {
      Forward(left, right, 200);
    }  
  }
}

void calibrateMicrophones(Microphone &a, Microphone &b)
{
  int aCumulative = 0;
  int bCumulative = 0;
  int aVal;
  int bVal;
  int calibration;
  int i = 0;
  while(i < 50)
  {
    aVal = a.record();
    bVal = b.record();
    aCumulative = (aCumulative > aVal) ? aCumulative : aVal;
    bCumulative = (bCumulative > bVal) ? bCumulative : bVal;
    i++;
  }
  b.setCalibrationValue(bCumulative - aCumulative);
  Serial.println(b.getCalibrationValue());
}
