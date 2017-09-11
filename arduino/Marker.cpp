#include "Marker.h"

void Marker::init(Coil c) {
  coil = c;
}

void Marker::singleMoveTo(int p, int n) {
  int time = 15; 
  if ( (16 <= p && p <= 18)
    || (32 <= p && p <= 34)
    || (48 <= p && p <= 50)
    || (64 <= p && p <= 66) ) 
  { 
    time = 50;
  }  
  coil.singleTurnOn(p, n);
  delay(time);
  coil.standby();
  for (int i = 0; i < 10; i++) {
    coil.singleTurnOn(p, n);
    delay(3);
    coil.singleTurnOff(p, n);
    delay(1);
  }
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

