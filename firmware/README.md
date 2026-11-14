# ESP32 Firmware — Smart Silkworm Monitoring System

## Overview
This directory contains the embedded C++ firmware for the **ESP32 DevKit V1** microcontroller, responsible for microclimate telemetry in silkworm rearing beds. It is fully compatible with both the [Wokwi Virtual Hardware Simulation](https://wokwi.com/projects/448411776763262977) and physical ESP32 boards.

---

## Hardware Pinout Configuration

| Component | Interface / Type | ESP32 GPIO Pin | Description |
| :--- | :--- | :--- | :--- |
| **DHT22** | Digital (1-Wire) | **GPIO 4** | Ambient Temperature & Relative Humidity |
| **Soil Moisture** | Analog Input (ADC1) | **GPIO 34** | Rearing bed substrate moisture |
| **MQ-135** | Analog Input (ADC1) | **GPIO 35** | Air quality & litter decomposition gases |
| **LDR Sensor** | Analog Input (ADC1) | **GPIO 32** | Ambient rearing light level |
| **Piezo Buzzer** | Digital Output | **GPIO 5** | Audible alarm driven by backend health engine |

> **Note on ADC Pins:** GPIO 32, 34, and 35 belong to ESP32's **ADC1** group, which operates reliably while the Wi-Fi radio is actively transmitting (unlike ADC2 pins, which are shared with Wi-Fi).

---

## Required Libraries

If compiling in **Arduino IDE** or **PlatformIO**, install the following libraries via the Library Manager:
1. `DHT sensor library` by Adafruit (v1.4.6 or later)
2. `Adafruit Unified Sensor` by Adafruit (dependency for DHT)
3. `ArduinoJson` by Benoît Blanchon (v6.21.x or v7.x)
4. Built-in ESP32 core libraries: `WiFi.h`, `HTTPClient.h`

---

## Calibration Details

1. **Soil Moisture Calibration:**
   * Raw ADC range on ESP32 is $0 - 4095$ (12-bit).
   * In dry air, resistance is high ($\approx 4095$ ADC counts).
   * In water, conductivity is high ($\approx 1200$ ADC counts).
   * Formula applied:
     $$\text{Moisture \%} = \text{constrain}\left(\frac{4095 - \text{ADC}}{4095 - 1200} \times 100, 0, 100\right)$$
2. **Gas & Light Readings:**
   * Transmitted as raw 12-bit ADC counts alongside mapped values to preserve raw data fidelity for downstream analytics.

---

## How to Test in Wokwi
1. Open the Wokwi simulation link: [https://wokwi.com/projects/448411776763262977](https://wokwi.com/projects/448411776763262977).
2. The circuit matches `diagram.json` in this folder.
3. Paste the contents of `firmware.ino` into the Wokwi code tab.
4. Click **Start Simulation**.
5. Adjust temperature/humidity sliders on the DHT22 or the dials on the analog sensors to observe serial output and buzzer alerts in real time!
