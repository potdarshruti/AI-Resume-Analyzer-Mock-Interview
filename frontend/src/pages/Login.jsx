import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Theme toggle top-right */}
      <button onClick={toggleTheme} style={themeBtn}>
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 48 }}>🧠</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)", margin: "8px 0 4px" }}>ResumeAI</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Sign in to your account</p>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={fieldGroup}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text2)" }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", background: "var(--bg)", position: "relative", padding: 16
};
const cardStyle = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420,
  boxShadow: "var(--shadow)"
};
const fieldGroup = { marginBottom: 16 };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--text2)" };
const primaryBtn = {
  width: "100%", padding: "12px", background: "var(--primary)",
  color: "#fff", fontSize: 15, borderRadius: 10, marginTop: 8
};
const errorBox = {
  background: "#fee2e2", color: "#dc2626", borderRadius: 10,
  padding: "10px 14px", fontSize: 13, marginBottom: 16
};
const themeBtn = {
  position: "absolute", top: 20, right: 20,
  background: "var(--surface)", border: "1.5px solid var(--border)",
  borderRadius: 10, padding: "6px 12px", fontSize: 18
};