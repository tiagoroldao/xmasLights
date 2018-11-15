void theaterChaseRainbow() {
  static int baseColor = 0;
  static int pixelNum = 0;
  const int pixelWide = 3;
  const int frameDuration = 50;
  static unsigned long timer;
  unsigned long time = millis();

  if (time - timer < 0) timer = time;
  if (time - timer < frameDuration) return;
  timer = time;

  pixelNum = (pixelNum + 1) % pixelWide;
  if (pixelNum == 0) {
    baseColor = (baseColor + 1) % 255;
  }

  for (uint16_t i = 1; i < NUM_LEDS + 1; i = i + 3) {
    leds[(i + pixelNum - 1) % NUM_LEDS] = CRGB(0, 0, 0);
    leds[(i + pixelNum) % NUM_LEDS] = CHSV((i + baseColor) % 255, 255, 255);
  }
  updated = true;
}
