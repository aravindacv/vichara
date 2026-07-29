from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.student import Student
from app.models.instructor import Instructor
from app.services import auth


def get_current_student(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Student:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in again.")

    token = authorization.removeprefix("Bearer ").strip()
    student = auth.validate_session(db, token)
    if not student:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")

    return student


def get_current_instructor(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Instructor:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated as instructor. Please sign in again.")

    token = authorization.removeprefix("Bearer ").strip()
    instructor = auth.validate_instructor_session(db, token)
    if not instructor:
        raise HTTPException(status_code=401, detail="Instructor session expired or invalid. Please sign in again.")

    return instructor