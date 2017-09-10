#ifndef Marker_h
#define Marker_h

#include "Arduino.h"
#include "Coil.h"

class Marker {
public:
  void init(Coil c);
  void moveTo(int p, int ns[], int nSize);
  void singleMoveTo(int p, int n);
private:
  Coil coil;
};

#endif