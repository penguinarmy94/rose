#include "helper.h"

void Forward(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.forward(speed);
}

void Backward(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.backward(speed);
  delay(100);
  left.halt();
  right.halt();
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
  extern char fromPi[10];
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
  memset(fromPi, 0, sizeof(fromPi));
}

void commandFromPi(PIData &package, Microphone &a, Microphone &b, Motor left, Motor right)
{
  package.distance *= 1000;
  switch(package.direction)
  {
    case 'Y': warningDetected(a, b, left, right);
    case 'C': calibrateMicrophones(a, b);
    case 'F': commandForward(package, left, right);
    case 'B': commandBackward(package, left, right);
    case 'R': commandRight(package, left, right);
    case 'L': commandLeft(package, left, right);
    default: memset(&package, 0, sizeof(package));
  }
  Serial1.print("K");
  memset(&package, 0, sizeof(package));
}

void warningDetected(Microphone &a, Microphone &b, Motor left, Motor right)
{
  int aMax = a.getMax();
  int bMax = b.getMax();
  (aMax > (bMax - b.getCalibrationValue())) ? Right(left, right, 175) : Left(left, right, 175);       
  a.clearBuffer();
  b.clearBuffer();
}

void commandForward(PIData package, Motor left, Motor right)
{
  int i = 0;
  Forward(left, right, 150);
  while (i < package.distance)
    {
      //readLaser();
      i++;
    }  
  Halt(left, right);  
}

void commandBackward(PIData package, Motor left, Motor right)
{
  int i = 0;
  Backward(left, right, 150);
  while (i < package.distance)
    {
      //readLaser();
      i++;
    }  
  Halt(left, right);  
}

void commandRight(PIData package, Motor left, Motor right)
{
  int i = 0;
  Right(left, right, 150);
  while (i < package.distance)
    {
      //readLaser();
      i++;
    } 
  Halt(left, right);   
}

void commandLeft(PIData package, Motor left, Motor right)
{
  int i = 0;
  Left(left, right, 150);
  while (i < package.distance)
    {
      //readLaser();
      i++;
    }  
  Halt(left, right);  
}

/*
 *   if (piCommand.direction == 'y')
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
      }
    else if (piCommand.direction == 'c')
    {
      calibrateMicrophones(a, b);
    }
    else if (piCommand.direction == 'f')
    {
      while (i < piCommand.distance)
      {
        readLaser();
        i++;
      }
      i = 0;
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
    }
    Serial1.print("k-");
    memset(&piCommand, 0, sizeof(piCommand));
 */
