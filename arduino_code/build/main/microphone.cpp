#include "Microphone.h"
#include "Arduino.h"

Microphone::Microphone(int Input)
{
	kInputPin = Input;
	kCounter = 0;
}

int Microphone::record()
{
	int rawAmplitude;
	int trueAmplitude;
	rawAmplitude = analogRead(kInputPin);
	trueAmplitude = map(rawAmplitude, 184, 430, 0, 1023);
	return trueAmplitude;
	
}

void Microphone::storeIntoBuffer(int soundValue)
{
  kBuffer[kCounter] = soundValue;
  kCounter = (kCounter == 9) ? 0 : kCounter + 1;
  
}

void Microphone::clearBuffer()
{
	for (int i = 0; i < 10; i++)
	{
		kBuffer[i] = 0;
	}
	kCounter = 0;
}

int Microphone::getMax()
{
	int max;
	for (int i = 0; i < 10; i++)
	{
		max = (max > kBuffer[i]) ? max : kBuffer[i];
	}
	return max;
}
