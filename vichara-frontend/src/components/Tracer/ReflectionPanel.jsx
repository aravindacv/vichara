import { useState, useEffect } from "react";
import api from "../../api/client";

export default function ReflectionPanel({ problemId, onReflection }) {
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/api/reflection/status/${problemId}`)
      .then((res) => {
        setSubmitted(res.data.submitted);
        if (res.data.content) setContent(res.data.content);
        onReflection && onReflection(res.data.submitted);
      })
      .catch(() => setSubmitted(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.post("/api/reflection/submit", { problem_id: problemId, content });
      setSubmitted(res.data.submitted);
      onReflection && onReflection(res.data.submitted);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not save reflection.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted === null) return null;

  return (
    <div className="card" style={{ borderLeft: "3px solid var(--green)" }}>
      <div className="card-title">Reflect</div>
      {submitted ? (
        <div>
          <p className="note note-accept">Reflection saved — nice work closing the loop on this one.</p>
          <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>&ldquo;{content}&rdquo;</p>
        </div>
      ) : (
        <div>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
            You passed — before moving on, what actually clicked, or what confused you along the way?
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font-body)" }}
            placeholder="e.g. I kept forgetting to update 'low' after the first comparison, which is why..."
          />
          {error && <p className="note note-warning">{error}</p>}
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ marginTop: "0.5rem" }}>
            {saving ? "Saving..." : "Submit reflection"}
          </button>
        </div>
      )}
    </div>
  );
}