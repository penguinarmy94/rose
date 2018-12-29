#include "Microphone.h"
#include "Arduino.h"

Microphone::Microphone(int Input)
{
	kInputPin = Input;
	kCounter = 0;
}

void Microphone::record()
{
	int max;
	int rawAmplitude;
	int trueAmplitude;
	for (int i = 0; i < 1000; i++)
	{
		rawAmplitude = analogRead(kInputPin);
		trueAmplitude = map(rawAmplitude, 184, 430, 0, 1023);
		max = (trueAmplitude > max) ? trueAmplitude : max;
	}
	kBuffer[kCounter] = max;
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
