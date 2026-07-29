from sqlalchemy.orm import Session
from app.models.reflection import ReflectionLog


class ReflectionValidationError(Exception):
    pass


def submit_reflection(db: Session, student_id: str, problem_id: str, content: str) -> ReflectionLog:
    if len(content.strip()) < 15:
        raise ReflectionValidationError(
            "Say a bit more — what actually clicked, or what confused you along the way?"
        )
    entry = ReflectionLog(student_id=student_id, problem_id=problem_id, content=content.strip())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_latest_reflection(db: Session, student_id: str, problem_id: str) -> ReflectionLog | None:
    return (
        db.query(ReflectionLog)
        .filter(ReflectionLog.student_id == student_id, ReflectionLog.problem_id == problem_id)
        .order_by(ReflectionLog.created_at.desc(), ReflectionLog.id.desc())
        .first()
    )