#include "Motor.h"
#include "Microphone.h"

struct PIData {
  char direction;
  int distance;
  };
  
Motor left(13, 12, 11);
Motor right(8, 7, 9);
Microphone a(3);
Microphone b(4);
int aMax;
int aSample;
int bSample;
int bMax;
char fromPi[10];
int count;
void setup() 
{
Serial.begin(9600);
}

void loop()
{
//Forward(left, right, 150);
//if (a.record() >= 700 || b.record() >= 700)
//{
//  if (a.record() > b.record())
//    {
//      Left(left, right, 150);
//    }
//  else
//    {
//      Right(left, right, 150);  
//    }
//}
while (count < 1000 && !Serial.available())
{
  aSample = a.record();
  bSample = b.record();
  aMax = (aSample > aMax) ? aSample : aMax;
  bMax = (bSample > bMax) ? bSample : bMax;
}
  a.storeIntoBuffer(aMax);
  b.storeIntoBuffer(bMax);
  if (Serial.available())
    {
      if (Serial.read() == 'r')
        {
          aMax = a.getMax();
          bMax = b.getMax();
        }
      if (aMax > bMax)
      {
        Serial.println("a was louder");  
      }
      else
      {
        Serial.println("b was louder");
      }
      a.clearBuffer();
      b.clearBuffer();
    }
  aMax = 0;
  bMax = 0;    
delay(100);
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
