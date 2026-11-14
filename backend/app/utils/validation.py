import math

def validate_sensor_payload(data):
    """
    Validates and sanitizes incoming sensor payload from ESP32 or simulation.
    Returns:
        tuple: (is_valid: bool, cleaned_data: dict, error_message: str)
    """
    if not isinstance(data, dict):
        return False, {}, "Payload must be a valid JSON object."

    try:
        temp = float(data.get('temperature', 0.0))
        hum = float(data.get('humidity', 0.0))
        soil = float(data.get('soil_moisture', 0.0))
        gas = float(data.get('gas_value', 0.0))
        ldr = float(data.get('ldr_value', 0.0))

        # Check for NaN or Infinity
        for val, name in [(temp, 'temperature'), (hum, 'humidity'), 
                          (soil, 'soil_moisture'), (gas, 'gas_value'), (ldr, 'ldr_value')]:
            if math.isnan(val) or math.isinf(val):
                return False, {}, f"Sensor '{name}' contains an invalid NaN or Infinite value."

        # Physical sanity bounds checking
        if not (-10.0 <= temp <= 80.0):
            return False, {}, f"Temperature reading {temp}°C is outside plausible hardware range (-10°C to 80°C)."
        if not (0.0 <= hum <= 100.0):
            return False, {}, f"Humidity reading {hum}% is outside valid range (0% to 100%)."

        # Optional raw ADC readings
        raw_soil = int(data.get('raw_soil', int(soil)))
        raw_gas = int(data.get('raw_gas', int(gas)))
        raw_ldr = int(data.get('raw_ldr', int(ldr)))

        cleaned = {
            'temperature': round(temp, 1),
            'humidity': round(hum, 1),
            'soil_moisture': round(soil, 1),
            'gas_value': round(gas, 1),
            'ldr_value': round(ldr, 1),
            'raw_soil': raw_soil,
            'raw_gas': raw_gas,
            'raw_ldr': raw_ldr,
            'motion_detected': bool(data.get('motion_detected', False)),
            'is_simulated': bool(data.get('is_simulated', False))
        }

        return True, cleaned, ""

    except (ValueError, TypeError) as e:
        return False, {}, f"Data format error: numeric values required ({str(e)})."
