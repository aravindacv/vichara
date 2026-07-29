import pytest
from app.services import design_gate
from app.models.design import Problem


def make_problem(db, subject="intro_programming", pid="p1"):
    if subject == "intro_programming":
        requirements = ["pseudocode_steps"]
    else:
        requirements = ["data_structure_choice", "complexity_estimate", "invariant_statement"]
    p = Problem(
        id=pid, subject=subject, prompt="test prompt",
        design_requirements=requirements,
        test_cases=[{"input": 1, "expected": 1}],
        trace_targets=["variable_state"],
        rubric={},
    )
    db.add(p)
    db.commit()
    return p


# --- Structural validators (pure functions, no DB needed) ---

def test_intro_rejects_too_few_steps():
    ok, msg = design_gate.validate_intro_programming({"pseudocode_steps": ["a", "b"]})
    assert ok is False
    assert "3" in msg


def test_intro_accepts_three_steps():
    ok, msg = design_gate.validate_intro_programming({"pseudocode_steps": ["a", "b", "c"]})
    assert ok is True
    assert msg is None


def test_intro_rejects_empty_step():
    ok, msg = design_gate.validate_intro_programming({"pseudocode_steps": ["a", "", "c"]})
    assert ok is False


def test_dsa_rejects_missing_fields():
    ok, msg = design_gate.validate_dsa({"data_structure_choice": "Array"})
    assert ok is False
    assert "complexity_estimate" in msg


def test_dsa_accepts_complete_submission():
    ok, msg = design_gate.validate_dsa({
        "data_structure_choice": "Array",
        "complexity_estimate": "O(log n)",
        "invariant_statement": "the target, if present, is always within [low, high]",
    })
    assert ok is True


def test_dsa_rejects_too_short_invariant():
    ok, msg = design_gate.validate_dsa({
        "data_structure_choice": "Array",
        "complexity_estimate": "O(n)",
        "invariant_statement": "true",
    })
    assert ok is False


# --- Full submit/status flow (needs DB) ---

def test_submit_design_unlocks_on_valid_input(db):
    make_problem(db, subject="intro_programming", pid="intro_1")
    submission = design_gate.submit_design(db, "student1", "intro_1", {"pseudocode_steps": ["a", "b", "c"]})
    assert submission.code_unlocked is True


def test_submit_design_locks_on_invalid_input(db):
    make_problem(db, subject="intro_programming", pid="intro_2")
    submission = design_gate.submit_design(db, "student1", "intro_2", {"pseudocode_steps": ["a"]})
    assert submission.code_unlocked is False
    assert submission.reviewer_note is not None


def test_submit_design_unknown_problem_raises(db):
    with pytest.raises(design_gate.DesignValidationError):
        design_gate.submit_design(db, "student1", "does_not_exist", {"pseudocode_steps": ["a", "b", "c"]})


def test_get_latest_status_returns_most_recent(db):
    make_problem(db, subject="intro_programming", pid="intro_3")
    design_gate.submit_design(db, "student1", "intro_3", {"pseudocode_steps": ["a"]})       # invalid
    design_gate.submit_design(db, "student1", "intro_3", {"pseudocode_steps": ["a", "b", "c"]})  # valid (revision)
    latest = design_gate.get_latest_status(db, "student1", "intro_3")
    assert latest.code_unlocked is True


def test_get_latest_status_returns_none_when_nothing_submitted(db):
    make_problem(db, subject="intro_programming", pid="intro_4")
    assert design_gate.get_latest_status(db, "student1", "intro_4") is None