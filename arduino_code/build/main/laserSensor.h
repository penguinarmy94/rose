#ifndef laserSensor_h
#define laserSensor_h

#include "VL53L0X.h"

#define BLOCKED B1
//#define BLOCKED_RIGHT B01
//#define BLOCKED_LEFT B10

#define SENSORS 1
#define START_ADDRESS 40

class LaserSensor {
  private:
    int number;
    int stopValue;
    int slowValue;
    int freeValue;
    void init();
    int pinXShut[SENSORS] = {2};
    VL53L0X sensor[SENSORS];
    
  public:
    LaserSensor();
    //LaserSensor(int);
    //LaserSensor(int, int);
    void setNumber(int number);
    void setLongRange();
    void setHighSpeed();
    void setHighAccuracy();
    void setLongRange(int number);
    void setHighSpeed(int number);
    void setHighAccuracy(int number);
    void setStopValue(int number);
    void setSlowValue(int number);
    void setFreeValue(int number);
    //setSensorGroup(int, int []);
    int getValue(int number);
    int getState(int number);
    int getState();
    int getSensorGroup(int number);
};

#endif
