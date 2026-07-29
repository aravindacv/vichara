from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Local dev uses SQLite. Swap to Postgres URL later — same SQLAlchemy models work.
SQLALCHEMY_DATABASE_URL = "sqlite:///./vichara.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()