#include "Marker.h"

void Marker::init(Coil c) {
  coil = c;
}

void Marker::moveTo(int p, int ns[], int nSize) {
  coil.turnOn(p, ns, nSize);
  delay(10);
  coil.standby();
  for (int i = 0; i < 10; i++) {
    coil.turnOn(p, ns, nSize);
    delay(1);
    coil.turnOff(p, ns, nSize);
    delay(1);
  }
}

void Marker::singleMoveTo(int p, int n) {
  coil.singleTurnOn(p, n);
  delay(10);
  coil.standby();
  for (int i = 0; i < 10; i++) {
    coil.singleTurnOn(p, n);
    delay(1);
    coil.singleTurnOff(p, n);
    delay(1);
  }
}