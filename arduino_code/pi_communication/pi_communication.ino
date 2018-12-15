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
char fromPi[10];
char test[24] = {'f', '1', '2', '4', '8', '-', 'l', '2', '1', '6', '7', '-', 'b', '0', '9', '2', '7', '-', 'r', '1', '2', '4', '8', '-'};
int testindex;
struct PIData {
  char direction;
  int distance;
  };

PIData sample;  

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
      if(Serial.available()){
        extractPackage(sample);
      }

      if (sample.direction == 'F')
        {
          forward();
          delay(sample.distance);
          sample.direction = 'A';
          halt();
        }
      else if (sample.direction == 'B')
        {
          right();
          delay(715);
          forward();
          delay(sample.distance);
          sample.direction = 'A';

          halt();
        }
      else if (sample.direction == 'R')
        {
          right();  
          delay(250);
          forward();
          delay(sample.distance);
          sample.direction = 'A';

          halt();
        }
      else if (sample.direction == 'L')
        {
          left();  
          delay(250);
          forward();
          delay(sample.distance);
          sample.direction = 'A';

          halt();
        }

        delay(2000);
      
}

void forward()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
  analogWrite(ena, 175);
  analogWrite(enb, 175);
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
  analogWrite(ena, 150);
  analogWrite(enb, 150);  
}


void left()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
  digitalWrite(c, LOW);
  digitalWrite(d, HIGH);

  analogWrite(ena, 150);
  analogWrite(enb, 150);  
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
      Serial.print("0");
    }
  else
    {
      slowDownSpeed = (distance-25) * distToPWM;
      analogWrite(ena, slowDownSpeed);
      analogWrite(enb, slowDownSpeed);

    }
}

int getDistanceFromPi()
{
  //fromPi = Serial.read();
  //Will be used during actual run of code
  int n = test[0] - '0';
  int x = 1;
  while (test[x] != '-')
    {
      n *= 10;
      n += test[x] - '0';
      x++;
    }
  return n;  
}

void extractPackage(PIData &package)
{
  Serial.readBytesUntil('-', fromPi, 10); 
  package.direction = fromPi[0];
  int dist = 0;
  int i = 1;
  while(fromPi[i] >= '0' && i < 10)
    {
      dist *= 10;
      dist += (fromPi[i] - '0');
      i++;
    }
    package.distance = dist;
  for (int j = 0; j < 10; j++)
    {
      fromPi[j] = 0;  
    }
}
