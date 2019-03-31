#ifndef Microphone_h
#define Microphone_h

#include "Arduino.h"

class Microphone
{
  public:
    Microphone(int Input);
    unsigned int record();
    void storeIntoBuffer();
    void clearBuffer();
    void storeCalibrationValue(unsigned int value);
    unsigned int getCalibrationValue();
    unsigned int getMax();
    void resetAmplitude();
    unsigned int debugSound();

  private:
    //Arduino Input
    int kInputPin;

    //Storing Values of Sound
    unsigned int kBuffer[200];
    int kCounter;
    int kMaxHold;

    //Calibration
    int kCalibrationValue;

    //Getting Amplitude
    unsigned int kLowest;
    unsigned int kHighest;

    //Size of Buffer
    const int bufferSize = sizeof(kBuffer) / sizeof(kBuffer[0]);
};

#endif
