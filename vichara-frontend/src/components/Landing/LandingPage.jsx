const styles = `
.landing-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 3rem; border-bottom: 1px solid var(--border);
}
.landing-nav .wordmark { font-size: 1.5rem; text-align: left; margin-bottom: 0; }
.landing-badge {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--indigo); color: var(--indigo);
  border-radius: 999px; padding: 5px 14px; font-family: var(--font-mono);
  font-size: 0.78rem; margin-bottom: 1rem;
}
.landing-title {
  font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
  font-weight: 400; font-size: 3.6rem; line-height: 1.1; letter-spacing: 0.01em;
  margin: 0 0 0.75rem;
  background: linear-gradient(135deg, #ffffff 0%, var(--terracotta) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.landing-btn-primary {
  display: inline-block; font-family: var(--font-body); font-weight: 700; font-size: 1rem;
  padding: 0.75rem 2rem; border-radius: 8px; border: 2px solid var(--terracotta);
  background: var(--terracotta); color: #0d1117; cursor: pointer;
  transition: all 0.15s ease;
}
.landing-btn-primary:hover { background: transparent; color: var(--terracotta); box-shadow: 0 0 0 3px rgba(255,166,87,0.2); }
.landing-btn-ghost {
  display: inline-block; font-family: var(--font-body); font-weight: 600; font-size: 0.9rem;
  padding: 0.55rem 1.3rem; border-radius: 8px; border: 1px solid var(--border);
  background: transparent; color: var(--ink); cursor: pointer; transition: all 0.15s ease;
}
.landing-btn-ghost:hover { border-color: var(--indigo); color: var(--indigo); }
.stage-card {
  border: 1px solid var(--border); border-radius: 10px; background: var(--paper);
  padding: 1.4rem; text-align: left; transition: all 0.2s ease;
}
.stage-card:hover { border-color: var(--terracotta); transform: translateY(-3px); }
.stage-icon-circle {
  width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--terracotta);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-weight: 700; color: var(--terracotta);
  margin-bottom: 0.8rem; font-size: 0.85rem;
}
.landing-footer-card {
  border: 1px solid var(--indigo); border-radius: 10px; background: var(--paper-alt);
  padding: 1.6rem 2rem; text-align: center;
}
`;

export default function LandingPage({ onGetStarted, onInstructorSignIn }) {
  const stages = [
    { label: "Design", desc: "Plan your approach before touching code  pseudocode, structure, complexity." },
    { label: "Code", desc: "Write it yourself in a real editor. No autocomplete, no AI-generated solutions." },
    { label: "Trace", desc: "Watch your own code run flowchart and execution state, side by side." },
    { label: "Reflect", desc: "A short note on what clicked, before you move on." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--ink)" }}>
      <style>{styles}</style>

      <nav className="landing-nav">
        <div className="wordmark">Think & Code</div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {onInstructorSignIn && (
            <button
              type="button"
              onClick={onInstructorSignIn}
              style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Instructor sign in
            </button>
          )}
          <button type="button" className="landing-btn-ghost" onClick={onGetStarted}>
            Sign in
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 2rem 2.5rem", textAlign: "center" }}>
        <div className="landing-badge">
          <span>●</span> a teaching tool that never writes your code
        </div>
        <h1 className="landing-title">Think & Code</h1>
        <p style={{ fontSize: "1.05rem", color: "var(--ink-soft)", maxWidth: "520px", margin: "0 auto 1.75rem", lineHeight: 1.55 }}>
          Built for students who are expected to understand how code works  not paste in an answer.
          Design first. Write every line yourself. Watch it run. Reflect on what you learned.
        </p>
        <button type="button" className="landing-btn-primary" onClick={onGetStarted}>
          Get started →
        </button>
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "0 2rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
          {stages.map((s, i) => (
            <div key={s.label} className="stage-card">
              <div className="stage-icon-circle">{i + 1}</div>
              <div style={{ fontWeight: 700, marginBottom: "0.35rem", fontSize: "1rem" }}>{s.label}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 2rem 3.5rem" }}>
        <div className="landing-footer-card">
          <p style={{ fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: "var(--indigo)" }}>The Tutor never generates or completes code</strong>:-  It only
            asks questions. Every design plan is reviewed for whether it actually solves the problem before
            you're allowed to code. This is a tool for building understanding, not shortcuts.
          </p>
        </div>
      </div>
    </div>
  );
}