"""
Run from backend/ with venv active:
    python seed_problems.py
Safe to re-run — skips any problem ID that already exists.
"""
from app.database import SessionLocal, engine, Base
from app.models.design import Problem

Base.metadata.create_all(bind=engine)
db = SessionLocal()

problems = [
    # ---------- Intro Programming ----------
    Problem(
        id="intro_loops_01",
        subject="intro_programming",
        prompt="Write a function that returns the sum of all even numbers from 1 to N (inclusive).",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 10, "expected": 30}, {"input": 1, "expected": 0}],
        trace_targets=["variable_state"],
        rubric={"min_steps": 3},
    ),
    Problem(
        id="intro_factorial_01",
        subject="intro_programming",
        prompt="Write a function that returns the factorial of a non-negative integer N (N!).",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 5, "expected": 120}, {"input": 0, "expected": 1}],
        trace_targets=["variable_state"],
        rubric={"min_steps": 3},
    ),
    Problem(
        id="intro_prime_check_01",
        subject="intro_programming",
        prompt="Write a function that returns True if a number N (N > 1) is prime, and False otherwise.",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 7, "expected": True}, {"input": 8, "expected": False}],
        trace_targets=["variable_state"],
        rubric={"min_steps": 3},
    ),
    # ---------- DSA ----------
    Problem(
        id="dsa_binary_search_01",
        subject="dsa",
        prompt="Implement binary search on a sorted array. Return the index of the target, or -1.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [1, 3, 5, 7, 9], "target": 7}, "expected": 3}],
        trace_targets=["array_state", "pointer_positions"],
        rubric={"expected_complexity": "O(log n)"},
    ),
    Problem(
        id="dsa_linear_search_01",
        subject="dsa",
        prompt="Implement linear search on an unsorted array. Return the index of the target, or -1. (Same signature as binary search — think about why the complexity differs.)",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [4, 2, 9, 1, 7], "target": 1}, "expected": 3}],
        trace_targets=["array_state", "pointer_positions"],
        rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_bubble_sort_01",
        subject="dsa",
        prompt="Implement bubble sort. Return the array sorted in ascending order.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [5, 2, 4, 1, 3]}, "expected": [1, 2, 3, 4, 5]}],
        trace_targets=["array_state", "pointer_positions"],
        rubric={"expected_complexity": "O(n^2)"},
    ),
]

for p in problems:
    existing = db.query(Problem).filter(Problem.id == p.id).first()
    if not existing:
        db.add(p)
        print(f"Added: {p.id}")
    else:
        print(f"Skipped (already exists): {p.id}")

db.commit()
db.close()
print("Done.")