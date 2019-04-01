#include "laserSensor.h"
#include "Wire.h"
#include "VL53L0X.h"
#include "helper.h"



//#define FRONTPRIORITY
#define TURNBASED
//#define STOPPED
  
Motor left(8, 7 , 6); //7, 8, 6
Motor right(9, 10, 11); //10, 9, 11
Microphone a(3);
Microphone b(5);
LaserSensor lasersensor;
int aMax;
int aSample;
int bSample;
int bMax;
char fromPi[10];
int count;
int state;
PIData piCommand;
int i = 0;
int turn;

LaserSensor laserSensor;
int waitSensor = 0;
int turning = 0;
int wait = 0;

const unsigned long sampleWindow = 50;
unsigned long micTime;
unsigned long debugTime;

unsigned long turntimer;
bool turnflag;


void setup() 
{
Serial.begin(9600); //Unusued in project. Mainly for debugging purposes.
//Serial1.begin(9600);
Wire.begin();
a.clearBuffer();
b.clearBuffer();
laserSensor.setNumber(SENSORS);
laserSensor.setHighAccuracy();
debugTime = millis();
pinMode(2, OUTPUT);
pinMode(4, OUTPUT);
turnflag = false;
}

void loop()
{
//readLaser();
if (!Serial.available())
{
  micTime = millis();
  while(millis() - micTime < sampleWindow)
  {
    record(a, b);
  }
  storeAmplitude(a, b);
  if(millis() - debugTime > 500)
  {
    if(a.getMax() > b.getMax()){
      digitalWrite(2, HIGH);
      digitalWrite(4, LOW);
    }
    else if(b.getMax() > a.getMax())
    {
      digitalWrite(4, HIGH);
      digitalWrite(2, LOW);
    }
    else
    {
      digitalWrite(2, HIGH);
      digitalWrite(4, HIGH);
    }
    debugTime = millis();
  }
}
else
{
  parsePackage(piCommand);
  commandFromPi(piCommand, a, b, left, right);
  
}
}

bool checkSensors(unsigned long &time, bool leftsensor, int &prev, int &next, bool checkprev, bool &checknext)
{
    bool result = false;
  if(!checkprev)
  {
  prev = (leftsensor) ? laserSensor.getValue(LEFT_SENSOR) : laserSensor.getValue(RIGHT_SENSOR);
  checknext = false;
  time = millis();
  }
  
  else if (millis() - time > 100)
  {
  next = (leftsensor) ? laserSensor.getValue(LEFT_SENSOR) : laserSensor.getValue(RIGHT_SENSOR);
  checkprev = false;
  result = (next > prev);
  }
  
  return result;
}


void readLaser() {
  Forward(left, right, 150);
  state = laserSensor.getState();
  #ifdef FRONTPRIORITY 
  if (state)
  {
    if (BLOCKED_FRONT & state)
    {
      turn = (laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR)) ? 1: 0; //1 for left, 0 for right
      while (laserSensor.getState() & BLOCKED_FRONT)
      {
        (turn) ? Right(left, right, 175) : Left(left, right, 175);
        delay(100);
      }
    }
    else if (BLOCKED_LEFT & state)
    {
      Left(left, right, 175);
    }
    else
    {
      Right(left, right, 175);
    }
  }
  delay(100);
  #endif

  #ifdef STOPPED
  if (state)
  {
    Halt(left, right);
    delay(930);
    int leftblock = laserSensor.getValue(LEFT_SENSOR);
    delay(70);
    int rightblock = laserSensor.getValue(RIGHT_SENSOR);
    if (leftblock < rightblock) {
      Right(left, right, 225);
      while(state & (BLOCKED_FRONT | BLOCKED_LEFT)){
        state = laserSensor.getState();
        delay(70);
      }
      Halt(left, right);
    }
    else
    {
      Left(left, right, 225);
      while(state & (BLOCKED_FRONT | BLOCKED_RIGHT)){
        state = laserSensor.getState();
        delay(70);
      }
      Halt(left, right);     
    }   
  }
  delay(70);
  #endif
  
  #ifdef TURNBASED
  bool checkprev;
  bool checknext;
  bool turnleftsensor;
  int prev;
  int next;
  unsigned long time;
  
  state = laserSensor.getState(); 
  if(!turning & !state){
  Forward(left, right, 150);
  prev = -1;
  next = 0;
  }
  
  else
  { 
  if(!turning)
  {
    turnleftsensor = laserSensor.getValue(LEFT_SENSOR) < laserSensor.getValue(RIGHT_SENSOR);
    checkprev = false;
    checknext = false;
  }
  turning = true;
  (turnleftsensor) ? Right(left, right, 200) : Left(left, right, 200);
  if (checkSensors(time, turnleftsensor, prev, next, checkprev, checknext))
  {
    turning = false;
    checkprev = false;
    checknext = false;
  }
  }
#endif
}
