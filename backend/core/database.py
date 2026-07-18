""" Loading of env variables, SQLAlchemy engine creation, Managing database session"""

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
load_dotenv()

DATABASE_URL= os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

#SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal= sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()