#!/usr/bin/env python
"""Fix alembic version table to point to current head."""
from sqlalchemy import create_engine, text
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)

# Get the current version from database
with engine.connect() as conn:
    result = conn.execute(text('SELECT version_num FROM alembic_version'))
    current = result.fetchone()
    print(f"Current version in database: {current[0] if current else 'None'}")

# Update to the head revision
head_revision = '23fd3d577a6b'  # add_recurring_task_fields
with engine.begin() as conn:
    conn.execute(text('DELETE FROM alembic_version'))
    conn.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{head_revision}')"))
    print(f"Updated alembic_version to: {head_revision}")
