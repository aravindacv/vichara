import { useState, useEffect } from "react";
import api from "../../api/client";

function StageBadges({ status }) {
  const stages = [
    { label: "D", active: status.design_submitted, title: "Design submitted" },
    { label: "C", active: status.code_unlocked, title: "Code unlocked" },
    { label: "T", active: status.passed, title: `Passed (${status.attempts} attempt${status.attempts === 1 ? "" : "s"})` },
    { label: "R", active: status.reflection_submitted, title: "Reflection submitted" },
  ];
  return (
    <div style={{ display: "flex", gap: "4px" }} title={stages.map((s) => s.title).join(" | ")}>
      {stages.map((s) => (
        <span
          key={s.label}
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            background: s.active ? "var(--green-soft)" : "var(--paper-alt)",
            color: s.active ? "var(--green)" : "var(--ink-soft)",
            border: "1px solid " + (s.active ? "var(--green)" : "var(--border)"),
          }}
        >
          {s.label}
        </span>
      ))}
      {status.feedback_content && (
        <span title="Feedback already given" style={{ color: "var(--terracotta)", fontSize: "0.9rem" }}>✎</span>
      )}
    </div>
  );
}

function ExpandedPanel({ student, problemId, status, onFeedbackSaved }) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveFeedback = async () => {
    if (!feedbackInput.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/instructor/feedback", {
        student_id: student.roll_number,
        problem_id: problemId,
        content: feedbackInput,
      });
      onFeedbackSaved(feedbackInput);
      setFeedbackInput("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: "3px solid var(--green)" }}>
      <div className="card-title">
        {student.name} ({student.roll_number}) — {problemId}
      </div>

      {status.reflection_content && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)", fontFamily: "var(--font-mono)", marginBottom: "0.3rem" }}>
            Student's reflection
          </div>
          <p style={{ fontStyle: "italic", margin: 0 }}>&ldquo;{status.reflection_content}&rdquo;</p>
        </div>
      )}

      {status.feedback_content && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)", fontFamily: "var(--font-mono)", marginBottom: "0.3rem" }}>
            Your existing feedback
          </div>
          <p style={{ margin: 0, color: "var(--terracotta)" }}>{status.feedback_content}</p>
        </div>
      )}

      <div>
        <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)", fontFamily: "var(--font-mono)", marginBottom: "0.3rem" }}>
          {status.feedback_content ? "Add updated feedback" : "Leave feedback for this student"}
        </div>
        <textarea
          value={feedbackInput}
          onChange={(e) => setFeedbackInput(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--paper-alt)", color: "var(--ink)", fontFamily: "var(--font-body)" }}
          placeholder="e.g. Good use of the invariant — next time try tracing through an edge case like N=1 before running it."
        />
        <button type="button" className="btn btn-primary" onClick={handleSaveFeedback} disabled={saving} style={{ marginTop: "0.5rem" }}>
          {saving ? "Saving..." : "Save feedback"}
        </button>
      </div>
    </div>
  );
}

export default function InstructorDashboard() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null); // "rollNumber:problemId" or null

  useEffect(() => {
    api.get("/api/instructor/overview").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;
  if (data.students.length === 0) return <p style={{ color: "var(--ink-soft)" }}>No students yet.</p>;

  const handleFeedbackSaved = (rollNumber, problemId, content) => {
    setData((prev) => {
      const next = { ...prev, students: prev.students.map((s) => ({ ...s, problems: { ...s.problems } })) };
      const student = next.students.find((s) => s.roll_number === rollNumber);
      student.problems[problemId] = { ...student.problems[problemId], feedback_content: content };
      return next;
    });
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Class overview</div>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: "1rem" }}>
          D = Design submitted · C = Code unlocked · T = Passed a run · R = Reflection submitted · ✎ = feedback given. Click a cell to view or leave feedback.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)" }}>Student</th>
                {data.problems.map((p) => (
                  <th key={p.id} style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontWeight: 400, color: "var(--ink-soft)" }}>
                    {p.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.roll_number}>
                  <td style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
                    {student.name} <span style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>({student.roll_number})</span>
                  </td>
                  {data.problems.map((p) => {
                    const status = student.problems[p.id];
                    const key = `${student.roll_number}:${p.id}`;
                    return (
                      <td
                        key={p.id}
                        style={{ padding: "8px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                        onClick={() => setExpanded(expanded === key ? null : key)}
                      >
                        <StageBadges status={status} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expanded &&
        (() => {
          const [rollNumber, problemId] = expanded.split(":");
          const student = data.students.find((s) => s.roll_number === rollNumber);
          const status = student.problems[problemId];
          return (
            <ExpandedPanel
              student={student}
              problemId={problemId}
              status={status}
              onFeedbackSaved={(content) => handleFeedbackSaved(rollNumber, problemId, content)}
            />
          );
        })()}
    </div>
  );
}