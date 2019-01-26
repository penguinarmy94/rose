#ifndef laserSensor_h
#define laserSensor_h

class LaserSensor {
  private:
    int number;
    int stopValue;
    int slowValue;
    int freeValue;
    void init();
  public:
    LaserSensor();
    //LaserSensor(int);
    //LaserSensor(int, int);
    setNumber(int);
    setLongRange();
    setHighSpeed();
    setHighAccuracy();
    setLongRange(int);
    setHighSpeed(int);
    setHighAccuracy(int);
    setStopValue(int);
    setSlowValue(int);
    setFreeValue(int);
    //setSensorGroup(int, int []);
    int getValue(int);
    int getState(int);
    int getState();
    getSensorGroup(int);
};

#endif