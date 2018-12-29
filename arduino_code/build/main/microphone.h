#ifndef Microphone_h
#define Microphone_h

#include "Arduino.h"

class Microphone
{
  public:
    Microphone(int Input);
    void record();
    void clearBuffer();
    int getMax();
    

  private:
    int kBuffer[10];
    int kInputPin;
    int kCounter;
};

#endif