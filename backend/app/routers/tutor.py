from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, Optional

from app.database import get_db
from app.models.design import Problem, DesignSubmission
from app.models.student import Student
from app.services import tutor, rate_limit
from app.dependencies import get_current_student

router = APIRouter(prefix="/api/tutor", tags=["tutor"])

TUTOR_CHAT_MAX_CALLS = 20
TUTOR_CHAT_WINDOW_SECONDS = 600  # 10 minutes


class TutorRequest(BaseModel):
    problem_id: str
    code: str
    run_result: Optional[dict[str, Any]] = None
    student_message: str
    history: list[dict[str, str]] = []


class TutorResponse(BaseModel):
    reply: str


@router.post("/ask", response_model=TutorResponse)
def ask_tutor(
    payload: TutorRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
    x_llm_provider: Optional[str] = Header("anthropic"),
    x_llm_api_key: Optional[str] = Header(None),
):
    try:
        rate_limit.check_rate_limit(student.roll_number, "tutor_chat", TUTOR_CHAT_MAX_CALLS, TUTOR_CHAT_WINDOW_SECONDS)
    except rate_limit.RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))

    problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    submission = (
        db.query(DesignSubmission)
        .filter(
            DesignSubmission.student_id == student.roll_number,
            DesignSubmission.problem_id == payload.problem_id,
        )
        .order_by(DesignSubmission.created_at.desc(), DesignSubmission.id.desc())
        .first()
    )

    context = {
        "prompt": problem.prompt,
        "design": submission.content if submission else None,
        "code": payload.code,
        "run_result": payload.run_result,
    }

    try:
        reply = tutor.ask_tutor(problem.subject, context, payload.student_message, payload.history, x_llm_provider, x_llm_api_key)
    except (tutor.MissingApiKeyError, tutor.UnknownProviderError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Tutor unavailable: {e}")

    return TutorResponse(reply=reply)