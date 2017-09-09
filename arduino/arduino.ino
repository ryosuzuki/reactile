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

int pSize = 16*5;
int nSize = 40;

void standby();
void turnOn();
void turnOff();
void travel(); 

void hoge(int ns[], int size) {
  if (size > 1) {
    Serial.println(size);
    for (int i = 0; i < size; i++) {
      Serial.println(ns[i]);
    }
  } else {
    int n = ns[0];
    Serial.println(n);
  }
}

void setup() {
  shiftP.setBitCount(pSize);
  shiftP.setPins(pData, pClock, pLatch);
  shiftN.setBitCount(nSize);
  shiftN.setPins(nData, nClock, nLatch);
  Serial.begin(9600);
  standby();

  int ns[] = {110, 22, 303, 4210};
//  int ns = 10;
  int size = (sizeof(ns) / sizeof(int));
  Serial.println(ns[0]);
}




void loop() {


//  int p = pSize - 10;
//  int n = 37;
//  
//  move(p, n);
//  move(p+1, n);
//  move(p+2, n);
//  move(p+1, n);

} 

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

  /*
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
