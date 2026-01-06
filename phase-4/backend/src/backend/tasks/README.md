# Background Tasks

This directory contains background tasks for Phase 3 AI Chatbot maintenance.

## Message Cleanup Task

### Purpose

Deletes messages older than 2 days per Constitution P3-V (Data Retention Policy).

### Implementation

**File**: `message_cleanup.py`

**Function**: `cleanup_expired_messages() -> dict`

**Returns**:
```python
{
    "success": True,         # Whether cleanup succeeded
    "deleted_count": 42,     # Number of messages deleted
    "timestamp": "2025-12-23T02:00:00"  # Cleanup execution time
}
```

### Scheduling

#### Option 1: Cron Job (Recommended for Production)

**Schedule**: Daily at 2 AM UTC

```bash
# Add to crontab (crontab -e):
0 2 * * * cd /app/phase-3/backend && python -c "from src.tasks.message_cleanup import cleanup_expired_messages; cleanup_expired_messages()"
```

**With virtual environment**:
```bash
0 2 * * * cd /app/phase-3/backend && /app/venv/bin/python -c "from src.tasks.message_cleanup import cleanup_expired_messages; cleanup_expired_messages()"
```

**With logging**:
```bash
0 2 * * * cd /app/phase-3/backend && python -c "from src.tasks.message_cleanup import cleanup_expired_messages; result = cleanup_expired_messages(); print(f'Cleanup: {result}')" >> /var/log/message-cleanup.log 2>&1
```

#### Option 2: Direct Execution (Testing)

**Run manually**:
```bash
cd phase-3/backend
python -m src.tasks.message_cleanup
```

**Expected output**:
```
Cleanup result: {'success': True, 'deleted_count': 0, 'timestamp': '2025-12-23T12:00:00'}
```

#### Option 3: APScheduler (In-Process Scheduler)

**Installation**:
```bash
uv add apscheduler
```

**Add to FastAPI app**:
```python
# phase-3/backend/main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from src.tasks.message_cleanup import cleanup_expired_messages

# Create scheduler
scheduler = AsyncIOScheduler()

# Schedule cleanup task (daily at 2 AM UTC)
scheduler.add_job(
    cleanup_expired_messages,
    CronTrigger(hour=2, minute=0),
    id="message_cleanup",
    name="Delete expired messages",
    replace_existing=True,
)

# Start scheduler on app startup
@app.on_event("startup")
async def start_scheduler():
    scheduler.start()
    print("Background task scheduler started")

# Stop scheduler on app shutdown
@app.on_event("shutdown")
async def stop_scheduler():
    scheduler.shutdown()
    print("Background task scheduler stopped")
```

#### Option 4: Systemd Timer (Linux)

**Create timer unit** (`/etc/systemd/system/message-cleanup.timer`):
```ini
[Unit]
Description=Message Cleanup Timer
Requires=message-cleanup.service

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Create service unit** (`/etc/systemd/system/message-cleanup.service`):
```ini
[Unit]
Description=Message Cleanup Service

[Service]
Type=oneshot
WorkingDirectory=/app/phase-3/backend
ExecStart=/app/venv/bin/python -c "from src.tasks.message_cleanup import cleanup_expired_messages; cleanup_expired_messages()"
User=www-data
StandardOutput=journal
StandardError=journal
```

**Enable and start**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable message-cleanup.timer
sudo systemctl start message-cleanup.timer

# Check status
sudo systemctl status message-cleanup.timer
```

### Testing

**Run standalone test**:
```bash
cd phase-3/backend
python test_message_cleanup_standalone.py
```

**Expected output**:
```
============================================================
MESSAGE CLEANUP TEST
============================================================

1. Messages before test: 0
...
3. Running cleanup_expired_messages() on real data...
   Result: {'success': True, 'deleted_count': 0, 'timestamp': '...'}

[PASS] BASIC TEST PASSED
```

### Monitoring

**Check logs**:
```bash
# If using systemd
sudo journalctl -u message-cleanup.service

# If using cron with logfile
tail -f /var/log/message-cleanup.log
```

**Verify cleanup is running**:
```python
# Query messages close to expiry
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.message import Message
from datetime import datetime, timedelta

with Session(engine) as session:
    near_expiry = datetime.utcnow() + timedelta(hours=24)
    statement = select(Message).where(Message.expires_at < near_expiry)
    messages = session.exec(statement).all()
    print(f"Messages expiring within 24h: {len(messages)}")
```

### Troubleshooting

**Issue**: Cleanup not deleting messages

**Solutions**:
1. Check if cron job is running: `grep CRON /var/log/syslog`
2. Verify database connection in cron environment
3. Check message `expires_at` field is set correctly
4. Run manual cleanup to see errors

**Issue**: Permission denied

**Solutions**:
1. Ensure cron user has read access to project files
2. Check database connection string in environment
3. Verify Python environment is accessible

**Issue**: No expired messages found

**Expected**: If all messages are recent, `deleted_count` will be 0 (normal behavior)

### Production Deployment

**Environment variables** (required):
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

**Recommendations**:
- Use cron job for simplicity
- Log to separate file for monitoring
- Set up alerts if cleanup fails
- Monitor database size to verify cleanup is working
- Run cleanup during low-traffic hours (2 AM UTC)

### Constitution Compliance

**Constitution P3-V (Data Retention)**:
- Messages expire after 2 days
- `Message.expires_at` field set automatically on creation
- Daily cleanup task removes expired messages
- Cleanup logs for monitoring and compliance
