import { useState } from "react";

const STRUCTURES = ["Array", "Linked List", "Stack", "Queue", "Tree", "Graph", "Hash Map"];

export default function DSAForm({ onSubmit }) {
  const [dataStructure, setDataStructure] = useState("");
  const [complexity, setComplexity] = useState("");
  const [invariant, setInvariant] = useState("");

  const handleSubmit = () => {
    onSubmit({
      data_structure_choice: dataStructure,
      complexity_estimate: complexity,
      invariant_statement: invariant,
    });
  };

  return (
    <div>
      <h3 style={{ fontSize: "1rem" }}>Design your approach</h3>

      <div className="field">
        <label>Data structure choice</label>
        <select value={dataStructure} onChange={(e) => setDataStructure(e.target.value)}>
          <option value="">-- choose --</option>
          {STRUCTURES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Complexity estimate (e.g. O(log n))</label>
        <input type="text" value={complexity} onChange={(e) => setComplexity(e.target.value)} placeholder="O(...)" />
      </div>

      <div className="field">
        <label>Loop invariant — what stays true at each step?</label>
        <textarea
          value={invariant}
          onChange={(e) => setInvariant(e.target.value)}
          rows={3}
          placeholder="Describe what remains true before/after each iteration..."
        />
      </div>

      <button type="button" className="btn btn-primary" onClick={handleSubmit}>
        Submit design
      </button>
    </div>
  );
}