from app.extensions import db
from app.utils.timestamps import get_ist_now, format_ist_str, format_iso
from app.services.health_service import check_silkworm_health

class SensorReading(db.Model):
    __tablename__ = 'sensor_data'  # Preserves exact table name for backwards compatibility!

    id = db.Column(db.Integer, primary_key=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    soil_moisture = db.Column(db.Float, nullable=False)
    gas_value = db.Column(db.Float, nullable=False)
    ldr_value = db.Column(db.Float, nullable=False)
    
    # Raw 12-bit ADC inputs
    raw_soil = db.Column(db.Integer, nullable=True)
    raw_gas = db.Column(db.Integer, nullable=True)
    raw_ldr = db.Column(db.Integer, nullable=True)
    
    # Optional flags
    motion_detected = db.Column(db.Boolean, default=False, nullable=False)
    is_simulated = db.Column(db.Boolean, default=False, nullable=False)

    # Timestamp in IST
    timestamp = db.Column(db.DateTime, default=get_ist_now, nullable=False, index=True)

    def to_dict(self):
        health = check_silkworm_health(
            self.temperature, self.humidity, self.gas_value, 
            self.soil_moisture, self.ldr_value
        )
        return {
            "id": self.id,
            "temperature": round(self.temperature, 1),
            "humidity": round(self.humidity, 1),
            "soil_moisture": round(self.soil_moisture, 1),
            "gas_value": round(self.gas_value, 1),
            "ldr_value": round(self.ldr_value, 1),
            "raw_soil": self.raw_soil if self.raw_soil is not None else int(self.soil_moisture),
            "raw_gas": self.raw_gas if self.raw_gas is not None else int(self.gas_value),
            "raw_ldr": self.raw_ldr if self.raw_ldr is not None else int(self.ldr_value),
            "motion_detected": self.motion_detected,
            "is_simulated": self.is_simulated,
            "timestamp": format_ist_str(self.timestamp),
            "timestamp_iso": format_iso(self.timestamp),
            "is_healthy": health["is_healthy"],
            "severity": health["severity"],
            "status_text": health["status_text"],
            "warnings": health["warnings"],
            "recommendations": health["recommendations"]
        }

    def __repr__(self):
        return f"<SensorReading id={self.id} temp={self.temperature} hum={self.humidity} time='{self.timestamp}'>"
