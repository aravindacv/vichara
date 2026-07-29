import { useState } from "react";
import api from "../../api/client";

export default function TutorPanel({ problemId, code, runResult }) {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);

  const getHint = async () => {
    setLoading(true);
    setUsed(true);
    try {
      const res = await api.post("/api/tutor/ask", {
        problem_id: problemId,
        code,
        run_result: runResult,
        student_message: "I'm stuck on why this failed. Can you help?",
        history: [],
      });
      setHint(res.data.reply);
    } catch (e) {
      const detail = e.response?.data?.detail;
      setHint(detail || "Tutor is unavailable right now — check Settings for your API key.");
    } finally {
      setLoading(false);
    }
  };

  if (!runResult || runResult.passed) return null;

  return (
    <div className="card" style={{ borderColor: "var(--indigo)", background: "var(--paper-alt)" }}>
      <div className="card-title">Tutor</div>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", margin: "0 0 0.75rem 0" }}>
        Asks one question to help you think it through — never writes code for you. Your instructor
        will follow up with specific feedback separately.
      </p>

      {!used && (
        <button type="button" className="btn btn-primary" onClick={getHint} disabled={loading}>
          {loading ? "Thinking..." : "Get a hint"}
        </button>
      )}

      {hint && (
        <div style={{ marginTop: "0.75rem" }}>
          <span className="chat-bubble assistant">{hint}</span>
        </div>
      )}
    </div>
  );
}