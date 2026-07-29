from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    token = Column(String, primary_key=True)
    student_id = Column(String, nullable=False, index=True)  # holds roll_number OR instructor_id depending on role
    role = Column(String, nullable=False, default="student")  # "student" | "instructor"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)