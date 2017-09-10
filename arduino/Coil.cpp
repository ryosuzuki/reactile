#include "Coil.h"

void Coil::init(int pm, int nm, Shifty sp, Shifty sn) {
  pMax = pm;
  nMax = nm;
  shiftP = sp;
  shiftN = sn;
}

void Coil::turnOn(int p, int ns[], int nSize) {
  shiftP.writeBit(p, LOW);
  shiftN.batchWriteBegin();
  for (int i=0; i<nSize; i++) {
    int n = ns[i];
    shiftN.writeBit(n, HIGH);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
}

void Coil::turnOff(int p, int ns[], int nSize) {
  shiftP.writeBit(p, HIGH);
  shiftN.batchWriteBegin();
  for (int i=0; i<nSize; i++) {
    int n = ns[i];
    shiftN.writeBit(n, LOW);
  }
  shiftP.batchWriteEnd();
  shiftN.batchWriteEnd();
}

void Coil::standby() {
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

void Coil::singleTurnOn(int p, int n) {
  shiftP.writeBit(p, LOW);
  shiftN.writeBit(n, HIGH);
}

void Coil::singleTurnOff(int p, int n) {
  shiftP.writeBit(p, HIGH);
  shiftN.writeBit(n, LOW);
}
