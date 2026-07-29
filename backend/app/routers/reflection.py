from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.student import Student
from app.services import reflection
from app.dependencies import get_current_student

router = APIRouter(prefix="/api/reflection", tags=["reflection"])


class ReflectionSubmitRequest(BaseModel):
    problem_id: str
    content: str


class ReflectionResponse(BaseModel):
    submitted: bool
    content: Optional[str] = None


@router.post("/submit", response_model=ReflectionResponse)
def submit_reflection(
    payload: ReflectionSubmitRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    try:
        entry = reflection.submit_reflection(db, student.roll_number, payload.problem_id, payload.content)
    except reflection.ReflectionValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ReflectionResponse(submitted=True, content=entry.content)


@router.get("/status/{problem_id}", response_model=ReflectionResponse)
def reflection_status(
    problem_id: str,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    entry = reflection.get_latest_reflection(db, student.roll_number, problem_id)
    if not entry:
        return ReflectionResponse(submitted=False, content=None)
    return ReflectionResponse(submitted=True, content=entry.content)