"""
Sensor Calibration Service:
Converts raw 12-bit ADC readings (0 to 4095) from ESP32 into calibrated physical values
and provides domain-specific metadata.
"""

def calibrate_soil_moisture(raw_adc, dry_ref=4095, wet_ref=1200):
    """
    Calibrates analog soil sensor.
    In dry air, probe resistance is high (ADC ~ 4095).
    In submerged water, probe conductivity is high (ADC ~ 1200).
    Returns moisture percentage (0.0% to 100.0%).
    """
    if raw_adc is None:
        return 0.0
    
    clamped = max(wet_ref, min(dry_ref, raw_adc))
    pct = ((dry_ref - clamped) / float(dry_ref - wet_ref)) * 100.0
    return round(max(0.0, min(100.0, pct)), 1)

def evaluate_gas_quality(raw_adc):
    """
    Categorizes MQ-135 analog gas reading.
    Returns:
        dict: {'category': str, 'description': str}
    """
    if raw_adc < 800:
        return {'category': 'Clean', 'description': 'Fresh ambient air quality'}
    elif raw_adc < 1500:
        return {'category': 'Moderate', 'description': 'Acceptable rearing bed air quality'}
    elif raw_adc < 2500:
        return {'category': 'Elevated', 'description': 'Litter gas or ammonia buildup detected'}
    else:
        return {'category': 'Hazardous', 'description': 'Critical gas level - immediate ventilation required'}

def evaluate_light_level(raw_adc):
    """
    Categorizes LDR photocell reading.
    Returns:
        dict: {'category': str, 'description': str}
    """
    if raw_adc < 200:
        return {'category': 'Dark', 'description': 'Insufficient light for silkworm feeding'}
    elif raw_adc <= 800:
        return {'category': 'Optimal Diffuse', 'description': 'Ideal moderate diffuse lighting'}
    else:
        return {'category': 'Excessive Bright', 'description': 'Direct harsh light causing heat stress'}

