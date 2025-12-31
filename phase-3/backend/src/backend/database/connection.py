from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Use QueuePool for better connection management in long-running MCP server
# QueuePool maintains a pool of connections and reuses them
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,              # Maintain 5 connections in pool
    max_overflow=10,          # Allow up to 10 additional connections
    pool_recycle=3600,        # Recycle connections after 1 hour
    pool_pre_ping=True,       # Verify connections before use
    echo=False,
    connect_args={"connect_timeout": 30}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
