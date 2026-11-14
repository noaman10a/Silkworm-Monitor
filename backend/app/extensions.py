from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
cors = CORS()

try:
    from flask_migrate import Migrate
    migrate = Migrate()
except ImportError:
    class DummyMigrate:
        def init_app(self, app, db):
            pass
    migrate = DummyMigrate()

