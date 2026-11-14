"""
Environmental Health Assessment Engine:
Classifies sericulture microclimate conditions across 3 tiers of severity.
"""
from app.services.recommendation_service import generate_recommendations

def check_silkworm_health(temp, hum, gas, soil=None, ldr=None):
    """
    Evaluates microclimate against optimal sericulture ranges:
    - Temperature: 24.0°C - 28.0°C
    - Humidity: 70.0% - 85.0%
    - Gas Value: < 1500 (lower air pollution is safer)
    - Soil Moisture: 30% - 70% (bed moisture)
    - LDR Light: 200 - 800 (diffuse rearing lighting)
    """
    warnings = []

    # Temperature Checks
    if temp < 24.0:
        warnings.append(f"Low Temperature ({temp}°C < 24°C): Stunts larval growth.")
    elif temp > 28.0:
        warnings.append(f"High Temperature ({temp}°C > 28°C): Risk of heat stress and cocoon defects.")

    # Humidity Checks
    if hum < 70.0:
        warnings.append(f"Low Humidity ({hum}% < 70%): Mulberry leaves wither quickly.")
    elif hum > 85.0:
        warnings.append(f"High Humidity ({hum}% > 85%): Fosters lethal viral/fungal diseases.")

    # Air Quality Checks
    if gas > 1500.0:
        warnings.append(f"High Gas/Air Pollution ({gas} > 1500): Toxic air quality detected.")

    # Bed Moisture Checks
    if soil is not None:
        if soil < 30.0:
            warnings.append(f"Low Bed Moisture ({soil}% < 30%): Rearing tray is too dry.")
        elif soil > 70.0:
            warnings.append(f"High Bed Moisture ({soil}% > 70%): Waterlogged bed invites bacterial rot.")

    # Light Checks
    if ldr is not None:
        if ldr < 200.0:
            warnings.append(f"Low Light ({ldr} < 200): Subdued light inhibits feeding.")
        elif ldr > 800.0:
            warnings.append(f"Excessive Light ({ldr} > 800): Harsh light causes photostress.")

    is_healthy = len(warnings) == 0

    # Severity Level: 0 = Optimal, 1 = Caution (1-2 warnings), 2 = Critical (3+ warnings)
    if is_healthy:
        severity = 0
        status_text = "Optimal Conditions"
    elif len(warnings) <= 2:
        severity = 1
        status_text = "Caution — Monitor Closely"
    else:
        severity = 2
        status_text = "Critical — Immediate Action Required"

    recommendations = generate_recommendations(temp, hum, gas, soil, ldr)

    # Buzzer triggers on any non-optimal state (severity 1 or 2)
    buzzer_trigger = not is_healthy

    return {
        "is_healthy": is_healthy,
        "severity": severity,
        "status_text": status_text,
        "warnings": warnings,
        "recommendations": recommendations,
        "buzzer": buzzer_trigger
    }
