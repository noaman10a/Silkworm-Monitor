from datetime import datetime, timezone, timedelta

# Indian Standard Time (IST) is UTC + 5 hours and 30 minutes
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Returns current datetime adjusted to Indian Standard Time (naive for SQLite/Postgres compatibility)."""
    return datetime.now(IST).replace(tzinfo=None)

def format_ist_str(dt):
    """Formats datetime object to standard IST string representation."""
    if dt is None:
        return "--"
    return dt.strftime("%Y-%m-%d %H:%M:%S IST")

def format_iso(dt):
    """Formats datetime object to ISO 8601 standard string."""
    if dt is None:
        return None
    return dt.isoformat()
