"""
Smart Recommendation Engine:
Generates practical, domain-specific actionable advice for silkworm rearers
based on active environmental deviations.
"""

def generate_recommendations(temp, hum, gas, soil=None, ldr=None):
    """
    Evaluates microclimate parameters and returns a list of concrete farmer action items.
    """
    recommendations = []

    # Temperature Actions
    if temp < 24.0:
        recommendations.append({
            'parameter': 'Temperature',
            'action': 'Turn on warming lamp / close cold draft curtains.',
            'rationale': 'Low temperatures retard silkworm metabolic activity and prolong instars.'
        })
    elif temp > 28.0:
        recommendations.append({
            'parameter': 'Temperature',
            'action': 'Activate exhaust fan and open cross-ventilation flaps.',
            'rationale': 'High temperature induces thermal stress and increases disease susceptibility.'
        })

    # Humidity Actions
    if hum < 70.0:
        recommendations.append({
            'parameter': 'Humidity',
            'action': 'Mist fresh mulberry leaves with clean water and spread wet gunny bags on floor.',
            'rationale': 'Dry conditions desiccate mulberry leaves rapidly, causing silkworm starvation.'
        })
    elif hum > 85.0:
        recommendations.append({
            'parameter': 'Humidity',
            'action': 'Increase room ventilation and dust rearing beds with dry slaked lime.',
            'rationale': 'High humidity creates breeding grounds for fungal muscardine and viral flacherie.'
        })

    # Gas / Air Quality Actions
    if gas > 1500.0:
        recommendations.append({
            'parameter': 'Air Quality',
            'action': 'Ventilate room immediately and clean accumulated silkworm litter.',
            'rationale': 'Decomposing excreta releases toxic ammonia, suffocating developing larvae.'
        })

    # Soil / Bed Moisture Actions
    if soil is not None:
        if soil < 30.0:
            recommendations.append({
                'parameter': 'Bed Moisture',
                'action': 'Lightly dampen the rearing tray bed paper to preserve humidity.',
                'rationale': 'Overly dry rearing beds dehydrate young silkworm instars.'
            })
        elif soil > 70.0:
            recommendations.append({
                'parameter': 'Bed Moisture',
                'action': 'Replace damp rearing bed paper and avoid spraying water directly onto larvae.',
                'rationale': 'Waterlogged beds rot feed leaves and spread bacterial pathogens.'
            })

    # Light Actions
    if ldr is not None:
        if ldr < 200.0:
            recommendations.append({
                'parameter': 'Lighting',
                'action': 'Provide soft, indirect diffuse lighting (16 hours light / 8 hours dark).',
                'rationale': 'Complete darkness reduces larval feeding rhythm and synchronization.'
            })
        elif ldr > 800.0:
            recommendations.append({
                'parameter': 'Lighting',
                'action': 'Shade rearing trays from direct bright sunlight or harsh bulbs.',
                'rationale': 'Direct sunlight causes rapid dehydration and photostress.'
            })

    return recommendations

