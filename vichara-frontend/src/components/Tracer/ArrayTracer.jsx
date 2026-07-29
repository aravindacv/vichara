export default function ArrayTracer({ current }) {
  const arrayVars = Object.entries(current.locals).filter(([, v]) => Array.isArray(v));
  const scalarVars = Object.entries(current.locals).filter(([, v]) => !Array.isArray(v));

  return (
    <div>
      {arrayVars.map(([name, arr]) => (
        <div key={name} style={{ marginBottom: "0.75rem" }}>
          <strong style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{name}</strong>
          <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
            {arr.map((val, i) => {
              const pointersHere = scalarVars
                .filter(([, v]) => typeof v === "number" && v === i)
                .map(([k]) => k);
              return (
                <div key={i} className={"array-box" + (pointersHere.length ? " pointer" : "")}>
                  {val}
                  {pointersHere.length > 0 && <div className="pointer-tag">{pointersHere.join(",")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
        {scalarVars.map(([name, val]) => (
          <span key={name} style={{ marginRight: "1rem" }}>
            <strong>{name}</strong> = {String(val)}
          </span>
        ))}
      </div>
    </div>
  );
}