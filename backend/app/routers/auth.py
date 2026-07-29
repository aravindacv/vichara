from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services import auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    roll_number: str
    name: str
    passcode: str


class LoginResponse(BaseModel):
    roll_number: str
    name: str
    token: str


class InstructorLoginRequest(BaseModel):
    instructor_id: str
    name: str
    password: str
    signup_code: str = ""
    subjects: list[str] = []


class InstructorLoginResponse(BaseModel):
    instructor_id: str
    name: str
    subjects: list[str]
    token: str


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        student, token = auth.login(db, payload.roll_number, payload.name, payload.passcode)
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return LoginResponse(roll_number=student.roll_number, name=student.name, token=token)


@router.post("/instructor/login", response_model=InstructorLoginResponse)
def instructor_login(payload: InstructorLoginRequest, db: Session = Depends(get_db)):
    try:
        instructor, token = auth.instructor_login(
            db, payload.instructor_id, payload.name, payload.password, payload.signup_code, payload.subjects
        )
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return InstructorLoginResponse(
        instructor_id=instructor.instructor_id, name=instructor.name, subjects=instructor.subjects, token=token
    )


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        auth.logout(db, authorization.removeprefix("Bearer ").strip())
    return {"ok": True}