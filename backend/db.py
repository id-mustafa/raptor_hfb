"""Creates the SQLModel Engine to be used across the application."""

import os
from pathlib import Path
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

# Load environment variables from backend/.env explicitly
dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=dotenv_path, override=False)

# Read DB URL from env (support common Supabase variants)
raw_database_url = (
    os.getenv("DATABASE_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
)

# Normalize and validate the URL
database_url = None
if raw_database_url:
    candidate = raw_database_url.strip().strip('"').strip("'")
    if candidate.startswith("postgres://"):
        candidate = candidate.replace("postgres://", "postgresql://", 1)
    parsed = urlparse(candidate)
    if parsed.scheme in {"http", "https"}:
        raise RuntimeError(
            "DATABASE_URL appears to be an HTTP(S) URL. Use your Postgres connection string (postgresql://...)."
        )
    # If using Supabase and sslmode isn't set, require SSL by default
    if (
        parsed.scheme.startswith("postgresql")
        and parsed.hostname
        and "supabase.co" in parsed.hostname
    ):
        query_items = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if "sslmode" not in query_items:
            query_items["sslmode"] = "require"
            candidate = urlunparse(
                (
                    parsed.scheme,
                    parsed.netloc,
                    parsed.path,
                    parsed.params,
                    urlencode(query_items),
                    parsed.fragment,
                )
            )
    database_url = candidate

if not database_url:
    raise RuntimeError(
        "DATABASE_URL is not set. Provide your Postgres connection string via backend/.env."
    )

# Create engine; prefer echo=True in dev
try:
    engine = create_engine(
        database_url,
        echo=True,
        pool_pre_ping=True,
    )
except ModuleNotFoundError as e:
    missing = str(e)
    raise RuntimeError(
        f"Database driver missing ({missing}). Install dependencies: pip install -r backend/requirements.txt"
    )


def db_session():
    """Generator function to add dependency injection of SQLModel Sessions"""
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
