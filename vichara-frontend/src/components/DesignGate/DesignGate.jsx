import { useState, useEffect } from "react";
import api from "../../api/client";
import IntroProgrammingForm from "./IntroProgrammingForm";
import DSAForm from "./DSAForm";
import CodeRunner from "../Tracer/CodeRunner";
import InstructorFeedbackPanel from "../Instructor/InstructorFeedbackPanel";

function YourDesign({ content, subject }) {
  if (!content) return null;
  return (
    <div className="design-panel">
      <strong>Your design</strong>
      {subject === "intro_programming" && (
        <ol style={{ marginTop: "0.5rem", marginBottom: 0 }}>
          {(content.pseudocode_steps || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
      {subject === "dsa" && (
        <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
          <li>Data structure: {content.data_structure_choice}</li>
          <li>Complexity estimate: {content.complexity_estimate}</li>
          <li>Invariant: {content.invariant_statement}</li>
        </ul>
      )}
    </div>
  );
}

export default function DesignGate({ problemId, onDesignStatus, onRunResult, onReflection }) {
  const [problem, setProblem] = useState(null);
  const [status, setStatus] = useState({ code_unlocked: false, reviewer_note: null, content: null });
  const [tutorNote, setTutorNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTutorNote(null);
    setRevising(false);
    api.get(`/api/problems/${problemId}`).then((res) => setProblem(res.data));
    api
      .get(`/api/design/status/${problemId}`)
      .then((res) => {
        setStatus(res.data);
        onDesignStatus && onDesignStatus(res.data);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const handleSubmit = async (content) => {
    const res = await api.post("/api/design/submit", { problem_id: problemId, content });
    setStatus(res.data);
    setTutorNote(res.data.tutor_note || null);
    setRevising(false);
    onDesignStatus && onDesignStatus(res.data);
  };

  if (loading || !problem) return <p>Loading problem...</p>;

  if (status.code_unlocked && !revising) {
    return (
      <div>
        <div className="card">
          <h2 className="card-title" style={{ fontSize: "1.15rem", color: "var(--ink)" }}>
            {problem.prompt}
          </h2>
          <p className="note note-accept" style={{ display: "inline-block" }}>
            Design accepted — code editor unlocked.
          </p>
        </div>
        <YourDesign content={status.content} subject={problem.subject} />
        <InstructorFeedbackPanel problemId={problemId} />
        {tutorNote && (
          <div className="card" style={{ borderColor: "var(--indigo)", background: "var(--paper-alt)" }}>
            <div className="card-title" style={{ fontSize: "0.95rem" }}>Tutor's note on your plan</div>
            <p style={{ margin: 0 }}>{tutorNote}</p>
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <button type="button" className="btn" onClick={() => setRevising(true)}>
            Revise your design
          </button>
        </div>
        <CodeRunner problemId={problemId} onRunResult={onRunResult} onReflection={onReflection} />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ fontSize: "1.15rem", color: "var(--ink)" }}>
        {problem.prompt}
      </h2>
      {revising && (
        <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
          Revising your design — your code and progress below are kept until you submit a new plan.{" "}
          <button type="button" className="btn" style={{ marginLeft: "0.5rem" }} onClick={() => setRevising(false)}>
            Cancel
          </button>
        </p>
      )}
      {status.reviewer_note && <p className="note note-warning">{status.reviewer_note}</p>}
      {problem.subject === "intro_programming" && <IntroProgrammingForm onSubmit={handleSubmit} />}
      {problem.subject === "dsa" && <DSAForm onSubmit={handleSubmit} />}
    </div>
  );
}