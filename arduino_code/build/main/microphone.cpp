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
	if(sample > kHighest) kHighest = sample; //Get highest value in time period
  if(sample < kLowest) kLowest = sample; //Get lowest value in time period
}

void Microphone::storeIntoBuffer()
{
  kBuffer[kCounter] = kHighest - kLowest; //Value stored is the difference between the highest value and lowest value of time period
  //Amplitude of sound is directly proportional to the difference between highest and lowest
  kCounter = (kCounter == 199) ? 0 : kCounter + 1; //Loop buffer back to 0 when max value is reached
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
  //Range from an ADC input is 10 bits -> 1023
  kHighest = 0; //Guarantees value will change on first analogRead
  kLowest = 1023; //Guarantees value will change on first analogRead
}

unsigned int Microphone::debugSound()
{
  return kBuffer[(kCounter-1)%bufferSize];
}
