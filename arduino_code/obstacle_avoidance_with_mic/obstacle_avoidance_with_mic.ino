//H-Bridge Functions
const int a = 7;
const int b = 8;
const int c = 12;
const int d = 13;
const int ena = 9; //right
const int enb = 11; //left

//US Sensor
const int echoPin1 = 2;
const int trigPin1 = 3;
const int echoPin2 = 4;
const int trigPin2 = 5;
int duration;
int distance;
int cm;

int leftdist;
int rightdist;

int slowDownLeft;
int slowDownRight;

//Microphone
const int leftmic = 0;
const int rightmic = 5;
int leftsound;
int rightsound;

void setup() {
  //Serial.begin(9600);
  pinMode(trigPin1, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin1, INPUT); // Sets the echoPin as an Input
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
//  
  pinMode(a, OUTPUT);
  pinMode(b, OUTPUT);
  pinMode(c, OUTPUT);
  pinMode(d, OUTPUT);
}

void loop() {
//leftsound = analogRead(leftmic);
//rightsound = analogRead(rightmic);
leftsound = 0;
rightsound = 0;
//Serial.println(leftmic);
//Serial.println(rightmic);
//Serial.println("------");

if (leftsound > 300 || rightsound > 300)
{
  if (leftsound > rightsound)
  {
    left();
  }

  else
  {
    right();
  }
}

else
{  
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW); 
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
  rightdist = ultraSonic(echoPin2, trigPin2);
  leftdist = ultraSonic(echoPin1, trigPin1);

  if (leftdist > 150 || leftdist < 0)
    {
      forwardright();
      analogWrite(ena, 100);
    }
  else if (leftdist < 50)
    {
      right();
    }
  else
    {
      slowDownRight = map(leftdist, 50, 150, 70, 100); 
      analogWrite(ena, slowDownRight);
    }

  if (rightdist > 150 || rightdist < 0)
    {
      forwardleft();
      analogWrite(enb, 100);
    }
  else if (rightdist < 50)
    {
      left();   
    }    
  else
    {
      forwardleft();
      slowDownLeft = map(rightdist, 50, 150, 70, 100);
      analogWrite(enb, slowDownLeft);
    }  
}     
  delay(50);  
}

void forwardleft()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
}

void forwardright()
{
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);  
}

void backwardleft()
{
  digitalWrite(a, LOW);
  digitalWrite(b, HIGH);
}

void backwardright()
{

  digitalWrite(c, LOW);
  digitalWrite(d, HIGH);  
}

void right()
{
  backwardleft();
  forwardright();
  analogWrite(ena, 100);
  analogWrite(enb, 100);
  delay(400);
  analogWrite(ena, 0);
  analogWrite(enb, 0);
}

void left()
{
  backwardright();
  forwardleft();
  analogWrite(ena, 100);
  analogWrite(enb, 100);
  delay(400);
  analogWrite(ena, 0);
  analogWrite(enb, 0);
}

int ultraSonic(int echoPin, int trigPin)
{
  // Clears the trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  // Calculating the distance
  distance= duration*0.034/2;
  return distance;
}
