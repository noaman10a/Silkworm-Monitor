from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.extensions import db
from app.models.sensor import SensorReading
from app.models.alert import AlertEvent
from app.services.health_service import check_silkworm_health

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@analytics_bp.route('/v1/analytics/summary', methods=['GET'])
def get_summary():
    """Returns high-level KPI metrics across historical records."""
    total_records = SensorReading.query.count()
    if total_records == 0:
        return jsonify({
            "total_records": 0,
            "alert_count": 0,
            "healthy_count": 0,
            "health_rate_percent": 0.0,
            "summary": "No data recorded yet."
        }), 200

    alert_count = AlertEvent.query.count()
    
    # Calculate health rate
    # Estimate from alert count or recent sample
    sample = SensorReading.query.order_by(SensorReading.id.desc()).limit(100).all()
    sample_healthy = sum(1 for r in sample if check_silkworm_health(r.temperature, r.humidity, r.gas_value, r.soil_moisture, r.ldr_value)["is_healthy"])
    health_rate = round((sample_healthy / len(sample)) * 100.0, 1) if sample else 100.0

    return jsonify({
        "total_records": total_records,
        "alert_count": alert_count,
        "healthy_count": max(0, total_records - alert_count),
        "health_rate_percent": health_rate,
        "summary": f"{health_rate}% of sampled readings maintained optimal rearing conditions."
    }), 200

@analytics_bp.route('/v1/analytics/daily-averages', methods=['GET'])
def get_daily_averages():
    """Calculates daily averages for temperature, humidity, and soil moisture."""
    # SQL date truncation grouping
    daily_stats = db.session.query(
        func.date(SensorReading.timestamp).label('date'),
        func.round(func.avg(SensorReading.temperature), 1).label('avg_temp'),
        func.round(func.avg(SensorReading.humidity), 1).label('avg_hum'),
        func.round(func.avg(SensorReading.soil_moisture), 1).label('avg_soil'),
        func.count(SensorReading.id).label('reading_count')
    ).group_by(func.date(SensorReading.timestamp))\
     .order_by(func.date(SensorReading.timestamp).desc())\
     .limit(30)\
     .all()

    results = [
        {
            "date": stat.date,
            "avg_temperature": float(stat.avg_temp),
            "avg_humidity": float(stat.avg_hum),
            "avg_soil_moisture": float(stat.avg_soil),
            "total_readings": stat.reading_count
        } for stat in daily_stats
    ]

    return jsonify({
        "status": "success",
        "daily_averages": results
    }), 200

@analytics_bp.route('/v1/analytics/alerts', methods=['GET'])
def get_recent_alerts():
    """Returns recent alert event history."""
    limit = min(request.args.get('limit', 50, type=int), 100)
    alerts = AlertEvent.query.order_by(AlertEvent.id.desc()).limit(limit).all()

    return jsonify({
        "status": "success",
        "alerts": [a.to_dict() for a in alerts]
    }), 200
