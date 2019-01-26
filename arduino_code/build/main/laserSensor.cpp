#include "laserSensor.h"
#include <Wire.h>
#include <VL53L0X.h>

// Default constructor
LaserSensor::LaserSensor() {
  this->number = 1;
  this->stopValue = 50;
  this->slowValue = 250;
  this->freeValue = 8190;
  }

// Set the number of sensors to be monitored
LaserSensor::setNumber(int number) {
  this->number = number;
  this->init();
}

// Set long rsnge reading for all sensors. This increases the sensitivity of the sensor and 
// extends its potential range, but increases the likelihood of getting an inaccurate reading 
// because of reflections from objects other than the intended target. It works best in dark conditions.
LaserSensor::setLongRange() {

 for (int i = 0; i < this->number; i++) {
  // lower the return signal rate limit (default is 0.25 MCPS)
  sensor[i].setSignalRateLimit(0.1);
  // increase laser pulse periods (defaults are 14 and 10 PCLKs)
  sensor[i].setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
  sensor[i].setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);
  }
}

// Set high speed reading for all sensors. High speed comes at the cost of accuracy. High speed and high accuracy
// are mutually exclusive.
LaserSensor::setHighSpeed() {

 for (int i = 0; i < this->number; i++) {
    // reduce timing budget to 20 ms (default is about 33 ms)
    sensor[i].setMeasurementTimingBudget(20000);    
  }
}

// Set high accuracy reading for all sensors. High accuracy comes at the cost of speed. High accuracy and high speed
// are mutually exclusive.
LaserSensor::setHighAccuracy() {

 for (int i = 0; i < this->number; i++) {
  // increase timing budget to 200 ms
  sensor[i].setMeasurementTimingBudget(200000);
  }
}

// Set long range reading for a particular sensor. This increases the sensitivity of the sensor and 
// extends its potential range, but increases the likelihood of getting an inaccurate reading 
// because of reflections from objects other than the intended target. It works best in dark conditions.
LaserSensor::setLongRange(int number) {

  if (number <= this->number) {
    // lower the return signal rate limit (default is 0.25 MCPS)
    sensor[number].setSignalRateLimit(0.1);
    // increase laser pulse periods (defaults are 14 and 10 PCLKs)
    sensor[number].setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
    sensor[number].setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14); 
  }
}

// Set high speed reading for a particular sensor. High speed comes at the cost of accuracy. High speed and high accuracy
// are mutually exclusive.
LaserSensor::setHighSpeed(int number) {

  if (number <= this->number) {
    // reduce timing budget to 20 ms (default is about 33 ms)
    sensor[number].setMeasurementTimingBudget(20000);    
  }
}

// Set high accuracy reading for a particular sensor. High accuracy comes at the cost of speed. High accuracy and high speed
// are mutually exclusive.
LaserSensor::setHighAccuracy(int number) {

  if (number <= this->number) {
    // increase timing budget to 200 ms
    sensor[number].setMeasurementTimingBudget(200000);    
  }
}

// A value <= the stop value (in mm) is interpreted as sensor being blocked.
LaserSensor::setStopValue(int stopValue) {
  this->stopValue = stopValue;
}

// A value between the stop value and the slow value (in mm) is interpreted as an obstacle is near.
LaserSensor::setSlowValue(int slowValue) {
  this->slowValue = slowValue;
}

// A value less than the free value (in mm) means that we are sensing an obstacle but it is still far enough to not adjust behavior.
LaserSensor::setFreeValue(int freeValue) {
  this->freeValue = freeValue;
}

// Initializer the sensor array
void LaserSensor::init() {
  
  // Reset all sensors by setting their XSHUT pins low
  for (int i = 0; i < number; i++) {
    pinMode(pinXShut[i], OUTPUT);
  } 

  // Set sensor i2c address by setting XSHUT pin to high  
  for (int i = 0; i < this->number; i++) {
    pinMode(pinXShut[i], INPUT);
    delay(10);
    sensor[i].setAddress(40+i);
    sensor[i].init();
    sensor[i].setTimeout(500);
    sensor[i].startContinuous();
  } 
}

// The getValue function return the raw numeric reading from a particular sensor or
//
// -2 = Timeout occured on sensor 
// -1 = Invalid sensor number
//
int LaserSensor::getValue(int number) {
  
  int value = -1;
  
  if (number <= this->number) {
    value = sensor[number].readRangeSingleMillimeters();
    if (sensor[number].timeoutOccurred()) value = -2;
  }

  return value;
}

// The sensor=specific getState function return a state value for a particular sensor where
//
// -2 = Timeout occured on sensor 
// -1 = Invalid sensor number
//  0 = notblocked
//  1 = blocked
//  2 = near an oject (may be used as a signal to slow down)
//  3 = Object seen but farther than distance required for slowing down
//
int LaserSensor::getState(int number) {

  int state = -1;
  
  if (number <= this->number) {
    int value = sensor[number].readRangeSingleMillimeters();
    if (sensor[number].timeoutOccurred()) state = -2;
    else if (value <= this->stopValue) state = 1;
    else if (value <=  this->slowValue) state = 2;
    else if (value <  this->freeValue) state = 3;
    else state = 0;
  }
 
  return state;
}

// The getState function returns a binary representation of all sensors where 
//
// 0 = Sensor is not detecting an object within the stop distsance
// 1 = Sensor is detecting an object within the stop distsance
//
// Values are shifted left so that a return value of 2 = 10(b) indicates that
// sensor 1 is blocked (1) and sensor 2 is free (0)
//
int LaserSensor::getState() {
  
  int state = 0;

  for (int i = 0; i < this->number; i++) {
    state <<= 1;
    if (!sensor[i].timeoutOccurred() && sensor[i].readRangeSingleMillimeters() <= this->stopValue) {
      state |= 1;
    }
  }

  return state;
  }