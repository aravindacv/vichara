import { useState, useEffect } from "react";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic (Claude)", keyHint: "sk-ant-..." },
  { id: "openai", label: "OpenAI (GPT)", keyHint: "sk-..." },
  { id: "gemini", label: "Google (Gemini)", keyHint: "AIza..." },
  { id: "grok", label: "xAI (Grok)", keyHint: "xai-..." },
  { id: "deepseek", label: "DeepSeek", keyHint: "sk-..." },
  { id: "kimi", label: "Moonshot (Kimi)", keyHint: "sk-..." },
];

const CONSOLE_LINKS = {
  anthropic: "console.anthropic.com",
  openai: "platform.openai.com",
  gemini: "aistudio.google.com",
  grok: "console.x.ai",
  deepseek: "platform.deepseek.com",
  kimi: "platform.moonshot.ai",
};

export default function SettingsPanel({ onClose }) {
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    const existingKey = localStorage.getItem("vichara_api_key");
    const existingProvider = localStorage.getItem("vichara_api_provider");
    setHasExisting(!!existingKey);
    if (existingProvider) setProvider(existingProvider);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("vichara_api_key", apiKey.trim());
      localStorage.setItem("vichara_api_provider", provider);
      setSaved(true);
      setHasExisting(true);
      setApiKey("");
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("vichara_api_key");
    localStorage.removeItem("vichara_api_provider");
    setHasExisting(false);
    setSaved(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "440px", maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
        <div className="card-title">Tutor settings</div>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
          The Tutor (design review + chat hints) uses your own API key — Vichara doesn't provide a
          shared one, and doesn't require Anthropic specifically. Pick whichever provider works for you.
        </p>
        <p style={{ fontSize: "0.78rem", color: "var(--terracotta)", lineHeight: 1.6 }}>
          Your key is stored only in this browser (localStorage) — never sent to or saved on the
          Vichara server's database. Clearing your browser data removes it.
        </p>

        <div className="field">
          <label>Provider</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{hasExisting ? "Replace your API key" : "Your API key"}</label>
          <input
            type="text"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasExisting ? "Key already saved — enter a new one to replace it" : PROVIDERS.find((p) => p.id === provider)?.keyHint}
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginTop: "0.3rem" }}>
            Get a key at {CONSOLE_LINKS[provider]}
          </p>
        </div>

        {saved && <p className="note note-accept">Key saved for this browser.</p>}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save key
          </button>
          {hasExisting && (
            <button type="button" className="btn" onClick={handleRemove}>
              Remove saved key
            </button>
          )}
          <button type="button" className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}