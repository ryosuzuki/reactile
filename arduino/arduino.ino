#include <ArduinoJson.h>
#include <Shifty.h>
Shifty shiftP;
Shifty shiftN;

int pData= 11;
int pLatch= 12;
int pClock= 13;

int nData= 5;
int nLatch = 6;
int nClock = 7;

int pSize = 16;
int nSize = 40;

void standby();
void turnOn();
void turnOff();

void setup() {
  shiftP.setBitCount(pSize);
  shiftP.setPins(pData, pClock, pLatch);
  shiftN.setBitCount(nSize);
  shiftN.setPins(nData, nClock, nLatch);
  Serial.begin(9600);
  standby();
}

void loop() {
  String json = "";
  while (Serial.available() > 0) {
    json += (char) Serial.read();
    delay(5);
  }

  if (json != "") {
    Serial.println("received");
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject &root = jsonBuffer.parseObject(json);

    int p = root["p"];
    int n = root["n"];
    Serial.println(p);
    Serial.println(n);
    turnOn(p, n);
    delay(200);
    standby();
  }

  /*
  for (int n=39; n>0; n--) {
    turnOn(15, n);
    delay(10);
    standby();
    delay(10);
    for (int i=1; i<10; i++) {
      turnOn(15, n);
      turnOff(15, n-1);
      delay(1);
      turnOff(15, n);
      turnOn(15, n-1);
      delay(1*i);
    }
  }

  for (int n=0; n<40; n++) {
    turnOn(15, n);
    delay(10);
    standby();
    delay(10);
    for (int i=1; i<10; i++) {
      turnOn(15, n);
      turnOff(15, n+1);
      delay(1);
      turnOff(15, n);
      turnOn(15, n+1);
      delay(1*i);
    }
  }

  delay(10000);
  */
}



void standby() {
  shiftP.batchWriteBegin();
  shiftN.batchWriteBegin();
  for (int i=0; i<pSize; i++) {
    shiftP.writeBit(i, HIGH);
  }
  for (int i=0; i<nSize; i++) {
    shiftN.writeBit(i, LOW);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
}

void turnOn(int p, int n) {
  shiftP.writeBit(p, LOW);
  shiftN.writeBit(n, HIGH);
}

void turnOff(int p, int n) {
  shiftP.writeBit(p, HIGH);
  shiftN.writeBit(n, LOW);
}
