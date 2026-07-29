from sqlalchemy import Column, String, JSON, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from app.database import Base


class Problem(Base):
    __tablename__ = "problems"

    id = Column(String, primary_key=True)  # e.g. "intro_loops_01", "dsa_binary_search_01"
    subject = Column(String, nullable=False)  # "intro_programming" | "dsa"
    prompt = Column(String, nullable=False)
    design_requirements = Column(JSON, nullable=False)
    # e.g. ["pseudocode_steps"] for intro, ["data_structure_choice","complexity_estimate","invariant_statement"] for DSA
    test_cases = Column(JSON, nullable=False)
    trace_targets = Column(JSON, nullable=False)  # e.g. ["variable_state"] or ["array_state","pointer_positions"]
    rubric = Column(JSON, nullable=True)


class DesignSubmission(Base):
    __tablename__ = "design_submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, nullable=False, index=True)
    problem_id = Column(String, ForeignKey("problems.id"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    content = Column(JSON, nullable=False)  # shape depends on subject — see design_gate service
    code_unlocked = Column(Boolean, default=False)
    reviewer_note = Column(String, nullable=True)  # for the "mismatch triggers a follow-up, not a red X" flow
    created_at = Column(DateTime(timezone=True), server_default=func.now())