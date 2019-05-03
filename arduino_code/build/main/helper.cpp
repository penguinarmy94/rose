#include "helper.h"

void Forward(Motor left, Motor right, int speed)
{
  left.setForward(speed);
  right.setForward(speed);
}

//Unused but added for completeness
void Backward(Motor left, Motor right, int speed)
{
  left.setReverse(speed);
  right.setReverse(speed);
  delay(100);
  left.halt();
  right.halt();
}

void Left(Motor left, Motor right, int speed)
{
  right.setForward(speed);
  left.setReverse(speed);
}

void Right(Motor left, Motor right, int speed)
{
  right.setReverse(speed);
  left.setForward(speed);
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
  Serial.print(package.direction);
  Serial.print(package.distance);
  switch(package.direction)
  {
    case 'Y': warningDetected(package.distance, a, b, left, right);
    sendAck();
    break;
    case 'C': calibrateMicrophones(a, b);
    sendAck();
    break;
    case 'F': commandForward(package, left, right);
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

void warningDetected(int time, Microphone &a, Microphone &b, Motor left, Motor right)
{
  unsigned int aMax = a.getMax();
  unsigned int bMax = b.getMax();
  unsigned long start = millis();
  (aMax > bMax) ? Right(left, right, 175) : Left(left, right, 175); 
  delay(1000);
  Halt(left, right);
  while(millis() - start < (time * 1000))
  {
    readLaser();
  }
  Halt(left, right);  
}

void commandForward(PIData package, Motor left, Motor right)
{
  int i = 0;
  Forward(left, right, MOTOR_MAX_SPEED);
  unsigned long start = millis();
  if(package.distance == 0)
  {
    Halt(left, right);
    sendAck();
  }
  else
  {
    while (millis() - start < (package.distance * 1000))
    {
      getSoundSample(a, b, micTime, sampleTime);
      readLaser();
    }
    sendAck();  
    while(!Serial.available())
    {
      getSoundSample(a, b, micTime, sampleTime);
      readLaser();
    }  
  }
}

//Most likely not used but brought in for completeness
void commandBackward(PIData package, Motor left, Motor right)
{
  unsigned long start = millis();
  unsigned long turntime = 100;
  while(millis() - start < turntime)
  {
    Left(left, right, 255);
  }
  while (millis() - start < (package.distance * 1000))
    {
      getSoundSample(a, b, micTime, sampleTime);
      readLaser();
    }  
  Halt(left, right);  
}

void commandRight(PIData package, Motor left, Motor right)
{
  unsigned long start = millis();
  while(millis() - start < (package.distance * 1000))
  {
    Right(left, right, 255);
  }
  Halt(left, right);   
}

void commandLeft(PIData package, Motor left, Motor right)
{
  unsigned long start = millis();
  while(millis() - start < (package.distance * 1000))
  {
    Left(left, right, 255);
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
      getSoundSample(a, b, micTime, sampleTime);
    }
  }
  else
  {
    while(millis() - start < halttime)
    {
      getSoundSample(a, b, micTime, sampleTime);
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

void getSoundSample(Microphone &a, Microphone &b, unsigned long &micTime, unsigned long sampleWindow)
{
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
