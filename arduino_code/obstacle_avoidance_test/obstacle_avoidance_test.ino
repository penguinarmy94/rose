//US Sensor
const int echoPin = 2;
const int trigPin = 3;
int duration;
int distance;
int cm;

int test_cases [7] = {300, 151, 146, 24, 25, 26, -373};
int expected [7] = {1, 1, 3, 2, 2, 3, 1};
int actual;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
}

void loop() {
for (int i = 0; i < 7; i++)
{  
  cm = test_cases[i];
  Serial.print("Test Case ");
  Serial.print(i+1);
  if (cm > 150 | cm < 0)
    {
      actual = 1;
      //Serial.println("Object Far...Keep Going");
    }
  else if (cm <= 25)
    {
      //Serial.println("Object Too Close...Stop");
      actual = 2;
      
    }
  else
    {
      //Serial.println("Object Approaching...Adjust for Speed");
      actual = 3;
    }
    
  if (actual == expected[i])
    {
      Serial.print(" PASSED");
      Serial.println();
    }
  else
    {
      Serial.print(" FAILED");
      Serial.println();  
    }
}
  Serial.println(); 
  delay(1000); 
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
