#include "Microphone.h"
#include "Arduino.h"

Microphone::Microphone(int Input)
{
	kInputPin = Input;
	kCounter = 0;
  kCalibrationValue = 0;
  resetAmplitude();
}

unsigned int Microphone::record()
{
  unsigned int sample = analogRead(kInputPin);
	if(sample > kHighest) kHighest = sample;
  if(sample < kLowest) kLowest = sample;
}

void Microphone::storeIntoBuffer()
{
  kBuffer[kCounter] = kHighest - kLowest;
  kCounter = (kCounter == 199) ? 0 : kCounter + 1;
  kHighest = 0;
  resetAmplitude();
}

void Microphone::clearBuffer()
{
	memset(kBuffer, 0, sizeof(kBuffer));
	kCounter = 0;
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
	int max = 0;
	for (int i = 0; i < bufferSize; i++)
	{
		max = (max > kBuffer[i]) ? max : kBuffer[i];
	}
  resetAmplitude();
	return max;
}

void Microphone::resetAmplitude()
{
  kHighest = 0;
  kLowest = 1024;
}

unsigned int Microphone::debugSound()
{
  return kBuffer[(kCounter-1)%bufferSize];
}
