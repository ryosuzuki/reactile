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
  StaticJsonBuffer<5000> jsonBuffer;
  JsonObject &root = jsonBuffer.parseObject(Serial);
  if (root.success()) {
    Serial.println("received");
    int pSize = root["s"];
    Serial.println(pSize);
    for (int c=0; c<10; c++) {
      for (int i=0; i<pSize; i++) {
        int p = root["ps"][i]["p"]; 
        int nSize = root["ps"][i]["s"];
        int ns[nSize];
        for (int j=0; j<nSize;j++) {
          int n = root["ps"][i]["ns"][j];
          ns[j] = n;
        }
        turnOn(p, ns, nSize, 10);
      }
      if (pSize < 5) {
        int offTime = (5-pSize)*10;
        delay(offTime);
      }
    }
    Serial.println("done");
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
