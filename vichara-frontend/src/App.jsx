import { useState, useEffect } from "react";
import DesignGate from "./components/DesignGate/DesignGate";
import LoginForm from "./components/Auth/LoginForm";
import InstructorLoginForm from "./components/Auth/InstructorLoginForm";
import InstructorDashboard from "./components/Instructor/InstructorDashboard";
import LandingPage from "./components/Landing/LandingPage";
import SettingsPanel from "./components/Settings/SettingsPanel";
import api from "./api/client";

const PROBLEMS = [
  { id: "intro_loops_01", label: "Intro: Sum of Evens" },
  { id: "intro_factorial_01", label: "Intro: Factorial" },
  { id: "intro_prime_check_01", label: "Intro: Prime Check" },
  { id: "dsa_binary_search_01", label: "DSA: Binary Search" },
  { id: "dsa_linear_search_01", label: "DSA: Linear Search" },
  { id: "dsa_first_last_occurrence_01", label: "DSA: First/Last Occurrence" },
  { id: "dsa_bubble_sort_01", label: "DSA: Bubble Sort" },
  { id: "dsa_selection_sort_01", label: "DSA: Selection Sort" },
  { id: "dsa_insertion_sort_01", label: "DSA: Insertion Sort" },
  { id: "dsa_find_max_01", label: "DSA: Find Max" },
  { id: "dsa_two_sum_01", label: "DSA: Two-Sum" },
  { id: "dsa_rotate_array_01", label: "DSA: Rotate Array" },
  { id: "dsa_valid_parens_01", label: "DSA: Valid Parentheses" },
  { id: "dsa_reverse_string_stack_01", label: "DSA: Reverse via Stack" },
  { id: "dsa_palindrome_stack_01", label: "DSA: Palindrome via Stack" },
];

const STAGES = ["Design", "Code", "Trace", "Reflect"];

export default function App() {
  const [student, setStudent] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [screen, setScreen] = useState("landing"); // landing | student-login | instructor-login
  const [selected, setSelected] = useState(PROBLEMS[0].id);
  const [progress, setProgress] = useState({ design: false, code: false, trace: false, reflect: false });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const storedStudent = localStorage.getItem("vichara_student");
    const storedInstructor = localStorage.getItem("vichara_instructor");
    if (storedInstructor) {
      try {
        setInstructor(JSON.parse(storedInstructor));
      } catch {
        localStorage.removeItem("vichara_instructor");
      }
    } else if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent));
      } catch {
        localStorage.removeItem("vichara_student");
      }
    }
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    const handleStudentExpired = () => {
      setStudent(null);
      setScreen("landing");
    };
    const handleInstructorExpired = () => {
      setInstructor(null);
      setScreen("landing");
    };
    window.addEventListener("vichara:student-logged-out", handleStudentExpired);
    window.addEventListener("vichara:instructor-logged-out", handleInstructorExpired);
    return () => {
      window.removeEventListener("vichara:student-logged-out", handleStudentExpired);
      window.removeEventListener("vichara:instructor-logged-out", handleInstructorExpired);
    };
  }, []);

  useEffect(() => {
    setProgress({ design: false, code: false, trace: false, reflect: false });
  }, [selected]);

  const handleStudentLogout = () => {
    api.post("/api/auth/logout").catch(() => {});
    localStorage.removeItem("vichara_student");
    setStudent(null);
    setScreen("landing");
  };

  const handleInstructorLogout = () => {
    api.post("/api/auth/logout").catch(() => {});
    localStorage.removeItem("vichara_instructor");
    setInstructor(null);
    setScreen("landing");
  };

  if (!checkedStorage) return null;

  // ---------- Instructor is logged in ----------
  if (instructor) {
    return (
      <div className="app-shell">
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        <header className="topbar">
          <div className="wordmark">vichara</div>
          <div style={{ textAlign: "center", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
            {instructor.name} · Instructor ({instructor.subjects.join(", ")}) ·{" "}
            <button
              onClick={handleInstructorLogout}
              style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontWeight: 700 }}
            >
              Log out
            </button>
          </div>
        </header>
        <main className="main-content" style={{ paddingTop: "2rem" }}>
          <div className="hero" style={{ paddingBottom: "1rem" }}>
            <div className="hero-eyebrow">Instructor</div>
            <h1>Class overview.</h1>
            <p className="hero-sub">Showing students and problems for the subjects you're mapped to.</p>
          </div>
          <InstructorDashboard />
        </main>
      </div>
    );
  }

  // ---------- Not logged in as either ----------
  if (!student) {
    if (screen === "student-login") {
      return <LoginForm onLogin={setStudent} onBack={() => setScreen("landing")} />;
    }
    if (screen === "instructor-login") {
      return <InstructorLoginForm onLogin={setInstructor} onBack={() => setScreen("landing")} />;
    }
    return (
      <LandingPage
        onGetStarted={() => setScreen("student-login")}
        onInstructorSignIn={() => setScreen("instructor-login")}
      />
    );
  }

  // ---------- Student is logged in ----------
  const flags = [progress.design, progress.code, progress.trace, progress.reflect];
  const activeIndex = flags.findIndex((f) => !f);

  return (
    <div className="app-shell">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <header className="topbar">
        <div className="wordmark">vichara</div>
        <div style={{ textAlign: "center", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
          {student.name} ({student.roll_number}) ·{" "}
          <button
            onClick={handleStudentLogout}
            style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontWeight: 700 }}
          >
            Log out
          </button>
          {" · "}
          <button
            onClick={() => setShowSettings(true)}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontWeight: 700 }}
          >
            Settings
          </button>
        </div>
      </header>

      <div className="stage-sequence">
        {STAGES.map((stage, i) => (
          <span key={stage} className={"stage-item" + (flags[i] ? " done" : i === activeIndex ? " active" : "")}>
            {stage}
          </span>
        ))}
      </div>

      <main className="main-content">
        <div className="hero">
          <div className="hero-eyebrow">Design Gate</div>
          <h1>
            Think it <span className="accent">through</span> before you type.
          </h1>
          <p className="hero-sub">
            No code is written for you here. Plan your approach, then watch exactly how your own code behaves.
          </p>
        </div>

        <div className="tab-bar">
          {PROBLEMS.map((p) => (
            <button
              key={p.id}
              className={"btn-tab" + (selected === p.id ? " active" : "")}
              onClick={() => setSelected(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <DesignGate
          problemId={selected}
          onDesignStatus={(status) =>
            setProgress((p) => ({ ...p, design: status.code_unlocked, code: p.code || false }))
          }
          onRunResult={(result) =>
            setProgress((p) => ({ ...p, code: true, trace: p.trace || !!result.passed }))
          }
          onReflection={(submitted) => setProgress((p) => ({ ...p, reflect: submitted }))}
        />
      </main>
    </div>
  );
}