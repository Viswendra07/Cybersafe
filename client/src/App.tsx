
import { useState, type FormEvent } from "react";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type Question = {
  _id: string;
  question: string;
  options: string[];
  category: string;
};

type Detail = {
  questionId: string;
  question: string;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
};

type Result = {
  score: number;
  total: number;
  percentage: number;
  details: Detail[];
};

type Attempt = {
  _id: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
};

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [page, setPage] = useState<"home" | "quiz" | "history">("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await request(
        `/auth/${mode === "register" ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify({ name, email, password })
        }
      );

      if (mode === "register") {
        setMode("login");
        setPassword("");
        setError("Registration successful! Please log in.");
      } else {
        setToken(data.token);
        setUser(data.user);
        setPassword("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz() {
    setError("");
    setLoading(true);

    try {
      const data: Question[] = await request("/quiz/questions");
      setQuestions(data);
      setAnswers({});
      setResult(null);
      setPage("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load quiz");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data: Result = await request("/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          answers: questions.map((q) => ({
            questionId: q._id,
            selectedOption: answers[q._id]
          }))
        })
      });

      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  async function showHistory() {
    setLoading(true);
    setError("");

    try {
      const data: Attempt[] = await request("/quiz/history");
      setHistory(data);
      setPage("history");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load history");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setHistory([]);
    setPage("home");
    setError("");
  }

  if (!token || !user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-icon">🛡️</div>
          <h1>CyberSafe</h1>
          <p className="muted">Learn cybersecurity. Stay protected.</p>

          <div className="tabs">
            <button
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "tab active" : "tab"}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={authenticate}>
            {mode === "register" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="Enter your name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p className="message">{error}</p>}

            <button className="primary full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login to CyberSafe"
                : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span>🛡️</span> CyberSafe
        </div>
        <div className="user-area">
          <span>{user.name}</span>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="welcome">
        <p className="eyebrow">CYBERSECURITY AWARENESS PLATFORM</p>
        <h1>Stay smart. Stay secure.</h1>
        <p>
          Test your knowledge and learn how to protect yourself online.
        </p>
      </section>

      <nav className="navigation">
        <button
          className={page === "home" ? "nav-item selected" : "nav-item"}
          onClick={() => {
            setPage("home");
            setError("");
          }}
        >
          Dashboard
        </button>
        <button className="nav-item" onClick={startQuiz}>
          Take a quiz
        </button>
        <button
          className={page === "history" ? "nav-item selected" : "nav-item"}
          onClick={showHistory}
        >
          My history
        </button>
      </nav>

      {error && <p className="message">{error}</p>}

      {page === "home" && (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span>📚</span>
              <p>Learning</p>
              <h2>10 questions</h2>
              <small>Cybersecurity basics</small>
            </article>
            <article className="stat-card">
              <span>🔐</span>
              <p>Your account</p>
              <h2>Protected</h2>
              <small>JWT-authenticated session</small>
            </article>
            <article className="stat-card">
              <span>🎯</span>
              <p>Your goal</p>
              <h2>Keep learning</h2>
              <small>Improve with each attempt</small>
            </article>
          </section>

          <section className="panel">
            <div>
              <p className="eyebrow">READY TO BEGIN?</p>
              <h2>Cybersecurity Challenge</h2>
              <p className="muted">
                Answer the questions and review explanations at the end.
              </p>
            </div>
            <button
              className="primary"
              onClick={startQuiz}
              disabled={loading}
            >
              {loading ? "Loading..." : "Start quiz →"}
            </button>
          </section>
        </>
      )}

      {page === "quiz" && !result && (
        <section className="quiz-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR CHALLENGE</p>
              <h2>Cybersecurity Quiz</h2>
            </div>
            <span className="pill">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>

          {questions.map((q, index) => (
            <article className="question-card" key={q._id}>
              <p className="eyebrow">
                QUESTION {index + 1} · {q.category}
              </p>
              <h3>{q.question}</h3>

              <div className="options">
                {q.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={
                      answers[q._id] === optionIndex
                        ? "option chosen"
                        : "option"
                    }
                  >
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === optionIndex}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q._id]: optionIndex
                        }))
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </article>
          ))}

          <button
            className="primary"
            disabled={loading || questions.length === 0}
            onClick={submitQuiz}
          >
            {loading ? "Submitting..." : "Submit quiz"}
          </button>
        </section>
      )}

      {page === "quiz" && result && (
        <section className="panel result-panel">
          <div className="result-icon">🏆</div>
          <p className="eyebrow">QUIZ COMPLETED</p>
          <h2>Your results</h2>
          <div className="score">
            {result.score}/{result.total}
          </div>
          <p className="muted">
            You scored {result.percentage}% on this attempt.
          </p>

          {result.details.map((d, index) => (
            <article className="review-card" key={d.questionId}>
              <h3>
                {index + 1}. {d.question}
              </h3>
              <p className={d.isCorrect ? "correct" : "incorrect"}>
                {d.isCorrect ? "Correct answer" : "Incorrect answer"}
              </p>
              <p>
                Correct option:{" "}
                {questions
                  .find((q) => q._id === d.questionId)
                  ?.options[d.correctAnswer]}
              </p>
              <p className="muted">{d.explanation}</p>
            </article>
          ))}

          <button className="primary" onClick={startQuiz}>
            Try again
          </button>
          <button className="secondary" onClick={showHistory}>
            View history
          </button>
        </section>
      )}

      {page === "history" && (
        <section className="panel">
          <h2>Your quiz history</h2>
          {history.length === 0 ? (
            <p className="muted">No attempts yet. Take your first quiz!</p>
          ) : (
            <div className="history-list">
              {history.map((attempt) => (
                <article className="history-row" key={attempt._id}>
                  <div>
                    <strong>{attempt.score}/{attempt.total} correct</strong>
                    <p className="muted">
                      {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="pill">{attempt.percentage}%</span>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>CyberSafe · Learn today. Protect tomorrow.</footer>
    </main>
  );
}
