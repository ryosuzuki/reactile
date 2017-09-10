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
    delay(10-i);
    coil.turnOff(p, ns, nSize);
    delay(1);
  }
}

void Marker::singleMoveTo(int p, int n) {
  coil.singleTurnOn(p, n);
  delay(15);
  coil.standby();
  for (int i = 0; i < 10; i++) {
    coil.singleTurnOn(p, n);
    delay(3);
    coil.singleTurnOff(p, n);
    delay(1);
  }
}
