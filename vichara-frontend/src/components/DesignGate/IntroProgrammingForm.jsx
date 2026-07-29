import { useState } from "react";

export default function IntroProgrammingForm({ onSubmit }) {
  const [steps, setSteps] = useState(["", "", ""]);

  const updateStep = (i, value) => {
    const next = [...steps];
    next[i] = value;
    setSteps(next);
  };

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i));

  return (
    <div>
      <h3 style={{ fontSize: "1rem" }}>Pseudocode steps</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
        Describe your approach in plain-English steps before you touch code. Minimum 3 steps.
      </p>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ color: "var(--ink-soft)", width: "1.2rem" }}>{i + 1}.</span>
          <input
            type="text"
            value={step}
            onChange={(e) => updateStep(i, e.target.value)}
            style={{ flex: 1, padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "6px" }}
            placeholder={`Step ${i + 1}`}
          />
          {steps.length > 3 && (
            <button type="button" className="btn" onClick={() => removeStep(i)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn" onClick={addStep}>
        + Add step
      </button>
      <div style={{ marginTop: "1rem" }}>
        <button type="button" className="btn btn-primary" onClick={() => onSubmit({ pseudocode_steps: steps })}>
          Submit design
        </button>
      </div>
    </div>
  );
}