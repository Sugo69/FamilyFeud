/*
 * Kindred LEDs — Custom firmware for 9x7 WS2812B matrix
 * Controlled via USB serial from the Common Ground game (Chrome Web Serial API)
 *
 * === Arduino IDE Setup ===
 * Board:    NodeMCU 1.0 (ESP-12E Module)  —  Tools > Board > ESP8266 Boards
 * Port:     whichever COM port appears when you plug in the USB
 * Upload Speed: 115200
 *
 * === Libraries (install via Sketch > Include Library > Manage Libraries) ===
 *   - FastLED          by Daniel Garcia
 *   - FastLED_NeoMatrix  by Marc MERLIN
 *   - Adafruit GFX Library  by Adafruit
 *
 * === Wiring ===
 *   Matrix DATA  →  D4 (GPIO2) on NodeMCU  — change DATA_PIN if different
 *   Matrix VCC   →  5V (external supply recommended for 63 LEDs)
 *   Matrix GND   →  GND (shared with NodeMCU GND)
 *
 * === Matrix layout assumed ===
 *   Top-left start, row-major, zigzag (serpentine rows)
 *   Change NEO_MATRIX_* flags in setup() if your matrix is wired differently
 *
 * === Serial commands (115200 baud, newline terminated) ===
 *   STRIKE            — red flash (wrong answer)
 *   REVEAL            — green flash (correct answer)
 *   STEAL:<text>      — pink scrolling text (steal opportunity)
 *   WIN:<text>        — gold scrolling text (round win)
 *   SWITCH:<text>     — orange scrolling text (switch play)
 *   GAMEOVER:<text>   — purple scrolling text (game over)
 *   BRI:<0-255>       — set brightness
 *   OFF               — clear all LEDs
 */

#include <FastLED.h>
#include <FastLED_NeoMatrix.h>
#include <Adafruit_GFX.h>

#define DATA_PIN    2        // GPIO2 = D4 on NodeMCU
#define MATRIX_W    9
#define MATRIX_H    7
#define NUM_LEDS   (MATRIX_W * MATRIX_H)

CRGB leds[NUM_LEDS];
FastLED_NeoMatrix *mx;

// ── Effect state machine ────────────────────────────────────────────────────
enum EffectType { EFX_NONE, EFX_FLASH, EFX_SCROLL };
EffectType currentEffect = EFX_NONE;

// Flash
CRGB   flashColor;
int    flashToggles = 0;
bool   flashOn = false;
unsigned long lastFlashMs = 0;

// Scroll
String   scrollText    = "";
uint16_t scrollColor16 = 0;
int      scrollX       = 0;
int      scrollLoops   = 0;
int      scrollMaxLoops = 3;
unsigned long lastScrollMs = 0;

uint8_t brightness = 128;
String  inputBuffer = "";

// ── Setup ───────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);

  mx = new FastLED_NeoMatrix(leds, MATRIX_W, MATRIX_H,
    NEO_MATRIX_TOP  | NEO_MATRIX_LEFT |
    NEO_MATRIX_ROWS | NEO_MATRIX_ZIGZAG);

  mx->begin();
  mx->setTextWrap(false);
  mx->setTextSize(1);
  mx->setBrightness(brightness);
  FastLED.setBrightness(brightness);
  FastLED.clear();
  FastLED.show();

  Serial.println("Kindred LEDs ready");
}

// ── Main loop ───────────────────────────────────────────────────────────────
void loop() {
  readSerial();
  runEffect();
}

// ── Serial reader ────────────────────────────────────────────────────────────
void readSerial() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      inputBuffer.trim();
      if (inputBuffer.length() > 0) processCommand(inputBuffer);
      inputBuffer = "";
    } else if (c != '\r') {
      inputBuffer += c;
    }
  }
}

// ── Command dispatcher ───────────────────────────────────────────────────────
void processCommand(const String& cmd) {
  if (cmd == "STRIKE") {
    startFlash(CRGB(255, 0, 0), 6);              // red, 3 blinks
  } else if (cmd == "REVEAL") {
    startFlash(CRGB(0, 200, 50), 2);             // green, 1 blink
  } else if (cmd.startsWith("STEAL:")) {
    startScroll(cmd.substring(6),  mx->Color(255,   0, 128), 3);   // pink
  } else if (cmd.startsWith("WIN:")) {
    startScroll(cmd.substring(4),  mx->Color(255, 215,   0), 3);   // gold
  } else if (cmd.startsWith("SWITCH:")) {
    startScroll(cmd.substring(7),  mx->Color(255, 128,   0), 2);   // orange
  } else if (cmd.startsWith("GAMEOVER:")) {
    startScroll(cmd.substring(9),  mx->Color(255,   0, 255), 4);   // purple
  } else if (cmd.startsWith("BRI:")) {
    brightness = (uint8_t)constrain(cmd.substring(4).toInt(), 10, 255);
    mx->setBrightness(brightness);
    FastLED.setBrightness(brightness);
    FastLED.show();
  } else if (cmd == "OFF") {
    currentEffect = EFX_NONE;
    mx->fillScreen(0);
    FastLED.show();
  }
}

// ── Effect starters ──────────────────────────────────────────────────────────
void startFlash(CRGB color, int toggles) {
  currentEffect  = EFX_FLASH;
  flashColor     = color;
  flashToggles   = toggles;
  flashOn        = true;
  lastFlashMs    = millis();
  fill_solid(leds, NUM_LEDS, flashColor);
  FastLED.show();
}

void startScroll(const String& text, uint16_t color, int loops) {
  currentEffect   = EFX_SCROLL;
  scrollText      = text;
  scrollColor16   = color;
  scrollX         = MATRIX_W;
  scrollLoops     = 0;
  scrollMaxLoops  = loops;
  lastScrollMs    = millis();
}

// ── Effect runner (non-blocking) ─────────────────────────────────────────────
void runEffect() {
  unsigned long now = millis();

  if (currentEffect == EFX_FLASH) {
    if (now - lastFlashMs >= 140) {
      lastFlashMs = now;
      flashToggles--;
      if (flashToggles <= 0) {
        currentEffect = EFX_NONE;
        mx->fillScreen(0);
        FastLED.show();
        return;
      }
      flashOn = !flashOn;
      fill_solid(leds, NUM_LEDS, flashOn ? flashColor : CRGB::Black);
      FastLED.show();
    }

  } else if (currentEffect == EFX_SCROLL) {
    if (now - lastScrollMs >= 55) {       // ~18 fps scroll
      lastScrollMs = now;
      mx->fillScreen(0);
      mx->setCursor(scrollX, 0);
      mx->setTextColor(scrollColor16);
      mx->print(scrollText);
      FastLED.show();
      scrollX--;
      int textW = (int)scrollText.length() * 6;
      if (scrollX < -textW) {
        scrollLoops++;
        if (scrollLoops >= scrollMaxLoops) {
          currentEffect = EFX_NONE;
          mx->fillScreen(0);
          FastLED.show();
        } else {
          scrollX = MATRIX_W;
        }
      }
    }
  }
}
