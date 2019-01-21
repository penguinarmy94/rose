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

//-115.625

const float distToPWM = 75/125;
int slowDownSpeed;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
//  
  pinMode(a, OUTPUT);
  pinMode(b, OUTPUT);
  pinMode(c, OUTPUT);
  pinMode(d, OUTPUT);
}

void loop() {
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW); 
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
  cm = ultraSonic();
  Serial.println(cm);
  if (cm > 100 || cm < 0)
    {
      forward();
      analogWrite(ena, 115);
      analogWrite(enb, 115);
    }
  else if (cm <= 15)
    {
      analogWrite(ena, 0);
      analogWrite(enb, 0);
      left();
      delay(50);
      
    }
  else
    {
      slowDownSpeed = distance * (40/75) + (185/3);
      forward();
      analogWrite(ena, slowDownSpeed);
      analogWrite(enb, slowDownSpeed);

    }
}

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
  analogWrite(ena, 200);
  analogWrite(enb, 200);

}

void right()
{
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW);
  digitalWrite(c, LOW);
  digitalWrite(d, HIGH);
  analogWrite(ena, 200);
  analogWrite(enb, 200);  
}


void left()
{
  digitalWrite(a, LOW);
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
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
