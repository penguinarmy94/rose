#ifndef Microphone_h
#define Microphone_h

#include "Arduino.h"

class Microphone
{
  public:
    Microphone(int Input);
    unsigned int record();
    void storeIntoBuffer(int soundValue);
    void clearBuffer();
    void setCalibrationValue(int value);
    unsigned int testMic();
    unsigned int getCalibrationValue();
    unsigned int getMax();
    

  private:
    int kBuffer[10];
    int kInputPin;
    int kCounter;
    int kCalibrationValue;
};

#endif
