#include "Motor.h"

Motor left(12, 13, 11);
Motor right(7, 8, 9);
void setup() {

}

void loop() {
  Forward(left, right, 150);
  delay(1000);
  Halt(left, right);
  delay(1000);
  Backward(left, right, 150);
  delay(1000);
  Halt(left, right);
  delay(1000);
  Left(left, right, 150);
  delay(1000);
  Halt(left, right);
  delay(1000);
  Right(left, right, 150);
  delay(1000);

}

void Forward(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.forward(speed);
}

void Backward(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.backward(speed);
}

void Left(Motor left, Motor right, int speed)
{
  left.backward(speed);
  right.forward(speed);
}

void Right(Motor left, Motor right, int speed)
{
  left.forward(speed);
  right.backward(speed);
}

void Halt(Motor left, Motor right)
{
  left.halt();
  right.halt();
}
