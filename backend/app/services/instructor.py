from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.design import Problem, DesignSubmission
from app.models.execution_log import ExecutionLog
from app.models.reflection import ReflectionLog
from app.models.instructor_feedback import InstructorFeedback


def get_overview(db: Session, subjects: list[str]) -> dict:
    students = db.query(Student).order_by(Student.roll_number).all()
    problems = db.query(Problem).filter(Problem.subject.in_(subjects)).order_by(Problem.id).all()

    matrix = []
    for student in students:
        row = {"roll_number": student.roll_number, "name": student.name, "problems": {}}
        for problem in problems:
            design = (
                db.query(DesignSubmission)
                .filter(DesignSubmission.student_id == student.roll_number, DesignSubmission.problem_id == problem.id)
                .order_by(DesignSubmission.created_at.desc(), DesignSubmission.id.desc())
                .first()
            )
            attempts = (
                db.query(ExecutionLog)
                .filter(ExecutionLog.student_id == student.roll_number, ExecutionLog.problem_id == problem.id)
                .count()
            )
            passed = (
                db.query(ExecutionLog)
                .filter(
                    ExecutionLog.student_id == student.roll_number,
                    ExecutionLog.problem_id == problem.id,
                    ExecutionLog.passed == True,  # noqa: E712
                )
                .first()
                is not None
            )
            reflection = (
                db.query(ReflectionLog)
                .filter(ReflectionLog.student_id == student.roll_number, ReflectionLog.problem_id == problem.id)
                .order_by(ReflectionLog.created_at.desc(), ReflectionLog.id.desc())
                .first()
            )

            feedback = (
                db.query(InstructorFeedback)
                .filter(InstructorFeedback.student_id == student.roll_number, InstructorFeedback.problem_id == problem.id)
                .order_by(InstructorFeedback.created_at.desc(), InstructorFeedback.id.desc())
                .first()
            )

            row["problems"][problem.id] = {
                "design_submitted": design is not None,
                "code_unlocked": design.code_unlocked if design else False,
                "attempts": attempts,
                "passed": passed,
                "reflection_submitted": reflection is not None,
                "reflection_content": reflection.content if reflection else None,
                "feedback_content": feedback.content if feedback else None,
            }
        matrix.append(row)

    return {
        "problems": [{"id": p.id, "subject": p.subject, "prompt": p.prompt} for p in problems],
        "students": matrix,
    }


def submit_feedback(db: Session, student_id: str, problem_id: str, content: str) -> InstructorFeedback:
    content = content.strip()
    if not content:
        raise ValueError("Feedback cannot be empty.")
    entry = InstructorFeedback(student_id=student_id, problem_id=problem_id, content=content)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_latest_feedback(db: Session, student_id: str, problem_id: str) -> InstructorFeedback | None:
    return (
        db.query(InstructorFeedback)
        .filter(InstructorFeedback.student_id == student_id, InstructorFeedback.problem_id == problem_id)
        .order_by(InstructorFeedback.created_at.desc(), InstructorFeedback.id.desc())
        .first()
    )