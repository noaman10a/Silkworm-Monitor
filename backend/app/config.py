import os
from datetime import timedelta
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

basedir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.abspath(os.path.join(basedir, '..'))

class BaseConfig:
    """Base configuration with safe defaults."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'silkworm-monitoring-secret-key-2026')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Timezone: Default Indian Standard Time (Asia/Kolkata)
    TIMEZONE = os.getenv('TIMEZONE', 'Asia/Kolkata')
    
    # Retention policy: default 30 days (0 = unlimited retention)
    DATA_RETENTION_DAYS = int(os.getenv('DATA_RETENTION_DAYS', 30))
    
    # Optimal Silkworm Rearing Thresholds (Configurable)
    TEMP_MIN = float(os.getenv('TEMP_MIN', 24.0))
    TEMP_MAX = float(os.getenv('TEMP_MAX', 28.0))
    HUMIDITY_MIN = float(os.getenv('HUMIDITY_MIN', 70.0))
    HUMIDITY_MAX = float(os.getenv('HUMIDITY_MAX', 85.0))
    GAS_MAX_THRESHOLD = float(os.getenv('GAS_MAX_THRESHOLD', 1500.0))
    SOIL_MIN = float(os.getenv('SOIL_MIN', 30.0))
    SOIL_MAX = float(os.getenv('SOIL_MAX', 70.0))
    LDR_MIN = float(os.getenv('LDR_MIN', 200.0))
    LDR_MAX = float(os.getenv('LDR_MAX', 800.0))

class DevelopmentConfig(BaseConfig):
    """Development configuration using local SQLite database."""
    DEBUG = True
    default_db_path = os.path.join(parent_dir, 'instance', 'silkworm_monitor.db')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{default_db_path}')

class ProductionConfig(BaseConfig):
    """Production configuration (requires PostgreSQL in production)."""
    DEBUG = False
    # Handle Render / Heroku postgres:// -> postgresql:// uri fix
    db_url = os.getenv('DATABASE_URL', '')
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = db_url or f"sqlite:///{os.path.join(parent_dir, 'instance', 'silkworm_monitor.db')}"

class TestingConfig(BaseConfig):
    """Testing configuration with in-memory database."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
