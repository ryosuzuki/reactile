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
  turnOn(15, 38);
  delay(100);
  standby();
  delay(2000);
//
//  for (int i = 1; i < 10; i++) {
//    turnOn(15, 39);
//    turnOff(15, 38);
//    delay(10);
//    turnOff(15, 39);
//    turnOn(15, 38);
//    delay(10*i);
//  }
//
//  turnOn(15, 38);
//  delay(100);
//  standby();
//  delay(2000);
//
//  for (int i = 1; i < 10; i++) {
//    turnOn(15, 38);
//    turnOff(15, 39);
//    delay(10);
//    turnOff(15, 38);
//    turnOn(15, 39);
//    delay(10*i);
//  }

  
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
