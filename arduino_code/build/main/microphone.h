#ifndef Microphone_h
#define Microphone_h

#include "Arduino.h"

class Microphone
{
  public:
    Microphone(int Input);
    int record();
    void storeIntoBuffer(int soundValue);
    void clearBuffer();
    void setCalibrationValue(int value);
    int testMic();
    int getCalibrationValue();
    int getMax();
    

  private:
    int kBuffer[10];
    int kInputPin;
    int kCounter;
    int kCalibrationValue;
};

#endif
