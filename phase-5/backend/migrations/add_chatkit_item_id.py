"""
Database migration to add chatkit_item_id column to messages table.

Run this script to add the required column for chat message persistence.
"""

import os
import sys

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in environment")
    sys.exit(1)

print(f"Connecting to database...")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'messages' AND column_name = 'chatkit_item_id'
        """))
        column_exists = result.fetchone() is not None

        if column_exists:
            print("[OK] chatkit_item_id column already exists")
        else:
            print("Adding chatkit_item_id column to messages table...")
            conn.execute(text("""
                ALTER TABLE messages
                ADD COLUMN chatkit_item_id VARCHAR(100) DEFAULT '' NOT NULL
            """))
            conn.commit()
            print("[OK] Successfully added chatkit_item_id column")

            # Also add index for better query performance
            print("Adding index on chatkit_item_id...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_messages_chatkit_item_id
                ON messages (chatkit_item_id)
            """))
            conn.commit()
            print("[OK] Successfully added index")

        print("\nMigration completed successfully!")

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
