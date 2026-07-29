import { useState, useEffect } from "react";
import api from "../../api/client";

export default function InstructorFeedbackPanel({ problemId }) {
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api
      .get(`/api/instructor/feedback/self/${problemId}`)
      .then((res) => setFeedback(res.data.content))
      .catch(() => setFeedback(null));
  }, [problemId]);

  if (!feedback) return null;

  return (
    <div className="card" style={{ borderLeft: "3px solid var(--terracotta)" }}>
      <div className="card-title">Feedback from your instructor</div>
      <p style={{ margin: 0 }}>{feedback}</p>
    </div>
  );
}