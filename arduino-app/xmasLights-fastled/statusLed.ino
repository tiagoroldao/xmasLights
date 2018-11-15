unsigned long ledTimer = 0;
bool ledOn = false;

void checkStatusLed() {
  if (ledOn && ledTimer < millis()) {
    ledOn = false;
    digitalWrite(LED_BUILTIN, LOW);
  }
}

void statusLedOn() {
  ledOn = true;
  ledTimer = millis() + 2000;
  digitalWrite(LED_BUILTIN, HIGH);
}
