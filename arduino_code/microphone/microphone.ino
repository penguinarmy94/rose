int mic1 = 0;
int mic2 = 5;
int val1;
int val2;

void setup() {
  Serial.begin(9600);

}

void loop() {
  val1 = analogRead(mic1);
  //Serial.println(val1);
  val2 = analogRead(mic2);
  //Serial.println(val2);
  if (val1 > val2)
  {
    Serial.println("Mic 1 is louder");
  }
  else if (val2 > val1)
  {
    Serial.println("Mic 2 is louder");
  }
  else
  {
    Serial.println("Same");
  }
  delay(250);

}
