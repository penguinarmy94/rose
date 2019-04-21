#include "helper.h"

void Forward(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.forward(speed);
}

//Unused but added for completeness
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
  left.forward(speed);
  right.backward(speed);
}

void Right(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.forward(speed);
}

void Halt(Motor left, Motor right)
{
  left.halt();
  right.halt();
}

//Will be phased out
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
  b.storeCalibrationValue(bCumulative - aCumulative);
}

//Parse string of numbers into one numerical value
int getDistance(char arr[])
{
  int i = 1;
  int distance = 0;
  while (i < 10 && arr[i] != 0)
  {
    distance *= 10;
    distance += arr[i] - '0';
    i++;
  }
  return distance;
}

void parsePackage(PIData &package, char fromPi[], int size)
{
  Serial.readBytesUntil('-', fromPi, size);
  package.direction = fromPi[0];
  package.distance = getDistance(fromPi);
  for(int i = 0; i < size; i++)
  {
    fromPi[i] = 0;
  }
}

void commandFromPi(PIData &package, Microphone &a, Microphone &b, Motor left, Motor right)
{
  switch(package.direction)
  {
    case 'Y': warningDetected(a, b, left, right);
    sendAck();
    break;
    case 'C': calibrateMicrophones(a, b);
    sendAck();
    break;
    case 'F': commandForward(package, left, right);
    sendAck();
    break;
    case 'B': commandBackward(package, left, right);
    sendAck();
    break;
    case 'R': commandRight(package, left, right);
    sendAck();
    break;
    case 'L': commandLeft(package, left, right);
    sendAck();
    break;
    case 'S': commandHalt(package, left, right);
    sendAck();
    break;
    default: Serial.print("err\n");
    break;
  }
  memset(&package, 0, sizeof(package));
}

void sendAck()
{
  Serial.print("ack\n"); 
}

void warningDetected(Microphone &a, Microphone &b, Motor left, Motor right)
{
  unsigned int aMax = a.getMax();
  unsigned int bMax = b.getMax();
  (aMax > bMax) ? Right(left, right, 175) : Left(left, right, 175);  
  Halt(left, right);  
}

void commandForward(PIData package, Motor left, Motor right)
{
  int i = 0;
  Forward(left, right, 150);
  unsigned long start = millis();
  while(millis() - start < (package.distance * 1000))
  {
    readLaser();
  }
  Halt(left, right);  
}

//Most likely not used but brought in for completeness
void commandBackward(PIData package, Motor left, Motor right)
{
  int i = 0;
  unsigned long start = millis();
  unsigned long turntime = 100;
  while(millis() - start < turntime)
  {
    Left(left, right, 150);
  }
  while (i < package.distance)
    {
      readLaser();
      i++;
    }  
  Halt(left, right);  
}

void commandRight(PIData package, Motor left, Motor right)
{
  int i = 0;
  unsigned long start = millis();
  unsigned long turntime = 50;
  while(millis() - start < turntime)
  {
    Right(left, right, 150);
  }
  while (i < package.distance)
    {
      readLaser();
      i++;
    } 
  Halt(left, right);   
}

void commandLeft(PIData package, Motor left, Motor right)
{
  int i = 0;
  unsigned long start = millis();
  unsigned long turntime = 50;
  while(millis() - start < turntime)
  {
    Left(left, right, 150);
  }
  while (i < package.distance)
    {
      readLaser();
      i++;
    }  
  Halt(left, right);  
}

void commandHalt(PIData package, Motor left, Motor right)
{
  unsigned long start = millis();
  unsigned long halttime = package.distance * 1000;
  if(package.distance == 1)
  {
    while(!Serial.available())
    {
      //do nothing
    }
  }
  else
  {
    while(millis() - start < halttime)
    {
      Halt(left, right);
    }
  }
}

void record(Microphone &a, Microphone &b)
{
  a.record();
  b.record();
}

void storeAmplitude(Microphone &a, Microphone &b)
{
  a.storeMax();
  b.storeMax();
}
