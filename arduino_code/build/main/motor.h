#ifndef Motor_h
#define Motor_h

#include "Arduino.h"

class Motor
{
  public:
    Motor(int lowIn, int highIn, int en);
    void forward(int speed);
    void backward(int speed);
    void halt();

  private:
    //Each variable correlates to a pin
    int kLowIn;
    int kHighIn;
    int kEn;
};

#endif
