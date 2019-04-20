#include "Microphone.h"
#include "Arduino.h"

Microphone::Microphone(int Input)
{
	kInputPin = Input;
  kMax = 0;
  kCalibrationValue = 0;
  resetAmplitude();
}

unsigned int Microphone::record()
{
  unsigned int sample = analogRead(kInputPin);
	if(sample > kHighest) kHighest = sample; //Get highest value in time period
  if(sample < kLowest) kLowest = sample; //Get lowest value in time period
}

void Microphone::storeMax()
{
  unsigned int soundValue = kHighest - kLowest;
  kMax = (soundValue > kMax) ? soundValue : kMax;
  resetAmplitude();
}

void Microphone::storeCalibrationValue(unsigned int value)
{
  kCalibrationValue = value;
}

unsigned int Microphone::getCalibrationValue()
{
  return kCalibrationValue;
}

unsigned int Microphone::getMax()
{
	unsigned int maxSound = kMax;
  kMax = 0;
  resetAmplitude();
	return kMax;
}

void Microphone::resetAmplitude()
{
  //Range from an ADC input is 10 bits -> 1023
  kHighest = 0; //Guarantees value will change on first analogRead
  kLowest = 1023; //Guarantees value will change on first analogRead
}

unsigned int Microphone::debugSound()
{
  return kMax;
}
