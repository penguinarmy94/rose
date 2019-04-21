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
extern bool moveRobot;

// Obstacle Avoidance //
extern void readLaser(); //Defined in main.ino

// PI Command Parse Functions //
void calibrateMicrophones(Microphone &a, Microphone &b);
int getDistance(char arr[]);
void parsePackage(PIData &package, char fromPi[], int size);
void sendAck();

// Microphone Functions //
void record(Microphone &a, Microphone &b);
void storeAmplitude(Microphone &a, Microphone &b);
void getSoundSample(Microphone &a, Microphone &b, unsigned long &micTime, unsigned long sampleWindow);
extern unsigned long micTime;
extern Microphone a;
extern Microphone b;
const unsigned long sampleTime = 50;

// Parsing Data Functions //
void commandFromPi(PIData &package, Microphone &a, Microphone &b, Motor left, Motor right);
void warningDetected(int time, Microphone &a, Microphone &b, Motor left, Motor right);
void commandForward(PIData package, Motor left, Motor right);
void commandBackward(PIData package, Motor left, Motor right);
void commandRight(PIData package, Motor left, Motor right);
void commandLeft(PIData package, Motor left, Motor right);
void commandHalt(PIData package, Motor left, Motor right);



#endif
