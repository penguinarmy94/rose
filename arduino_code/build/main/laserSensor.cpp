#include "laserSensor.h"

LaserSensor::LaserSensor(uint8_t i2c_address, int xshutpin) : address(i2c_address), xshut(xshutpin)
{
}

void LaserSensor::init()
{
  pinMode(xshut, OUTPUT);
  digitalWrite(xshut, LOW);
  delay(10);
  digitalWrite(xshut, HIGH);
  digitalWrite(xshut, LOW);
}

bool LaserSensor::setAddress()
{
  digitalWrite(xshut, HIGH);
  return lox.begin(address);
}

int LaserSensor::getDistance()
{
  lox.rangingTest(&measure, false); //set to true for debugging
  return (measure.RangeStatus != 4) ? measure.RangeMilliMeter : 1201;
}
