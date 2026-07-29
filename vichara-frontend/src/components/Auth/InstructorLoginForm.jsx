import { useState } from "react";
import api from "../../api/client";

const SUBJECTS = [
  { id: "intro_programming", label: "Intro Programming" },
  { id: "dsa", label: "DSA" },
];

export default function InstructorLoginForm({ onLogin, onBack }) {
  const [instructorId, setInstructorId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (id) => {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/instructor/login", {
        instructor_id: instructorId,
        name,
        password,
        signup_code: signupCode,
        subjects,
      });
      localStorage.setItem("vichara_instructor", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div className="card" style={{ width: "400px" }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", fontSize: "0.8rem", padding: 0, marginBottom: "1rem" }}
          >
            Back to home
          </button>
        )}
        <div className="card-title" style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)" }}>
          Instructor sign in
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          First time here? Fill in everything below including the signup code to create your account.
          Returning? Just instructor ID + password.
        </p>

        <div className="field">
          <label>Instructor ID</label>
          <input type="text" value={instructorId} onChange={(e) => setInstructorId(e.target.value)} placeholder="e.g. ravi.aravinda" />
        </div>

        <div className="field">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>

        <div className="field">
          <label>Signup code (only needed the first time)</label>
          <input type="password" value={signupCode} onChange={(e) => setSignupCode(e.target.value)} placeholder="Set on the server" />
        </div>

        <div className="field">
          <label>Subjects you teach (only needed the first time)</label>
          {SUBJECTS.map((s) => (
            <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.3rem" }}>
              <input type="checkbox" checked={subjects.includes(s.id)} onChange={() => toggleSubject(s.id)} />
              {s.label}
            </label>
          ))}
        </div>

        {error && <p className="note note-warning">{error}</p>}

        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
