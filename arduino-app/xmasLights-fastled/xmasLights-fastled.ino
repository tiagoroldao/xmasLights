#include <FastLED.h>
#include <AltSoftSerial.h>
#ifdef __AVR__  
  #include <avr/power.h>
#endif

#define LED_PIN 2
#define NUM_LEDS    100
#define CHIPSET     WS2811
#define COLOR_ORDER RGB

#define BRIGHTNESS  64

#define STATE_IDLE 0
#define STATE_THEATRE 1
#define STATE_WIPE 2
#define STATE_FADE 3
#define STATE_SHOW_DOT 4

CRGB leds[NUM_LEDS];
//SoftwareSerial btSerial (5, 4);
AltSoftSerial btSerial;
char btData[80]; //Variable for storing received data
int state = STATE_IDLE;
String str;
bool updated = false;
int showedLed;

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.begin(9600);         //Sets the data rate in bits per second (baud) for serial data transmission
//  btSerial.begin(38400);
  
  
  delay( 3000 ); // power-up safety delay
//  btSerial.flush();
  // It's important to set the color correction for your LED strip here,
  // so that colors can be more accurately rendered through the 'temperature' profiles
  FastLED.addLeds<CHIPSET, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection( TypicalLEDStrip );
  FastLED.setBrightness( BRIGHTNESS );
  
  statusLedOn();
}

void loop()
{ 
  Serial.println('1');
  while (Serial.available() > 0)
  { 
    receiveCommand();
    if (btData[0] == '1') {
      state = STATE_IDLE;
      colorFill(CRGB(255, 255, 255), 100);
      updated = true;
    }
    else if (btData[0] == '0') {
      state = STATE_IDLE;
      colorFill(CRGB(0, 0, 0), 100);
      updated = true;
    }
    else if (btData[0] == 'T') {
      state = STATE_THEATRE;
    }
    else if (btData[0] == 'W') {
      state = STATE_WIPE;
      startWipe(random(0, 255), 255, 255);
      updated = true;
    }
    else if (btData[0] == 'F') {
      state = STATE_IDLE;
      str = String(btData);
      colorFill(CHSV( getValue(str, '-', 2).toInt(), 255, 255), getValue(str, '-', 1).toInt());
    }
    else if (btData[0] == 'S') {
      state = STATE_SHOW_DOT;
      str = String(btData);
      showedLed = str.substring(1).toInt();
    }
    else if (btData[0] == 'B') {
      state = STATE_FADE;
      str = String(btData);
      if (btData[1] == '1') {
        leds[str.substring(2).toInt()] = CRGB(255, 255, 255);
      }
      if (btData[1] == '0') {
        leds[str.substring(2).toInt()] = CRGB(0, 0, 0);
      }
      updated = true;
    } else {
      statusLedOn();
    }
  }

  if (state == STATE_THEATRE) {
    theaterChaseRainbow();
  } else if (state == STATE_WIPE) {
    if (colorWipe()) {
      state = STATE_IDLE;
    }
  } else if (state == STATE_SHOW_DOT) {
    if (colorWipe()) {
      startWipe(0, 0, 64);
    }
    leds[showedLed] = CRGB(255, 0, 0);
  } else if(state == STATE_FADE) {
    fade();
  }

  checkStatusLed();
  paint();
}

void paint() {
  const int frameDuration = 30;
  static unsigned long timer;
  long time = millis();
  
  if (!updated || time < timer + frameDuration) {
    return;
  }
  
  timer = time;
  FastLED.show();
  updated = false;
}

void colorFill(CRGB c, int until) {
  for(uint16_t i=0; i<NUM_LEDS; i++) {
    if (i < until) {
      leds[i] = c;
    } else {
      leds[i] = CRGB(0, 0, 0);
    }
  }
  updated = true;
}
