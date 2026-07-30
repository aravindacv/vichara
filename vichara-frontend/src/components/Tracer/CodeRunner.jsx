import { useState } from "react";
import api from "../../api/client";
import ArrayTracer from "./ArrayTracer";
import FlowchartView from "./FlowchartView";
import TutorPanel from "./TutorPanel";
import ReflectionPanel from "./ReflectionPanel";
import CallStackView from "./CallStackView";

// Skeleton stubs only — correct function signature + a TODO, never a working
// solution. Students write the body themselves; that's the entire point.
const STARTER_CODE = {
  intro_loops_01: `def sum_of_evens(n):
    # TODO: return the sum of all even numbers from 1 to n (inclusive)
    pass
`,
  intro_factorial_01: `def factorial(n):
    # TODO: return n! (n factorial)
    pass
`,
  intro_prime_check_01: `def is_prime(n):
    # TODO: return True if n is prime, False otherwise
    pass
`,
  dsa_binary_search_01: `def binary_search(arr, target):
    # TODO: return the index of target in the sorted array arr, or -1
    pass
`,
  dsa_linear_search_01: `def linear_search(arr, target):
    # TODO: return the index of target in arr, or -1
    pass
`,
  dsa_first_last_occurrence_01: `def find_first_last(arr, target):
    # TODO: return [first_index, last_index] of target in the sorted array arr,
    # or [-1, -1] if target isn't present
    pass
`,
  dsa_bubble_sort_01: `def bubble_sort(arr):
    # TODO: sort arr in ascending order and return it
    pass
`,
  dsa_selection_sort_01: `def selection_sort(arr):
    # TODO: sort arr in ascending order and return it
    pass
`,
  dsa_insertion_sort_01: `def insertion_sort(arr):
    # TODO: sort arr in ascending order and return it
    pass
`,
  dsa_find_max_01: `def find_max(arr):
    # TODO: return the largest value in arr (no built-in max())
    pass
`,
  dsa_two_sum_01: `def has_pair_with_sum(arr, target):
    # TODO: return True if any two numbers in arr sum to target
    pass
`,
  dsa_rotate_array_01: `def rotate_array(arr, k):
    # TODO: return arr rotated right by k positions
    pass
`,
  dsa_valid_parens_01: `def is_valid_parentheses(s):
    # TODO: return True if the brackets in s are balanced, using a stack
    pass
`,
  dsa_reverse_string_stack_01: `def reverse_string_stack(s):
    # TODO: reverse s using a stack (a list with append/pop)
    pass
`,
  dsa_palindrome_stack_01: `def is_palindrome_stack(s):
    # TODO: return True if s reads the same forwards and backwards, using a stack
    pass
`,
  dsa_max_subarray_01: `def max_subarray(arr):
    # TODO: return the largest sum of any contiguous subarray in arr
    pass
`,
  dsa_stock_profit_01: `def max_profit(prices):
    # TODO: return the max profit from buying then selling later, or 0
    pass
`,
  dsa_contains_duplicate_01: `def contains_duplicate(arr):
    # TODO: return True if any value appears more than once in arr
    pass
`,
  dsa_move_zeroes_01: `def move_zeroes(arr):
    # TODO: move all zeroes in arr to the end, keep other elements' order, return arr
    pass
`,
  dsa_valid_anagram_01: `def is_anagram(s, t):
    # TODO: return True if t is an anagram of s
    pass
`,
  dsa_climbing_stairs_01: `def climb_stairs(n):
    # TODO: return the number of distinct ways to climb n stairs, 1 or 2 steps at a time
    pass
`,
};

const FUNCTION_NAMES = {
  intro_loops_01: "sum_of_evens",
  intro_factorial_01: "factorial",
  intro_prime_check_01: "is_prime",
  dsa_binary_search_01: "binary_search",
  dsa_linear_search_01: "linear_search",
  dsa_first_last_occurrence_01: "find_first_last",
  dsa_bubble_sort_01: "bubble_sort",
  dsa_selection_sort_01: "selection_sort",
  dsa_insertion_sort_01: "insertion_sort",
  dsa_find_max_01: "find_max",
  dsa_two_sum_01: "has_pair_with_sum",
  dsa_rotate_array_01: "rotate_array",
  dsa_valid_parens_01: "is_valid_parentheses",
  dsa_reverse_string_stack_01: "reverse_string_stack",
  dsa_palindrome_stack_01: "is_palindrome_stack",
  dsa_max_subarray_01: "max_subarray",
  dsa_stock_profit_01: "max_profit",
  dsa_contains_duplicate_01: "contains_duplicate",
  dsa_move_zeroes_01: "move_zeroes",
  dsa_valid_anagram_01: "is_anagram",
  dsa_climbing_stairs_01: "climb_stairs",
};

export default function CodeRunner({ problemId, studentId, onRunResult, onReflection }) {
  const [code, setCode] = useState(STARTER_CODE[problemId] || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    setStep(0);
    try {
      const res = await api.post("/api/execution/run", {
        student_id: studentId,
        problem_id: problemId,
        code,
        function_name: FUNCTION_NAMES[problemId],
        test_case_index: 0,
      });
      setResult(res.data);
      onRunResult && onRunResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Execution failed.");
    } finally {
      setRunning(false);
    }
  };

  const current = result?.trace?.[step];

  return (
    <div className="card">
      <div className="card-title">Code</div>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={12}
        spellCheck={false}
      />
      <div style={{ marginTop: "0.75rem" }}>
        <button type="button" className="btn btn-primary" onClick={handleRun} disabled={running}>
          {running ? "Running..." : "Run against test case"}
        </button>
      </div>

      {error && <p className="note note-warning" style={{ marginTop: "0.75rem" }}>{error}</p>}
      {result?.error && <p className="note note-warning" style={{ marginTop: "0.75rem" }}>{result.error}</p>}

      {result && !result.error && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            Result: <code>{JSON.stringify(result.result)}</code> — Expected:{" "}
            <code>{JSON.stringify(result.expected)}</code>{" "}
            <span className={"badge " + (result.passed ? "badge-pass" : "badge-fail")}>
              {result.passed ? "PASSED" : "FAILED"}
            </span>
          </p>

          {current && (
            <div>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <div style={{ flex: "1 1 320px", minWidth: "280px" }}>
                  <div className="card-title" style={{ fontSize: "0.95rem" }}>Flow of your code</div>
                  {result.flowchart ? (
                    <FlowchartView tree={result.flowchart} currentLine={current.line} />
                  ) : (
                    <p style={{ color: "var(--ink-soft)" }}>{result.flowchart_error}</p>
                  )}
                </div>
                <div style={{ flex: "1 1 320px", minWidth: "280px" }}>
                  <div className="trace-step-label">
                    Step {step + 1} of {result.trace.length} — source line {current.line}
                  </div>
                  {new Set(result.trace.map((e) => e.call_id)).size > 1 ? (
                    <CallStackView trace={result.trace} stepIndex={step} />
                  ) : (
                    <ArrayTracer current={current} />
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
                  ← Prev
                </button>{" "}
                <button className="btn" disabled={step === result.trace.length - 1} onClick={() => setStep(step + 1)}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {result.passed && <ReflectionPanel problemId={problemId} studentId={studentId} onReflection={onReflection} />}

          <TutorPanel problemId={problemId} studentId={studentId} code={code} runResult={result} />
        </div>
      )}
    </div>
  );
}