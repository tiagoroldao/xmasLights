void fade() {
  const int frameDuration = 10;
  static unsigned long timer;
  unsigned long time = millis();

  if (time - timer < 0) timer = time;
  if (time - timer < frameDuration) return;
  
  timer = time;
  
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    leds[i].fadeToBlackBy(2);
  }
  updated = true;
}
