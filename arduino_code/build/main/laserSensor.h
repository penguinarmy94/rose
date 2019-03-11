#ifndef laserSensor_h
#define laserSensor_h

#include "VL53L0X.h"


#define BLOCKED_FRONT B100 //Will eventually change to inclue the up and down sensor
#define BLOCKED_RIGHT B001
#define BLOCKED_LEFT B010

#define FRONT_UP_SENSOR 3
#define FRONT_SENSOR 0 //refers to index on pinXShut
#define LEFT_SENSOR 1
#define RIGHT_SENSOR 2

#define SENSORS 3
#define START_ADDRESS 40

class LaserSensor {
  private:
    int number;
    int stopValue;
    int slowValue;
    int freeValue;
    void init();
    int pinXShut[SENSORS] = {3, 4, 2};
    VL53L0X sensor[SENSORS];
    
  public:
    LaserSensor();
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
    int getValue(int number);
    int getState(int number);
    int getState();
    int getSensorGroup(int number);
};

#endif
