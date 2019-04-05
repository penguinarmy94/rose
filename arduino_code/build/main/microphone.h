#ifndef Microphone_h
#define Microphone_h

#include "Arduino.h"

class Microphone
{
  public:
    Microphone(int Input);

    //Main Functions
    unsigned int record();
    void storeIntoBuffer();
    void clearBuffer();

    //Calibration - Unused for the time being as differential more or less removes bias
    void storeCalibrationValue(unsigned int value);
    unsigned int getCalibrationValue();

    //Maximum Amplitude Acquisition
    unsigned int getMax();
    void resetAmplitude();

    //Debugging
    unsigned int debugSound();

  private:
    //Arduino Input
    int kInputPin;

    //Storing Values of Sound
    unsigned int kBuffer[20];
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
