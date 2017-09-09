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

int pMax = 16*5;
int nMax = 40;

void standby();
void turnOn();
void turnOff();

StaticJsonBuffer<5000> jsonBuffer;

void setup() {
  shiftP.setBitCount(pMax);
  shiftP.setPins(pData, pClock, pLatch);
  shiftN.setBitCount(nMax);
  shiftN.setPins(nData, nClock, nLatch);
  Serial.begin(9600);
  standby();
  Serial.println("start");
}

void loop() {
  JsonObject &root = jsonBuffer.parseObject(Serial);
  if (root.success()) {
    Serial.println("received");
    int pSize = root["s"];
    Serial.println(pSize);
    for (int i=0; i<pSize; i++) {
      int p = root["ps"][i]["p"]; 
      int nSize = root["ps"][i]["s"];
      Serial.print("p: ");
      Serial.println(p);
      Serial.print("n: ");
      for (int j=0; j<nSize; j++) {
        int n = root["ps"][i]["ns"][j];
        Serial.print(n);
        Serial.print(", ");
      }
      Serial.println("");
      Serial.println("-----");
    }    
  }
} 

void turnOn(int p, int ns[], int nSize, int onTime) {
  shiftP.writeBit(p, LOW);
  shiftN.batchWriteBegin();
  for (int i=0; i<nSize; i++) {
    int n = ns[i];
    shiftN.writeBit(n, HIGH);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
  delay(onTime);
  standby();
}

void turnOff(int p, int ns[], int nSize) {
  shiftP.writeBit(p, HIGH);
  shiftN.batchWriteBegin();
  for (int i=0; i<nSize; i++) {
    int n = ns[i];
    shiftN.writeBit(n, LOW);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
}

void standby() {
  shiftP.batchWriteBegin();
  shiftN.batchWriteBegin();
  for (int i=0; i<pMax; i++) {
    shiftP.writeBit(i, HIGH);
  }
  for (int i=0; i<nMax; i++) {
    shiftN.writeBit(i, LOW);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
}

void singleOn(int p, int n) {
  shiftP.writeBit(p, LOW);
  shiftN.writeBit(n, HIGH);
}

void singleOff(int p, int n) {
  shiftP.writeBit(p, HIGH);
  shiftN.writeBit(n, LOW);
}

  /*

void move(int p, int n) {
  for (int i=1; i<10; i++) {
    turnOn(p, n);
    turnOn(p, n-5);
    delay(10);
    turnOff(p, n);
    turnOff(p, n-5);
    delay(100);
  }
  turnOn(p, n);
  turnOn(p, n-5);
  delay(100);
  standby();
  delay(1000);    
}
   * 
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
  */


/*
 * 
 * 
void move(int p, int n) {
  for (int i=1; i<10; i++) {
    turnOn(p, n);
//    turnOn(p+5, n);
    delay(10);
    turnOff(p, n);
//    turnOff(p+5, n);
    delay(100);
  }
  turnOn(p, n);
//  turnOn(p+5, n);
  delay(100);
  standby();
  delay(1000);    
}

 * 
 * 
  for (int n=from; n>to; n--) {
    turnOn(p, n);
    delay(10);
    standby();
    delay(10);
    for (int i=1; i<10; i++) {
      turnOn(p, n);
      turnOff(p, n-1);
      delay(5);
      turnOff(p, n);
      turnOn(p, n-1);
      delay(1*i);
    }
  }

  delay(2000);

  for (int n=to; n<from+1; n++) {
    turnOn(p, n);
    delay(10);
    standby();
    delay(10);
    for (int i=1; i<10; i++) {
      turnOn(p, n);
      turnOff(p, n+1);
      delay(1);
      turnOff(p, n);
      turnOn(p, n+1);
      delay(1*i);
    }
  }

  delay(10000);
}
*/
