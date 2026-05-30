---
name: LED Lighting Integration
description: ESP8266 custom firmware + Web Serial API LED matrix in Common Ground — USB primary, WiFi proxy fallback
type: project
originSessionId: fe9017af-e026-43c8-b83a-f9aa002384e7
---

Custom LED matrix control added to Common Ground Admin view (games/common-ground.html).

**Why:** Reactive classroom lighting on game events. USB serial chosen over WiFi to avoid church Liahona captive portal blocking ESP8266 and cell signal dead zones.

**How to apply:** When modifying Common Ground game events, check if wledTrigger() should be called. Always fire-and-forget — never await or block game logic on LED calls.

## Primary: USB Serial (Web Serial API)
- `wledTrigger(event, text)` sends serial command if `wledSerialWriter` is set, else falls back to WiFi proxy
- Chrome only — Web Serial API not available in Firefox/Safari
- `window.wledConnectUsb()` — Chrome serial port picker (requires user gesture)
- Auto-reconnects on page load via `navigator.serial.getPorts()`
- Firmware: `wled-firmware/kindred-leds.ino` (FastLED + FastLED_NeoMatrix + Adafruit GFX)
- Serial commands: `STRIKE`, `REVEAL`, `STEAL:<text>`, `WIN:<text>`, `SWITCH:<text>`, `GAMEOVER:<text>`, `BRI:<n>`
- Scrolling text carries live team names from sharedState

## Fallback: WiFi proxy
- `api/wled.js` (Vercel) + `/api/wled` Vite middleware — proxies to WLED device IP
- IP in `localStorage.kindred_wled_ip`; AP IP is `4.3.2.1` if using WLED AP mode

## Hardware
- ESP8266 NodeMCU (~1.5×1"), data pin D4 (GPIO2)
- 9×7 WS2812B matrix (63 LEDs), top-left zigzag wiring
- Future: 2nd matrix for Team 2 — extend wledTrigger(event, teamId) with two serial ports
