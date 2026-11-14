import csv
import io
import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, Response, current_app
from sqlalchemy import or_, desc

from app.extensions import db
from app.models.sensor import SensorReading
from app.models.alert import AlertEvent
from app.utils.timestamps import get_ist_now, format_ist_str
from app.utils.validation import validate_sensor_payload
from app.services.health_service import check_silkworm_health

sensor_bp = Blueprint('sensors', __name__)

def apply_retention_policy():
    """Removes records older than configured retention threshold (if enabled)."""
    retention_days = current_app.config.get('DATA_RETENTION_DAYS', 30)
    if retention_days > 0:
        cutoff = get_ist_now() - timedelta(days=retention_days)
        SensorReading.query.filter(SensorReading.timestamp < cutoff).delete()
        db.session.commit()

# ==============================================================================
# 1. Ingest Sensor Data (Supports /api/data and /api/v1/sensors/data)
# ==============================================================================
@sensor_bp.route('/data', methods=['POST'])
@sensor_bp.route('/v1/sensors/data', methods=['POST'])
def receive_data():
    """Receives JSON telemetry from ESP32 or simulation, validates, stores, and evaluates."""
    payload = request.get_json(force=True, silent=True)
    if not payload:
        return jsonify({"status": "error", "message": "Missing JSON body."}), 400

    is_valid, cleaned, error_msg = validate_sensor_payload(payload)
    if not is_valid:
        return jsonify({"status": "error", "message": error_msg}), 422

    try:
        new_reading = SensorReading(
            temperature=cleaned['temperature'],
            humidity=cleaned['humidity'],
            soil_moisture=cleaned['soil_moisture'],
            gas_value=cleaned['gas_value'],
            ldr_value=cleaned['ldr_value'],
            raw_soil=cleaned['raw_soil'],
            raw_gas=cleaned['raw_gas'],
            raw_ldr=cleaned['raw_ldr'],
            motion_detected=cleaned['motion_detected'],
            is_simulated=cleaned['is_simulated'],
            timestamp=get_ist_now()
        )
        db.session.add(new_reading)
        db.session.commit()

        # Run health check
        health = check_silkworm_health(
            cleaned['temperature'], cleaned['humidity'], cleaned['gas_value'],
            cleaned['soil_moisture'], cleaned['ldr_value']
        )

        # Log active alerts into alert_events table if non-optimal
        if not health['is_healthy']:
            for w in health['warnings']:
                param = "General"
                if "Temperature" in w: param = "Temperature"
                elif "Humidity" in w: param = "Humidity"
                elif "Gas" in w or "Air" in w: param = "Air Quality"
                elif "Moisture" in w or "Soil" in w: param = "Bed Moisture"
                elif "Light" in w: param = "Lighting"

                alert = AlertEvent(
                    reading_id=new_reading.id,
                    severity=health['severity'],
                    parameter=param,
                    message=w,
                    timestamp=get_ist_now()
                )
                db.session.add(alert)
            db.session.commit()

        # Safe retention policy execution
        try:
            apply_retention_policy()
        except Exception:
            pass # Non-critical; do not fail the incoming telemetry ingestion

        return jsonify({
            "status": "success",
            "message": "Telemetry persisted and analyzed successfully.",
            "entry": new_reading.to_dict(),
            "buzzer": health['buzzer']
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database transaction error: {str(e)}"}), 500

# ==============================================================================
# 2. Get Latest Reading (Supports /api/latest and /api/v1/sensors/latest)
# ==============================================================================
@sensor_bp.route('/latest', methods=['GET'])
@sensor_bp.route('/v1/sensors/latest', methods=['GET'])
def get_latest():
    """Returns the most recent reading and latest alert time."""
    latest = SensorReading.query.order_by(SensorReading.id.desc()).first()
    if not latest:
        return jsonify({"has_data": False, "message": "No sensor readings recorded yet."}), 200

    res = latest.to_dict()
    res["has_data"] = True

    # Find the timestamp of the most recent alert event
    last_alert = AlertEvent.query.order_by(AlertEvent.id.desc()).first()
    res["last_alert_time"] = format_ist_str(last_alert.timestamp) if last_alert else "None recently (All clear)"

    return jsonify(res), 200

# ==============================================================================
# 3. Paginated History with SQL-Level Search & Filter
# ==============================================================================
@sensor_bp.route('/history', methods=['GET'])
@sensor_bp.route('/v1/sensors/history', methods=['GET'])
def get_history():
    """
    Returns paginated sensor history using SQL-level queries.
    Query parameters:
    - page: int (default 1)
    - per_page: int (default 20, max 100)
    - status: 'all' | 'healthy' | 'caution' | 'alert'
    - search: string query
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status_filter = request.args.get('status', 'all').lower()
    search = request.args.get('search', '').strip()

    query = SensorReading.query

    # Apply search filter if query string provided
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                SensorReading.temperature.cast(db.String).like(search_fmt),
                SensorReading.humidity.cast(db.String).like(search_fmt),
                SensorReading.soil_moisture.cast(db.String).like(search_fmt),
                SensorReading.gas_value.cast(db.String).like(search_fmt),
                SensorReading.ldr_value.cast(db.String).like(search_fmt),
                SensorReading.timestamp.cast(db.String).like(search_fmt)
            )
        )

    # Order descending
    query = query.order_by(SensorReading.id.desc())

    # Get total count before pagination
    total_matching = query.count()
    total_records = SensorReading.query.count()

    # Apply SQL pagination
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    items = []
    for item in paginated.items:
        dict_item = item.to_dict()
        if status_filter == 'healthy' and not dict_item['is_healthy']:
            continue
        if status_filter == 'alert' and dict_item['is_healthy']:
            continue
        if status_filter == 'caution' and dict_item['severity'] != 1:
            continue
        items.append(dict_item)

    # Calculate overall analytics across DB
    avg_temp_val = db.session.query(db.func.avg(SensorReading.temperature)).scalar() or 0.0
    avg_hum_val = db.session.query(db.func.avg(SensorReading.humidity)).scalar() or 0.0
    alert_count = AlertEvent.query.count()

    return jsonify({
        "status": "success",
        "items": items,
        "total_records": total_records,
        "total_filtered": total_matching,
        "page": paginated.page,
        "per_page": per_page,
        "total_pages": max(1, paginated.pages),
        "analytics": {
            "avg_temp": round(float(avg_temp_val), 1),
            "avg_hum": round(float(avg_hum_val), 1),
            "alert_count": alert_count
        }
    }), 200

# ==============================================================================
# 4. Sensor Simulation Generator
# ==============================================================================
@sensor_bp.route('/simulate', methods=['POST'])
@sensor_bp.route('/v1/sensors/simulate', methods=['POST'])
def simulate_reading():
    """Generates and saves a simulated sensor reading directly from web dashboard."""
    data = request.get_json(silent=True) or {}
    
    temp = float(data.get('temperature', round(random.uniform(23.0, 29.5), 1)))
    hum = float(data.get('humidity', round(random.uniform(68.0, 88.0), 1)))
    soil = float(data.get('soil_moisture', round(random.uniform(25.0, 75.0), 1)))
    gas = float(data.get('gas_value', round(random.uniform(400.0, 1700.0), 1)))
    ldr = float(data.get('ldr_value', round(random.uniform(180.0, 850.0), 1)))

    new_reading = SensorReading(
        temperature=temp,
        humidity=hum,
        soil_moisture=soil,
        gas_value=gas,
        ldr_value=ldr,
        raw_soil=int(soil * 40.95),
        raw_gas=int(gas),
        raw_ldr=int(ldr),
        is_simulated=True,
        timestamp=get_ist_now()
    )
    db.session.add(new_reading)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Simulated reading recorded successfully.",
        "entry": new_reading.to_dict()
    }), 201

# ==============================================================================
# 5. CSV Data Export
# ==============================================================================
@sensor_bp.route('/export-csv', methods=['GET'])
@sensor_bp.route('/v1/sensors/export-csv', methods=['GET'])
def export_csv():
    """Streams all recorded sensor data as an IST-formatted CSV file."""
    records = SensorReading.query.order_by(SensorReading.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Record ID', 'IST Timestamp', 'Temperature (C)', 'Humidity (%)', 
        'Soil Moisture (%)', 'Gas (ADC/PPM)', 'Light (ADC/Lux)', 'Health Status'
    ])

    for r in records:
        health = check_silkworm_health(r.temperature, r.humidity, r.gas_value, r.soil_moisture, r.ldr_value)
        status_label = "Optimal" if health["is_healthy"] else ("Caution" if health["severity"] == 1 else "Critical")
        writer.writerow([
            r.id,
            format_ist_str(r.timestamp),
            r.temperature,
            r.humidity,
            r.soil_moisture,
            r.gas_value,
            r.ldr_value,
            status_label
        ])

    output.seek(0)
    filename = f"silkworm_sensor_history_{get_ist_now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )

