#include "Motor.h"
#include "Microphone.h"

Motor left(12, 13, 11);
Motor right(7, 8, 9);
void setup() 
{
Serial.begin(9600);
}

void loop()
{
Serial.println("Hello from ROSE");
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
