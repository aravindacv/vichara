from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.design import Problem, DesignSubmission
from app.models.execution_log import ExecutionLog
from app.models.student import Student
from app.services import execution, flowchart
from app.dependencies import get_current_student

router = APIRouter(prefix="/api/execution", tags=["execution"])


class RunRequest(BaseModel):
    problem_id: str
    code: str
    function_name: str
    test_case_index: int = 0


@router.post("/run")
def run_code(
    payload: RunRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
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
    if not submission or not submission.code_unlocked:
        raise HTTPException(status_code=403, detail="Complete the design step before running code.")

    if payload.test_case_index >= len(problem.test_cases):
        raise HTTPException(status_code=400, detail="Invalid test case index.")
    test_case = problem.test_cases[payload.test_case_index]

    try:
        result = execution.run_traced(payload.code, payload.function_name, test_case["input"])
    except execution.ExecutionError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result["expected"] = test_case["expected"]
    result["passed"] = result.get("result") == test_case["expected"]
    result["trace_targets"] = problem.trace_targets

    db.add(ExecutionLog(student_id=student.roll_number, problem_id=payload.problem_id, passed=result["passed"]))
    db.commit()

    try:
        result["flowchart"] = flowchart.build_flowchart(payload.code, payload.function_name)
    except flowchart.FlowchartError as e:
        result["flowchart"] = None
        result["flowchart_error"] = str(e)

    return result