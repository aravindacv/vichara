const STEPS = [
  {
    title: "1. Clarify the problem",
    body: "Restate it in your own words. Ask about input size, duplicates, negative numbers, empty input. Never start coding on an assumption you haven't checked.",
  },
  {
    title: "2. State the brute force first",
    body: "Say the naive approach out loud, even if it's slow. \"I could check every pair, that's O(n^2)\" shows your reasoning and gives you a fallback if you get stuck optimizing.",
  },
  {
    title: "3. Look for the pattern",
    body: "Most array/string interview questions map to a small set of patterns: two pointers, sliding window, hash map for O(1) lookups, sorting first, or dynamic programming. Naming the pattern is often the real insight.",
  },
  {
    title: "4. Optimize, and say why",
    body: "Explain the tradeoff you're making — usually trading space for time (a hash map) or a smarter pass order (two pointers instead of nested loops).",
  },
  {
    title: "5. Code it cleanly",
    body: "Use clear variable names. Talk while you type. Interviewers are watching how you think, not just whether it runs.",
  },
  {
    title: "6. Trace through your own example",
    body: "Walk your code through the sample input by hand before declaring it done. Then check edge cases: empty input, one element, all identical values.",
  },
  {
    title: "7. State the complexity",
    body: "Give Big-O for both time and space, out loud, unprompted. This is expected, not optional.",
  },
];

export default function InterviewGuide({ onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "2rem" }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "560px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="card-title">How to approach an interview question</div>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: "1rem" }}>
          A general framework — applies to any problem, not a solution to a specific one. The "Interview" tagged problems in the tab bar are real questions companies like Google, Meta, and Amazon are known to ask.
        </p>
        {STEPS.map((s) => (
          <div key={s.title} style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--indigo)", marginBottom: "0.25rem", fontSize: "0.92rem" }}>{s.title}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
        <button type="button" className="btn" onClick={onClose} style={{ marginTop: "0.5rem" }}>
          Close
        </button>
      </div>
    </div>
  );
}