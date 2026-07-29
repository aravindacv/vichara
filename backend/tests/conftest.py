import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import design, reflection, student, execution_log, instructor_feedback, session  # noqa: F401


@pytest.fixture
def db():
    """A fresh in-memory database for each test - never touches vichara.db."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session_obj = TestingSessionLocal()
    try:
        yield session_obj
    finally:
        session_obj.close()