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
        id="intro_loops_01", subject="intro_programming",
        prompt="Write a function that returns the sum of all even numbers from 1 to N (inclusive).",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 10, "expected": 30}, {"input": 1, "expected": 0}],
        trace_targets=["variable_state"], rubric={"min_steps": 3},
    ),
    Problem(
        id="intro_factorial_01", subject="intro_programming",
        prompt="Write a function that returns the factorial of a non-negative integer N (N!).",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 5, "expected": 120}, {"input": 0, "expected": 1}],
        trace_targets=["variable_state"], rubric={"min_steps": 3},
    ),
    Problem(
        id="intro_prime_check_01", subject="intro_programming",
        prompt="Write a function that returns True if a number N (N > 1) is prime, and False otherwise.",
        design_requirements=["pseudocode_steps"],
        test_cases=[{"input": 7, "expected": True}, {"input": 8, "expected": False}],
        trace_targets=["variable_state"], rubric={"min_steps": 3},
    ),
    # ---------- DSA: Searching ----------
    Problem(
        id="dsa_binary_search_01", subject="dsa",
        prompt="Implement binary search on a sorted array. Return the index of the target, or -1.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [1, 3, 5, 7, 9], "target": 7}, "expected": 3}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(log n)"},
    ),
    Problem(
        id="dsa_linear_search_01", subject="dsa",
        prompt="Implement linear search on an unsorted array. Return the index of the target, or -1. (Same signature as binary search — think about why the complexity differs.)",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [4, 2, 9, 1, 7], "target": 1}, "expected": 3}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_first_last_occurrence_01", subject="dsa",
        prompt="Given a SORTED array with possible duplicates, return [first_index, last_index] of a target value's occurrences. Return [-1, -1] if not found. (Extends binary search — think about how you'd search for a boundary instead of an exact match.)",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [1, 2, 2, 2, 3, 4, 5], "target": 2}, "expected": [1, 3]}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(log n)"},
    ),
    # ---------- DSA: Sorting ----------
    Problem(
        id="dsa_bubble_sort_01", subject="dsa",
        prompt="Implement bubble sort. Return the array sorted in ascending order.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [5, 2, 4, 1, 3]}, "expected": [1, 2, 3, 4, 5]}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n^2)"},
    ),
    Problem(
        id="dsa_selection_sort_01", subject="dsa",
        prompt="Implement selection sort. Return the array sorted in ascending order. (Same complexity class as bubble sort — think about what's actually different in the approach.)",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [5, 2, 4, 1, 3]}, "expected": [1, 2, 3, 4, 5]}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n^2)"},
    ),
    Problem(
        id="dsa_insertion_sort_01", subject="dsa",
        prompt="Implement insertion sort. Return the array sorted in ascending order. (A third approach to the same problem — compare how the invariant differs from bubble and selection sort.)",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [5, 2, 4, 1, 3]}, "expected": [1, 2, 3, 4, 5]}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n^2)"},
    ),
    # ---------- DSA: Array manipulation ----------
    Problem(
        id="dsa_find_max_01", subject="dsa",
        prompt="Write a function that returns the largest value in an array (without using Python's built-in max()).",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [3, 7, 2, 9, 4]}, "expected": 9}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_two_sum_01", subject="dsa",
        prompt="Write a function that returns True if any two numbers in the array add up to a target value, False otherwise.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [2, 7, 11, 15], "target": 9}, "expected": True}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_rotate_array_01", subject="dsa",
        prompt="Write a function that rotates an array to the right by K positions and returns the rotated array. E.g. [1,2,3,4,5] rotated by 2 becomes [4,5,1,2,3].",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": {"arr": [1, 2, 3, 4, 5], "k": 2}, "expected": [4, 5, 1, 2, 3]}],
        trace_targets=["array_state", "pointer_positions"], rubric={"expected_complexity": "O(n)"},
    ),
    # ---------- DSA: Stacks ----------
    Problem(
        id="dsa_valid_parens_01", subject="dsa",
        prompt="Write a function that returns True if a string of brackets '()' is balanced (every open bracket has a matching close, correctly nested), False otherwise.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": "(()())", "expected": True}],
        trace_targets=["array_state"], rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_reverse_string_stack_01", subject="dsa",
        prompt="Write a function that reverses a string using a stack (a Python list used with append/pop).",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": "hello", "expected": "olleh"}],
        trace_targets=["array_state"], rubric={"expected_complexity": "O(n)"},
    ),
    Problem(
        id="dsa_palindrome_stack_01", subject="dsa",
        prompt="Write a function that returns True if a string reads the same forwards and backwards, using a stack to check it.",
        design_requirements=["data_structure_choice", "complexity_estimate", "invariant_statement"],
        test_cases=[{"input": "level", "expected": True}],
        trace_targets=["array_state"], rubric={"expected_complexity": "O(n)"},
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