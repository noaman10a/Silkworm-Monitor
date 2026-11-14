import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, cors
from app.routes.sensor_routes import sensor_bp
from app.routes.analytics_routes import analytics_bp

def create_app(config_name=None):
    """
    Application Factory Pattern for Silkworm Monitoring System.
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize Extensions
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)

    # Register Blueprints (Mounted at /api for both legacy and versioned routes)
    app.register_blueprint(sensor_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')

    # Root Health Status
    @app.route('/', methods=['GET'])
    def root_health():
        return jsonify({
            "service": "Smart Silkworm Monitoring System API",
            "version": "1.0.0",
            "status": "online",
            "docs_url": "/api/v1/sensors/latest"
        }), 200

    # Centralized Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"status": "error", "message": "Endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"status": "error", "message": "Internal server error."}), 500

    # Auto-create tables in development mode if not using migrations
    with app.app_context():
        # Ensure instance directory exists
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        if 'sqlite:///' in db_uri:
            db_path = db_uri.replace('sqlite:///', '')
            os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        db.create_all()

    return app
