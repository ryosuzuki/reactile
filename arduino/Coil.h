#ifndef Coil_h
#define Coil_h

#include "Arduino.h"
#include <Shifty.h>

class Coil {
public:
  void init(int pm, int nm, Shifty sp, Shifty sn);
  void standby();
  void turnOn(int p, int ns[], int nSize);
  void turnOff(int p, int ns[], int nSize);
  void singleTurnOn(int p, int n);
  void singleTurnOff(int p, int n);
private:
  int pMax;
  int nMax;
  Shifty shiftP;
  Shifty shiftN;
};

#endif