# Smart Silkworm Rearing Environment Monitoring & Management System 🐛🌿

[![ESP32](https://img.shields.io/badge/Microcontroller-ESP32%20DevKit%20V1-blue.svg)](https://www.espressif.com/)
[![Simulation](https://img.shields.io/badge/Wokwi-Simulation%20Live-brightgreen.svg)](https://wokwi.com/projects/448411776763262977)
[![Python](https://img.shields.io/badge/Backend-Python%20%7C%20Flask-blue.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, full-stack IoT microclimate monitoring and alert platform engineered to maintain ideal environmental conditions for sericulture (silkworm rearing) beds.

---

## 📌 Problem & Motivation
Sericulture in Karnataka has a rich heritage, yet remains highly vulnerable to microclimate shifts. Silkworms (*Bombyx mori*) are delicate cold-blooded insects:
* **Temperature > 28°C:** Induces lethal heat stress and stunted development.
* **Temperature < 24°C:** Retards growth cycles and prolongs larval stages.
* **Humidity > 85%:** Promotes deadly flacherie (bacterial/viral) and fungal infections.
* **Humidity < 70%:** Desiccates mulberry leaves, preventing larval feeding.
* **Accumulated Litter Gases:** Poor ventilation allows toxic ammonia and CO₂ buildup.

Traditional rearing relies on manual inspections. This system provides continuous telemetry, automated 3-level health assessment, actionable farmer advice, and instant buzzer/remote notifications.

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------------+
|               VIRTUAL / PHYSICAL HARDWARE (ESP32)                |
|  DHT22 (Temp/Hum) | Soil Moisture | MQ-135 Gas | LDR Light Sensor |
+-------------------------------------------------------------------+
                                  |
                           Wi-Fi HTTP POST
                                  v
+-------------------------------------------------------------------+
|                    FLASK REST API & DECISION ENGINE               |
|  * 5-Sensor Validation    * 3-Tier Health Classification          |
|  * Action Recommendations * Rolling Retention Management          |
+-------------------------------------------------------------------+
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
+---------------------------+           +---------------------------+
|    SQL DATABASE LAYER     |           |     REAL-TIME CLIENT      |
|  SQLite / PostgreSQL      |           |  Dashboard & Trends       |
|  Sensor History & Logs    |           |  Alerts & Recommendations |
+---------------------------+           +---------------------------+
```

---

## 🔌 Hardware Pinout (ESP32 DevKit V1)

| Sensor / Component | Type | ESP32 GPIO | Role |
| :--- | :--- | :--- | :--- |
| **DHT22** | Digital (1-Wire) | **GPIO 4** | Ambient Temperature & Relative Humidity |
| **Soil Moisture** | Analog (ADC1) | **GPIO 34** | Bed substrate moisture level |
| **MQ-135** | Analog (ADC1) | **GPIO 35** | Air quality / litter decomposition gas |
| **LDR Photoresistor** | Analog (ADC1) | **GPIO 32** | Bed illumination levels |
| **Piezo Buzzer** | Digital Output | **GPIO 5** | Audible alarm driven by health engine |

*Simulate the circuit directly in Wokwi:* [https://wokwi.com/projects/448411776763262977](https://wokwi.com/projects/448411776763262977)

---

## 📂 Project Structure

```
Silkworm-Monitor/
├── firmware/              # ESP32 C++ Arduino firmware & Wokwi circuit
│   ├── firmware.ino       # Main microcontroller code
│   ├── diagram.json       # Wokwi simulation circuit diagram
│   └── README.md          # Hardware setup and calibration guide
├── backend/               # Modular Python Flask REST API
├── frontend/              # Modern React + TypeScript user interface
├── docs/                  # Engineering architecture, API & test docs
└── .gitignore             # Strict exclusion of sensitive/build artifacts
```

---

## 🚀 Quick Start Guide

### 1. Run Microcontroller in Wokwi
1. Open the [Wokwi Project](https://wokwi.com/projects/448411776763262977).
2. The code matches [`firmware/firmware.ino`](firmware/firmware.ino).
3. Start simulation to observe telemetry output.

---

## 👨‍💻 Author
* **Noaman Nazeer Ahamed** (USN: `4DM23CS089`)
* Department of Computer Science & Engineering, Yenepoya Institute of Technology (YIT)
* GitHub: [@noaman10a](https://github.com/noaman10a)

