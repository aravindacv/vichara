from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class Instructor(Base):
    __tablename__ = "instructors"

    instructor_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    subjects = Column(JSON, nullable=False, default=list)  # e.g. ["dsa"], ["intro_programming", "dsa"]
    created_at = Column(DateTime(timezone=True), server_default=func.now())