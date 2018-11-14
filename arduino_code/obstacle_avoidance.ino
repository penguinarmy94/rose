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

const float distToPWM = 75/125;
int slowDownSpeed;

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
  digitalWrite(a, HIGH);
  digitalWrite(b, LOW); 
  digitalWrite(c, HIGH);
  digitalWrite(d, LOW);
  cm = ultraSonic();
  if (cm > 150)
    {
      analogWrite(ena, 125);
      analogWrite(enb, 125);
    }
  else if (cm <= 25)
    {
      analogWrite(ena, 0);
      analogWrite(enb, 0);
      left();
      delay(25);
      
    }
  else
    {
      slowDownSpeed = (distance+35) * distToPWM;
      analogWrite(ena, slowDownSpeed);
      analogWrite(enb, slowDownSpeed);
