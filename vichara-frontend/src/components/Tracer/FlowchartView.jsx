const styles = `
.flowchart-root { font-family: ui-monospace, "Cascadia Code", "Consolas", "SF Mono", Menlo, monospace; font-size: 0.85rem; }
.fc-sequence { display: flex; flex-direction: column; gap: 6px; }
.fc-stmt {
  border: 1px solid #30363d; border-radius: 4px; padding: 7px 11px; background: #1c2128; color: #c9d1d9;
  transition: all 0.15s ease;
}
.fc-if {
  border: 1px solid #58a6ff; border-radius: 4px; padding: 9px; background: #132339;
}
.fc-if-condition { font-weight: bold; color: #58a6ff; margin-bottom: 6px; }
.fc-if-branches { display: flex; gap: 10px; }
.fc-branch { flex: 1; border-left: 2px dashed #30363d; padding-left: 8px; }
.fc-branch-label { font-size: 0.7rem; color: #8b949e; text-transform: uppercase; margin-bottom: 4px; }
.fc-loop {
  border: 1px solid #ffa657; border-radius: 4px; padding: 9px; background: #2e2113;
}
.fc-loop-label { font-weight: bold; color: #ffa657; margin-bottom: 6px; }
.fc-loop-body { border-left: 2px solid #ffa657; padding-left: 10px; }
.fc-current {
  box-shadow: 0 0 0 2px #ffa657, 0 0 0 5px rgba(255, 166, 87, 0.3);
  animation: fc-pulse 1.6s ease-in-out infinite;
}
@keyframes fc-pulse {
  0%, 100% { box-shadow: 0 0 0 2px #ffa657, 0 0 0 5px rgba(255, 166, 87, 0.3); }
  50% { box-shadow: 0 0 0 2px #ffa657, 0 0 0 8px rgba(255, 166, 87, 0.12); }
}
`;

function FlowNode({ node, currentLine }) {
  if (!node) return null;
  const isCurrent = node.line === currentLine;

  if (node.type === "sequence") {
    return (
      <div className="fc-sequence">
        {node.children.map((c, i) => (
          <FlowNode key={i} node={c} currentLine={currentLine} />
        ))}
      </div>
    );
  }

  if (node.type === "if") {
    return (
      <div className={"fc-if" + (isCurrent ? " fc-current" : "")}>
        <div className="fc-if-condition">if {node.label}</div>
        <div className="fc-if-branches">
          <div className="fc-branch">
            <div className="fc-branch-label">then</div>
            <FlowNode node={node.then} currentLine={currentLine} />
          </div>
          {node.else && (
            <div className="fc-branch">
              <div className="fc-branch-label">else</div>
              <FlowNode node={node.else} currentLine={currentLine} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (node.type === "while" || node.type === "for") {
    return (
      <div className={"fc-loop" + (isCurrent ? " fc-current" : "")}>
        <div className="fc-loop-label">
          {node.type} {node.label}
        </div>
        <div className="fc-loop-body">
          <FlowNode node={node.body} currentLine={currentLine} />
        </div>
      </div>
    );
  }

  return <div className={"fc-stmt" + (isCurrent ? " fc-current" : "")}>{node.label}</div>;
}

export default function FlowchartView({ tree, currentLine }) {
  if (!tree) return <p>Flowchart unavailable for this code.</p>;
  return (
    <div className="flowchart-root">
      <style>{styles}</style>
      <FlowNode node={tree} currentLine={currentLine} />
    </div>
  );
}