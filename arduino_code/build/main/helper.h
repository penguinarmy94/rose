#ifndef PI_INSTRUCTION_H_
#define PI_INSTRUCTION_H_

#include "Arduino.h"
#include "Motor.h"
#include "Microphone.h"

struct PIData {
  char direction;
  int distance;
  };

// Motor Functions //
void Forward(Motor left, Motor right, int speed);
void Backward(Motor left, Motor right, int speed);
void Left(Motor left, Motor right, int speed);
void Right(Motor left, Motor right, int speed);
void Halt(Motor left, Motor right);

// PI Command Parse Functions //
void calibrateMicrophones(Microphone &a, Microphone &b);
int getDistance(char arr[]);
void parsePackage(PIData &package);

// Parsing Data Functions //
void commandFromPi(PIData &package, Microphone &a, Microphone &b, Motor left, Motor right);
void warningDetected(Microphone &a, Microphone &b, Motor left, Motor right);
void commandForward(PIData package, Motor left, Motor right);
void commandBackward(PIData package, Motor left, Motor right);
void commandRight(PIData package, Motor left, Motor right);
void commandLeft(PIData package, Motor left, Motor right);



#endif
