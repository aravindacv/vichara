"""
Design Gate service.

Core rule: a student cannot see/use the code editor for a problem until
their design artifact passes the *structural* check below. This is a
completeness check, not a correctness judgement — we're checking that
they engaged with design, not that their algorithm is right. Getting
the algorithm wrong is fine and expected; that's what the Socratic
Tutor and the tracer are for later.
"""

from sqlalchemy.orm import Session
from app.models.design import Problem, DesignSubmission


class DesignValidationError(Exception):
    pass


def validate_intro_programming(content: dict) -> tuple[bool, str | None]:
    steps = content.get("pseudocode_steps", [])
    if not isinstance(steps, list) or len(steps) < 3:
        return False, "Add at least 3 pseudocode steps before continuing."
    if any(not str(s).strip() for s in steps):
        return False, "One or more steps are empty — fill in every step."
    return True, None


def validate_dsa(content: dict) -> tuple[bool, str | None]:
    required = ["data_structure_choice", "complexity_estimate", "invariant_statement"]
    missing = [f for f in required if not str(content.get(f, "")).strip()]
    if missing:
        return False, f"Missing required field(s): {', '.join(missing)}."
    # Complexity estimate is NOT auto-graded against a reference answer here —
    # a mismatch should surface as a Socratic Tutor follow-up, not a hard fail.
    # We only check that something plausible was entered.
    if len(content["invariant_statement"].strip()) < 10:
        return False, "Your invariant statement is too short — describe what stays true at each loop step."
    return True, None


VALIDATORS = {
    "intro_programming": validate_intro_programming,
    "dsa": validate_dsa,
}


def submit_design(db: Session, student_id: str, problem_id: str, content: dict) -> DesignSubmission:
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise DesignValidationError(f"Unknown problem_id: {problem_id}")

    validator = VALIDATORS.get(problem.subject)
    if not validator:
        raise DesignValidationError(f"No validator registered for subject: {problem.subject}")

    is_valid, message = validator(content)

    submission = DesignSubmission(
        student_id=student_id,
        problem_id=problem_id,
        subject=problem.subject,
        content=content,
        code_unlocked=is_valid,
        reviewer_note=message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def get_latest_status(db: Session, student_id: str, problem_id: str) -> DesignSubmission | None:
    return (
        db.query(DesignSubmission)
        .filter(DesignSubmission.student_id == student_id, DesignSubmission.problem_id == problem_id)
        .order_by(DesignSubmission.created_at.desc(), DesignSubmission.id.desc())
        .first()
    )