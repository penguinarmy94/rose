#include <QueueArray.h>

int mic = 0;
int val;
int lower = 184;
int higher = 430;
int trueval;
int loudestInSession;

void setup() {
  Serial.begin(9600);

}

void loop() {
  
  val = analogRead(mic);
  trueval = map(val, 184, 430, 0, 1023);
  if(trueval > 700)
    {
      Serial.println("Loud Sound Detected");
      delay(400);
    }
  
  delay(1);

}
