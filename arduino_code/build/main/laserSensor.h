#ifndef laserSensor_h
#define laserSensor_h

#include "Arduino.h"
#include "Adafruit_VL53L0X.h"

class LaserSensor {
  private:
    uint8_t address;
    int xshut;
    Adafruit_VL53L0X lox;
    VL53L0X_RangingMeasurementData_t measure;
  public:
    LaserSensor(uint8_t i2c_address, int xshutpin);
    void init();
    bool setAddress();
    int getDistance();
};

#endif
