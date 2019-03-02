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
int statetest;

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
    Serial.print("State is: ");
    statetest = laserSensor.getState();
    Serial.println(statetest);
  delay(500);
//if (!Serial1.available())
//{
//readLaser(); 
//delay(500);
//  if (count < 1000)
//    {
//      aSample = a.record();
//      bSample = b.record();
//      aMax = (aSample > aMax) ? aSample : aMax;
//      bMax = (bSample > bMax) ? bSample : bMax;
//      count ++;
//    }   
//  else
//  {
//    a.storeIntoBuffer(aMax);
//    b.storeIntoBuffer(bMax);
//    count = 0;  
//  }
//}
//else
//{
//  parsePackage(piCommand);
//    if (piCommand.direction == 'y')
//      {
//        aMax = a.getMax();
//        bMax = b.getMax();
//        if (aMax > bMax)
//        {
//          Right(left, right, 175);
//        }
//        else
//        {
//          Left(left, right, 175);
//        }        
//        a.clearBuffer();
//        b.clearBuffer();
//        aMax = 0;
//        bMax = 0; 
//      }
//}
//delay(1);
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
  Serial.print("State is: ");
  Serial.println(lasersensor.getState());
  delay(500);
//  Serial.print("State is ");
//  Serial.println(state);
//  if (state > 0) {
//    if (!waitSensor  && !turning) {
//      waitSensor = 25;
//    } 
//    else if (waitSensor) {
//      waitSensor--;
//    }
//      if (!waitSensor) {
//        turning = 1;
//        Serial.println("Turning");
//        if (BLOCKED_FRONT & state) {
//          Serial.println("Front Block...Backing Up");
//          Backward(left, right, 200);
//        } 
//        else if ((state & BLOCKED_LEFT) | (state & BLOCKED_RIGHT)) {
//          if (state & BLOCKED_RIGHT)
//          {
//            Serial.println("Blocked Right...Going Left");
//            Left(left, right, 200);
//          }
//          else
//          {
//            Serial.println("Blocked Left...Going Right");
//            Right(left, right, 200);
//          }
//        } 
//      }
//   }
//    else {
//      waitSensor = 0;
//      turning = 0;
//      Forward(left, right, 175);
//      Serial.println("GO");
//  }
// 
//  if (wait++ > 10) {
//    wait = 0;
//    if (waitSensor || turning) {
//      Halt(left, right);
//      Serial.println("Zzz.....");
//    } else {
//      Forward(left, right, 200);
//      Serial.println("Chugga Chugga Choo Choo");
//    }  
//  }
}
