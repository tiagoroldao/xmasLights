unsigned long wipeStart = 0;
int wipeDuration = 300;
int wipeLength = 100;
int wipeTailLength = 600;
int wipeHue = 130;
int wipeSaturation = 255;
int wipeBrightness = 255;

void startWipe (int hue, int saturation, int brightness) {
  wipeHue = wipeHue;
  wipeSaturation = saturation;
  wipeBrightness = brightness;
  wipeStart = millis();
}

bool colorWipe() {
  int time = millis() - wipeStart;
  
  int head = float(NUM_LEDS) * float(max(1, time)) / float(wipeDuration);
  int tailStart = floor(float(NUM_LEDS) * float(max(1, float(time - wipeLength))) / float(wipeDuration));
  int tailEnd = floor(float(NUM_LEDS) * float(max(1, time - wipeLength - wipeTailLength)) / float(wipeDuration));
  
  for(uint16_t i=0; i < min(head, NUM_LEDS); i++) {
    if (i >= tailStart) {
      leds[i] = CHSV(wipeHue, wipeSaturation, wipeBrightness);
    } else if (i >= tailEnd) {
      int brightness = map(i, tailEnd, tailStart, 0, wipeBrightness);
      leds[i] = CHSV(wipeHue, wipeSaturation, brightness);
    } else {
      leds[i] = CRGB(0, 0, 0);
    }
    
  }
  updated = true;
  
  return time > wipeDuration + wipeLength + wipeTailLength;
}
