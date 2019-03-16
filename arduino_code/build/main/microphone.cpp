#include "Microphone.h"
#include "Arduino.h"

Microphone::Microphone(int Input)
{
	kInputPin = Input;
	kCounter = 0;
  kCalibrationValue = 0;
}

unsigned int Microphone::record()
{
	return analogRead(kInputPin);
	
}

void Microphone::storeIntoBuffer(int soundValue)
{
  kBuffer[kCounter] = soundValue;
  kCounter = (kCounter == 9) ? 0 : kCounter + 1;
  
}

void Microphone::clearBuffer()
{
	memset(kBuffer, 0, sizeof(kBuffer));
	kCounter = 0;
}

unsigned int Microphone::testMic()
{
  return analogRead(kInputPin);
}

void Microphone::setCalibrationValue(int value)
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
	for (int i = 0; i < 10; i++)
	{
		max = (max > kBuffer[i]) ? max : kBuffer[i];
	}
	return max;
}
