#include "Arduino.h"
#include "Motor.h"

Motor::Motor(int lowIn, int highIn, int en)
{
  pinMode(lowIn, OUTPUT);
  pinMode(highIn, OUTPUT);
  pinMode(en, OUTPUT);
  kLowIn = lowIn;
  kHighIn = highIn;
  kEn = en;
}

void Motor::forward(int speed)
{
  digitalWrite(kLowIn, HIGH);
  digitalWrite(kHighIn, LOW);
  analogWrite(kEn, speed);
}

void Motor::backward(int speed)
{
  digitalWrite(kLowIn, LOW);
  digitalWrite(kHighIn, HIGH);
  analogWrite(kEn, speed);
}

void Motor::halt()
{
  analogWrite(kEn, 0); //Low and Hi pins are irrelevant
}
