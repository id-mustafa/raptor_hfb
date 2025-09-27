from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

__authors__ = ["Mustafa Aljumayli"]

load_dotenv()  # Load .env file

# Read DB URL from env
db_url = os.getenv("DATABASE_URL")

# Set echo=True only in development
engine = create_engine(
    db_url, echo=True, connect_args={"options": "-c statement_timeout=5000"}
)  # You can set echo=False in prod


def db_session():
    """Generator function to add dependency injection of SQLModel Sessions"""
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
