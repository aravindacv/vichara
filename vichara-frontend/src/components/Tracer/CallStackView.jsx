export default function CallStackView({ trace, stepIndex }) {
  const current = trace[stepIndex];

  // Reconstruct which calls are "open" as of this step, and their latest known state.
  const openCalls = {};
  for (let i = 0; i <= stepIndex; i++) {
    const e = trace[i];
    if (e.event === "call" || e.event === "line") {
      openCalls[e.call_id] = e;
    } else if (e.event === "return") {
      openCalls[e.call_id] = { ...e, returned: true };
    }
  }

  // Only show a returned frame on the exact step it returned — after that it's gone.
  const stackEntries = Object.values(openCalls)
    .filter((e) => !e.returned || e.call_id === current.call_id)
    .sort((a, b) => a.call_id - b.call_id);

  return (
    <div>
      <div className="trace-step-label">
        Call stack — {stackEntries.length} active frame{stackEntries.length === 1 ? "" : "s"}
      </div>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: "6px", marginTop: "8px" }}>
        {stackEntries.map((entry) => {
          const isCurrent = entry.call_id === current.call_id;
          return (
            <div
              key={entry.call_id}
              style={{
                marginLeft: `${entry.depth * 22}px`,
                padding: "8px 12px",
                border: "1px solid " + (isCurrent ? "var(--terracotta)" : "var(--border)"),
                borderRadius: "6px",
                background: isCurrent ? "var(--amber-soft)" : "var(--paper-alt)",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-soft)" }}>
                call #{entry.call_id} · depth {entry.depth} · line {entry.line}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginTop: "2px" }}>
                {Object.entries(entry.locals || {}).map(([k, v]) => (
                  <span key={k} style={{ marginRight: "0.75rem" }}>
                    {k} = {JSON.stringify(v)}
                  </span>
                ))}
              </div>
              {entry.returned && (
                <div style={{ color: "var(--green)", fontWeight: 700, fontSize: "0.8rem", marginTop: "4px" }}>
                  ↩ returns {JSON.stringify(entry.return_value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}