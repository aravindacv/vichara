from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    roll_number = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())