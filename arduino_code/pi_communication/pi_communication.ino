//H-Bridge Functions
const int a = 7;
const int b = 8;
const int c = 12;
const int d = 13;
const int ena = 9;
const int enb = 11;

//US Sensor
const int echoPin = 2;
const int trigPin = 3;
int duration;
int distance;
int cm;

const float distToPWM = 125/125;
int slowDownSpeed;

bool noObstacle = false;
char fromPi;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input  
  pinMode(a, OUTPUT);
  pinMode(b, OUTPUT);
  pinMode(c, OUTPUT);
  pinMode(d, OUTPUT);
}

void loop() {
  if(Serial.available())
    {
      fromPi = Serial.read();
      if (fromPi == 'f')
        {
          noObstacle = true;
          forward();
        }
      else if (fromPi == 'b')
        {
          noObstacle = true;
          right();
          delay(1000);  
        }
      else if (fromPi == 'r')
        {
          noObstacle = true;
          right();  
          delay(500);
        }
      else if (fromPi == 'l')
        {
          noObstacle = true;
          left();  
          delay(500);
        }
      
    }
      forward();  
      cm = ultraSonic();
      adjustSpeed(cm);

void forward()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
}

void backward()
{
  digitalWrite(a, LOW);
  digitalWrite(b, HIGH);
  digitalWrite(c, LOW);
  digitalWrite(d, HIGH);

}

void right()
{
  digitalWrite(a, LOW);
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
  analogWrite(ena, 200);
  analogWrite(enb, 200);  
}


void left()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
  digitalWrite(c, LOW);
  digitalWrite(d, HIGH);

  analogWrite(ena, 200);
  analogWrite(enb, 200);  
}

void halt()
{
  analogWrite(ena, 0);
  analogWrite(enb, 0);
}

int ultraSonic()
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

void adjustSpeed(int dist)
{
    if (dist > 150)
    {
      analogWrite(ena, 125);
      analogWrite(enb, 125);
    }
  else if (dist <= 25)
    {
      analogWrite(ena, 0);
      analogWrite(enb, 0);
      noObstacle = false;
      Serial.print("Obstacle Nearby :( GO FLYERS!!!!111!!!");
      Serial.println();
    }
  else
    {
      slowDownSpeed = (distance-25) * distToPWM;
      analogWrite(ena, slowDownSpeed);
      analogWrite(enb, slowDownSpeed);

    }
}
