#include "Arduino.h"
#include "motor.h"

#define MOTOR_MIN_SPEED 80
#define MOTOR_MAX_SPEED 255

Motor::Motor(int in1, int in2, int en)
{
  kIn1 = in1;
  kIn2 = in2;
  kEn = en;
  speed = 0;
  
  pinMode(in2, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(en, OUTPUT);
  
}

void Motor::setForward()
{
  digitalWrite(kIn1, LOW);
  digitalWrite(kIn2, HIGH);
  this->halt();
}

void Motor::setForward(int speed)
{
  digitalWrite(kIn1, LOW);
  digitalWrite(kIn2, HIGH);
  this->setSpeed(speed);
}

void Motor::setReverse()
{
  digitalWrite(kIn1, HIGH);
  digitalWrite(kIn2, LOW);
  this->halt();
}

void Motor::setReverse(int speed)
{
  digitalWrite(kIn1, HIGH);
  digitalWrite(kIn2, LOW);
  this->setSpeed(speed);
}

void Motor::halt()
{
  this->setSpeed(0);
}

void Motor::setSpeed(int speed) {

  if (speed < MOTOR_MIN_SPEED) 
    speed = 0;
  else if (speed > MOTOR_MAX_SPEED)
    speed = MOTOR_MAX_SPEED;
    
  this->speed = speed;
  analogWrite(kEn, speed);
}

int Motor::getSpeed() {
  return this->speed;
}
