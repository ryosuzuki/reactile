#include <ArduinoJson.h>
#include <Shifty.h>

#include "Coil.h"
#include "Marker.h"

Shifty shiftP;
Shifty shiftN;
Coil coil;
Marker marker;

int pData = 11;
int pLatch = 12;
int pClock = 13;

int nData = 2;
int nLatch = 3;
int nClock = 4;

int pMax = 16*5;
int nMax = 40;

void setup() {
  shiftP.setBitCount(pMax);
  shiftP.setPins(pData, pClock, pLatch);
  shiftN.setBitCount(nMax);
  shiftN.setPins(nData, nClock, nLatch);

  coil.init(pMax, nMax, shiftP, shiftN);
  marker.init(coil);

  Serial.begin(9600);
  coil.standby();
  Serial.println("start");
}

void loop() {
  StaticJsonBuffer<5000> jsonBuffer;
  JsonObject &root = jsonBuffer.parseObject(Serial);
  if (root.success()) {
    Serial.println("received");
    int type = root["t"];
    if (type == 0) {
      travelP(root);
    }
    if (type == 1) {
      travelN(root);
    }
    if (type == 2) {
      multiple(root);
    }
  }
}

void travelP(JsonObject &root) {
  int from = root["pf"];
  int to = root["pt"];
  int n = root["n"];
  if (from < to) {
    for (int p = from; p < to; p++) {
      marker.singleMoveTo(p, n);
    }
  } else {
    for (int p = from; p > to; p--) {
      marker.singleMoveTo(p, n);
    }
  }
  coil.singleTurnOn(to, n);
  delay(100);
  coil.standby();
  Serial.println("done");
}


void travelN(JsonObject &root) {
  int p = root["p"];
  int from = root["nf"];
  int to = root["nt"];
  if (from < to) {
    for (int n = from; n < to; n++) {
      marker.singleMoveTo(p, n);
    }
  } else {
    for (int n = from; n > to; n--) {
      marker.singleMoveTo(p, n);
    }
  }
  coil.singleTurnOn(p, to);
  delay(100);
  coil.standby();
  Serial.println("done");
}

void multipleTravelP(JsonObject &root) {
  int from = root["pf"];
  int to = root["pt"];
  int nSize = root["s"];
  int ns[nSize];
  for (int i=0; i<nSize; i++) {
    int n = root["ns"][i];
    ns[i] = n;
  }
  if (from < to) {
    for (int p = from; p < to; p++) {
      marker.moveTo(p, ns, nSize);
    }
  } else {
    for (int p = from; p > to; p--) {
      marker.moveTo(p, ns, nSize);
    }
  }
  coil.turnOn(to, ns, nSize);
  delay(100);
  coil.standby();
  Serial.println("done");
}

void multiple(JsonObject &root) {
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
      coil.turnOn(p, ns, nSize);
      delay(10);
      coil.standby();
    }
    if (pSize < 5) {
      int offTime = (5-pSize)*10;
      delay(offTime);
    }
  }
  Serial.println("done");
}

