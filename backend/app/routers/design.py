from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, Optional

from app.database import get_db
from app.models.design import Problem
from app.models.student import Student
from app.services import design_gate, tutor, rate_limit
from app.dependencies import get_current_student

router = APIRouter(prefix="/api", tags=["design-gate"])

DESIGN_REVIEW_MAX_CALLS = 15
DESIGN_REVIEW_WINDOW_SECONDS = 600  # 10 minutes


class DesignSubmitRequest(BaseModel):
    problem_id: str
    content: dict[str, Any]


class DesignSubmitResponse(BaseModel):
    code_unlocked: bool
    reviewer_note: Optional[str] = None
    content: Optional[dict[str, Any]] = None
    tutor_note: Optional[str] = None


@router.get("/problems/{problem_id}")
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    example = problem.test_cases[0] if problem.test_cases else None
    return {
        "id": problem.id,
        "subject": problem.subject,
        "prompt": problem.prompt,
        "design_requirements": problem.design_requirements,
        "example_input": example["input"] if example else None,
        "example_output": example["expected"] if example else None,
    }


@router.post("/design/submit", response_model=DesignSubmitResponse)
def submit_design(
    payload: DesignSubmitRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
    x_llm_provider: Optional[str] = Header("anthropic"),
    x_llm_api_key: Optional[str] = Header(None),
):
    try:
        submission = design_gate.submit_design(db, student.roll_number, payload.problem_id, payload.content)
    except design_gate.DesignValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    tutor_note = None
    if submission.code_unlocked:
        problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
        try:
            rate_limit.check_rate_limit(
                student.roll_number, "design_review", DESIGN_REVIEW_MAX_CALLS, DESIGN_REVIEW_WINDOW_SECONDS
            )
            tutor_note = tutor.review_design(problem.subject, problem.prompt, payload.content, x_llm_provider, x_llm_api_key)
        except rate_limit.RateLimitError:
            tutor_note = None  # skip the review silently - the design still saves either way
        except (tutor.MissingApiKeyError, tutor.UnknownProviderError):
            tutor_note = None  # no key set yet - design still saves, just no review note this time
        except Exception:
            tutor_note = None

    return DesignSubmitResponse(
        code_unlocked=submission.code_unlocked,
        reviewer_note=submission.reviewer_note,
        content=submission.content,
        tutor_note=tutor_note,
    )


@router.get("/design/status/{problem_id}", response_model=DesignSubmitResponse)
def design_status(
    problem_id: str,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    submission = design_gate.get_latest_status(db, student.roll_number, problem_id)
    if not submission:
        return DesignSubmitResponse(code_unlocked=False, reviewer_note=None, content=None)
    return DesignSubmitResponse(
        code_unlocked=submission.code_unlocked,
        reviewer_note=submission.reviewer_note,
        content=submission.content,
    )