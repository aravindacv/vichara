from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.student import Student
from app.models.instructor import Instructor
from app.models.design import Problem
from app.services import instructor
from app.dependencies import get_current_student, get_current_instructor

router = APIRouter(prefix="/api/instructor", tags=["instructor"])


class FeedbackSubmitRequest(BaseModel):
    student_id: str
    problem_id: str
    content: str


class FeedbackResponse(BaseModel):
    content: str | None = None


@router.get("/overview")
def overview(db: Session = Depends(get_db), current: Instructor = Depends(get_current_instructor)):
    return instructor.get_overview(db, current.subjects)


@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackSubmitRequest,
    db: Session = Depends(get_db),
    current: Instructor = Depends(get_current_instructor),
):
    problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
    if not problem or problem.subject not in current.subjects:
        raise HTTPException(status_code=403, detail="You aren't mapped to this problem's subject.")
    try:
        entry = instructor.submit_feedback(db, payload.student_id, payload.problem_id, payload.content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return FeedbackResponse(content=entry.content)


@router.get("/feedback/{student_id}/{problem_id}", response_model=FeedbackResponse)
def get_feedback(
    student_id: str,
    problem_id: str,
    db: Session = Depends(get_db),
    current: Instructor = Depends(get_current_instructor),
):
    entry = instructor.get_latest_feedback(db, student_id, problem_id)
    return FeedbackResponse(content=entry.content if entry else None)


@router.get("/feedback/self/{problem_id}", response_model=FeedbackResponse)
def get_own_feedback(
    problem_id: str,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    # Student-facing, session-scoped - a student can only ever fetch their own feedback.
    entry = instructor.get_latest_feedback(db, student.roll_number, problem_id)
    return FeedbackResponse(content=entry.content if entry else None)