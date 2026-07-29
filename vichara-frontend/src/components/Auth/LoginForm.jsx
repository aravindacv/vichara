import { useState } from "react";
import api from "../../api/client";

export default function LoginForm({ onLogin, onBack }) {
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/login", { roll_number: rollNumber, name, passcode });
      localStorage.setItem("vichara_student", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div className="card" style={{ width: "360px" }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", fontSize: "0.8rem", padding: 0, marginBottom: "1rem" }}
          >
            ← Back to home
          </button>
        )}
        <div className="card-title" style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)" }}>
          Vichara
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Enter your roll number, name, and the class passcode your instructor shared.
        </p>

        <div className="field">
          <label>Roll number</label>
          <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. CUK2026-041" />
        </div>

        <div className="field">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        </div>

        <div className="field">
          <label>Class passcode</label>
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Given by your instructor" />
        </div>

        {error && <p className="note note-warning">{error}</p>}

        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in..." : "Continue"}
        </button>
      </div>
    </div>
  );
}