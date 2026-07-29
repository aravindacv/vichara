import os
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from sqlalchemy.orm import Session as DBSession
from app.models.student import Student
from app.models.instructor import Instructor
from app.models.session import Session
from app.services.security import hash_password, verify_password

load_dotenv()

SESSION_LIFETIME_DAYS = 7


class AuthError(Exception):
    pass


def _create_session(db: DBSession, subject_id: str, role: str) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_LIFETIME_DAYS)
    session = Session(token=token, student_id=subject_id, role=role, expires_at=expires_at)
    db.add(session)
    db.commit()
    return token


def _get_valid_session(db: DBSession, token: str) -> Session | None:
    if not token:
        return None
    session = db.query(Session).filter(Session.token == token).first()
    if not session:
        return None

    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        db.delete(session)
        db.commit()
        return None

    return session


# ---------- Student login (low-friction: roll number + name + class passcode) ----------

def login(db: DBSession, roll_number: str, name: str, passcode: str) -> tuple[Student, str]:
    roll_number = roll_number.strip()
    name = name.strip()

    if not roll_number or not name:
        raise AuthError("Roll number and name are both required.")

    expected_passcode = os.getenv("CLASS_PASSCODE", "")
    if not expected_passcode:
        raise AuthError("No class passcode is configured on the server yet. Ask your instructor.")
    if passcode != expected_passcode:
        raise AuthError("Incorrect class passcode.")

    student = db.query(Student).filter(Student.roll_number == roll_number).first()
    if student:
        if student.name != name:
            student.name = name
            db.commit()
            db.refresh(student)
    else:
        student = Student(roll_number=roll_number, name=name)
        db.add(student)
        db.commit()
        db.refresh(student)

    token = _create_session(db, student.roll_number, role="student")
    return student, token


def validate_session(db: DBSession, token: str) -> Student | None:
    """Student-facing session validation - only accepts a student-role session."""
    session = _get_valid_session(db, token)
    if not session or session.role != "student":
        return None
    return db.query(Student).filter(Student.roll_number == session.student_id).first()


# ---------- Instructor login (real password, subject-mapped) ----------

def instructor_login(
    db: DBSession, instructor_id: str, name: str, password: str, signup_code: str, subjects: list[str]
) -> tuple[Instructor, str]:
    instructor_id = instructor_id.strip()
    name = name.strip()

    if not instructor_id or not name or not password:
        raise AuthError("Instructor ID, name, and password are all required.")

    existing = db.query(Instructor).filter(Instructor.instructor_id == instructor_id).first()

    if existing:
        if not verify_password(password, existing.password_hash):
            raise AuthError("Incorrect password.")
        instructor = existing
    else:
        expected_signup_code = os.getenv("INSTRUCTOR_SIGNUP_CODE", "")
        if not expected_signup_code:
            raise AuthError("No instructor signup code is configured on the server yet.")
        if signup_code != expected_signup_code:
            raise AuthError("Incorrect signup code for creating a new instructor account.")
        if len(password) < 6:
            raise AuthError("Password must be at least 6 characters.")
        if not subjects:
            raise AuthError("Select at least one subject you teach.")

        instructor = Instructor(
            instructor_id=instructor_id, name=name, password_hash=hash_password(password), subjects=subjects
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)

    token = _create_session(db, instructor.instructor_id, role="instructor")
    return instructor, token


def validate_instructor_session(db: DBSession, token: str) -> Instructor | None:
    """Instructor-facing session validation - only accepts an instructor-role session."""
    session = _get_valid_session(db, token)
    if not session or session.role != "instructor":
        return None
    return db.query(Instructor).filter(Instructor.instructor_id == session.student_id).first()


def logout(db: DBSession, token: str) -> None:
    session = db.query(Session).filter(Session.token == token).first()
    if session:
        db.delete(session)
        db.commit()