/*
 * ==============================================================================
 * Project: Smart Silkworm Rearing Environment Monitoring System
 * File: firmware.ino
 * Target Device: ESP32 DevKit V1
 * Simulation Platform: Wokwi (https://wokwi.com/projects/448411776763262977)
 * Author: Noaman Nazeer Ahamed (4DM23CS089)
 * Repository: https://github.com/noaman10a/Silkworm-Monitor
 * ==============================================================================
 * Description:
 * Reads microclimate telemetry for silkworm rearing beds:
 * - Ambient Temperature & Relative Humidity (DHT22 on GPIO 4)
 * - Rearing Bed Moisture (Analog Sensor on GPIO 34 / ADC1_CH6)
 * - Air Quality / Litter Gas Concentration (MQ-135 on GPIO 35 / ADC1_CH7)
 * - Rearing Light Intensity (LDR Photoresistor on GPIO 32 / ADC1_CH4)
 * - Acoustic Alarm (Piezo Buzzer on GPIO 5)
 * 
 * Transmits structured JSON payloads over Wi-Fi via HTTP POST to the backend
 * REST API, parses response instructions, and actuates the buzzer in real time.
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- PIN DEFINITIONS (Wokwi & Physical ESP32) ---
#define PIN_DHT          4     // DHT22 digital data line
#define PIN_SOIL         34    // Soil moisture analog input (ADC1)
#define PIN_GAS          35    // MQ-135 gas analog input (ADC1)
#define PIN_LDR          32    // LDR photoresistor analog input (ADC1)
#define PIN_BUZZER       5     // Piezo buzzer digital output

#define DHTTYPE          DHT22 // Sensor model: DHT22 (AM2302)

// --- NETWORK CONFIGURATION ---
// In Wokwi simulation, use "Wokwi-GUEST" with empty password.
// For physical ESP32, replace with your local 2.4GHz Wi-Fi credentials.
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Backend REST API endpoint.
// For local testing from Wokwi simulation to your computer, use host.wokwi.internal or your PC's LAN IP.
// Example: "http://host.wokwi.internal:5000/api/data" or "https://your-render-app.onrender.com/api/data"
const char* BACKEND_URL   = "http://host.wokwi.internal:5000/api/data";

// Telemetry interval (milliseconds)
const unsigned long SAMPLING_INTERVAL_MS = 5000;
unsigned long lastTransmissionTime = 0;

// Initialize DHT sensor
DHT dht(PIN_DHT, DHTTYPE);

// --- CALIBRATION CONSTANTS (ESP32 12-bit ADC: 0 to 4095) ---
// Soil sensor: In air (dry) = ~4095; In water (100% wet) = ~1200
const int SOIL_DRY_ADC = 4095;
const int SOIL_WET_ADC = 1200;

// Structure to hold verified sensor readings
struct TelemetryData {
  float temperature;
  float humidity;
  float soilMoisture; // Calibrated percentage (0.0 to 100.0%)
  int rawSoil;        // Raw 12-bit ADC value
  float gasValue;     // Scaled air quality index / raw count
  int rawGas;         // Raw 12-bit ADC value
  float ldrValue;     // Scaled light reading / lux approximation
  int rawLdr;         // Raw 12-bit ADC value
  bool isValid;
};

// ==============================================================================
// SETUP: Hardware & Network Initialization
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================================");
  Serial.println("   SMART SILKWORM REARING MONITOR - ESP32 FIRMWARE     ");
  Serial.println("========================================================");

  // Initialize Pin Modes
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW); // Ensure buzzer is silenced initially

  // ADC Configuration for ESP32 (12-bit resolution: 0 - 4095)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Full range ~0 - 3.3V

  // Initialize DHT22
  Serial.println("[SETUP] Initializing DHT22 sensor...");
  dht.begin();

  // Connect to Wi-Fi
  connectWiFi();
  
  Serial.println("[SETUP] Initialization complete. Entering monitoring loop.\n");
}

// ==============================================================================
// MAIN LOOP: Non-blocking sampling & transmission
// ==============================================================================
void loop() {
  unsigned long currentMillis = millis();

  // Run telemetry cycle every SAMPLING_INTERVAL_MS
  if (currentMillis - lastTransmissionTime >= SAMPLING_INTERVAL_MS || lastTransmissionTime == 0) {
    lastTransmissionTime = currentMillis;

    // Check Wi-Fi connection and reconnect if lost
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[WARN] Wi-Fi disconnected. Attempting reconnection...");
      connectWiFi();
    }

    // Read all connected sensors
    TelemetryData data = readSensors();

    if (data.isValid) {
      // Print readings to Serial Monitor
      printTelemetryDebug(data);

      // Transmit to Backend via HTTP POST
      if (WiFi.status() == WL_CONNECTED) {
        sendTelemetryToBackend(data);
      } else {
        Serial.println("[ERROR] Cannot send data: Wi-Fi offline. Buzzer kept safe.");
        digitalWrite(PIN_BUZZER, LOW);
      }
    } else {
      Serial.println("[ERROR] Sensor acquisition failed! Skipping this telemetry cycle.");
    }
  }

  // Small delay to yield execution to ESP32 background tasks
  delay(10);
}

// ==============================================================================
// SENSOR READING & CALIBRATION FUNCTIONS
// ==============================================================================
TelemetryData readSensors() {
  TelemetryData data;
  data.isValid = false;

  // 1. Read DHT22 (Temperature & Humidity)
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Check if reading failed
  if (isnan(temp) || isnan(hum)) {
    Serial.println("[DHT22] Failed to read from sensor!");
    return data;
  }
  data.temperature = temp;
  data.humidity = hum;

  // 2. Read Soil Moisture (Analog GPIO 34)
  data.rawSoil = analogRead(PIN_SOIL);
  // Calibrate raw ADC to percentage (higher ADC = drier; lower ADC = wetter)
  int clampedSoil = constrain(data.rawSoil, SOIL_WET_ADC, SOIL_DRY_ADC);
  data.soilMoisture = map(clampedSoil, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);

  // 3. Read Gas Sensor (Analog GPIO 35)
  data.rawGas = analogRead(PIN_GAS);
  data.gasValue = (float)data.rawGas; // Raw ADC reading (0 to 4095)

  // 4. Read LDR Light Sensor (Analog GPIO 32)
  data.rawLdr = analogRead(PIN_LDR);
  // In Wokwi, LDR resistance decreases with light; voltage divider maps to ADC
  data.ldrValue = (float)data.rawLdr;

  data.isValid = true;
  return data;
}

// ==============================================================================
// HTTP TELEMETRY TRANSMISSION (JSON POST)
// ==============================================================================
void sendTelemetryToBackend(const TelemetryData& data) {
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000); // 4-second network timeout

  // Build JSON payload (compatible with ArduinoJson v6 and v7)
  StaticJsonDocument<300> doc;
  doc["temperature"]   = round(data.temperature * 10.0) / 10.0;
  doc["humidity"]      = round(data.humidity * 10.0) / 10.0;
  doc["soil_moisture"] = round(data.soilMoisture * 10.0) / 10.0;
  doc["gas_value"]     = data.gasValue;
  doc["ldr_value"]     = data.ldrValue;
  doc["raw_soil"]      = data.rawSoil;
  doc["raw_gas"]       = data.rawGas;
  doc["raw_ldr"]       = data.rawLdr;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.print("[HTTP] Sending POST to: ");
  Serial.println(BACKEND_URL);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String responseString = http.getString();
    Serial.printf("[HTTP] Response Status: %d\n", httpResponseCode);

    if (httpResponseCode == 200 || httpResponseCode == 201) {
      // Parse server response to check buzzer command
      StaticJsonDocument<400> responseDoc;
      DeserializationError err = deserializeJson(responseDoc, responseString);

      if (!err) {
        bool buzzerState = responseDoc["buzzer"] | false;
        const char* statusText = responseDoc["entry"]["status_text"] | "OK";

        Serial.printf("[SERVER] Status: %s | Buzzer Alarm: %s\n", 
                      statusText, buzzerState ? "ACTIVE (ON)" : "SILENT (OFF)");

        // Actuate physical buzzer based on backend decision
        digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
      } else {
        Serial.println("[ERROR] Failed to parse JSON response from server.");
      }
    }
  } else {
    Serial.printf("[HTTP] POST failed. Error code: %d (%s)\n", 
                  httpResponseCode, http.errorToString(httpResponseCode).c_str());
    // In case of communication failure, turn off buzzer for safety
    digitalWrite(PIN_BUZZER, LOW);
  }

  http.end();
}

// ==============================================================================
// WI-FI CONNECTION HELPER
// ==============================================================================
void connectWiFi() {
  Serial.printf("[Wi-Fi] Connecting to SSID: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(400);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[Wi-Fi] Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("\n[Wi-Fi] Connection timed out! Will retry on next sampling cycle.\n");
  }
}

// ==============================================================================
// DEBUG UTILITIES
// ==============================================================================
void printTelemetryDebug(const TelemetryData& data) {
  Serial.println("---------------- TELEMETRY SUMMARY ----------------");
  Serial.printf("  Temperature   : %.1f °C\n", data.temperature);
  Serial.printf("  Humidity      : %.1f %%\n", data.humidity);
  Serial.printf("  Soil Moisture : %.1f %% (ADC: %d)\n", data.soilMoisture, data.rawSoil);
  Serial.printf("  Air Quality   : %.1f ADC (Raw: %d)\n", data.gasValue, data.rawGas);
  Serial.printf("  Light Level   : %.1f ADC (Raw: %d)\n", data.ldrValue, data.rawLdr);
  Serial.println("---------------------------------------------------");
}
