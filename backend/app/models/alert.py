from app.extensions import db
from app.utils.timestamps import get_ist_now, format_ist_str, format_iso

class AlertEvent(db.Model):
    __tablename__ = 'alert_events'

    id = db.Column(db.Integer, primary_key=True)
    reading_id = db.Column(db.Integer, db.ForeignKey('sensor_data.id'), nullable=True)
    severity = db.Column(db.Integer, nullable=False) # 1 = Caution, 2 = Critical
    parameter = db.Column(db.String(50), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    recommendation = db.Column(db.String(255), nullable=True)
    is_resolved = db.Column(db.Boolean, default=False, nullable=False)
    timestamp = db.Column(db.DateTime, default=get_ist_now, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "reading_id": self.reading_id,
            "severity": self.severity,
            "parameter": self.parameter,
            "message": self.message,
            "recommendation": self.recommendation,
            "is_resolved": self.is_resolved,
            "timestamp": format_ist_str(self.timestamp),
            "timestamp_iso": format_iso(self.timestamp)
        }

