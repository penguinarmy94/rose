#ifndef motor_h
#define motor_h

#include "Arduino.h"

#define MOTOR_LEFT_IN1 4
#define MOTOR_LEFT_IN2 3
#define MOTOR_LEFT_EN 2

#define MOTOR_RIGHT_IN1 6
#define MOTOR_RIGHT_IN2 5
#define MOTOR_RIGHT_EN 7

#define MOTOR_MIN_SPEED 225
#define MOTOR_MAX_SPEED 255
#define MOTOR_TURN_CLOCKWISE 1
#define MOTOR_TURN_COUNTERCLOCKWISE -1
#define MOTOR_TURN_PREFERRED_DIRECTION MOTOR_TURN_CLOCKWISE
#define MOTOR_PREFERRED_TURN_ANGLE 90
#define MOTOR_ANGLE_PER_ITERATION 1
#define MOTOR_TURN_DELAY 3
#define MOTOR_TURN_DURATION 1000

class Motor
{
    private:
    //Each variable correlates to a pin
    int kIn1;
    int kIn2;
    int kEn;
    int speed;
    
  public:
    Motor(int lowIn, int highIn, int en);
    void setForward();
    void setForward(int speed);
    void setReverse();
    void setReverse(int speed);
    void setSpeed(int speed);
    int getSpeed();
    void halt();
};

#endif
