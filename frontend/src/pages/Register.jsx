import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errs.name = "Name must be at least 2 characters.";
    } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(trimmedName)) {
      errs.name = "Name should only contain letters, spaces, and ' . -";
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errs.email = "Enter a valid email address (e.g. you@example.com).";
    }

    if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      errs.password = "Use upper, lower case letters and a number.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate("/");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <button onClick={toggleTheme} style={themeBtn}>
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 48 }}>🎯</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)", margin: "8px 0 4px" }}>
            ResuMockAI
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Create your free account</p>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldGroup}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldErrors.name ? inputErrorStyle : inputStyle}
              required
            />
            {fieldErrors.name && <span style={fieldErrorText}>{fieldErrors.name}</span>}
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldErrors.email ? inputErrorStyle : inputStyle}
              required
            />
            {fieldErrors.email && <span style={fieldErrorText}>{fieldErrors.email}</span>}
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldErrors.password ? inputErrorStyle : inputStyle}
              required
            />
            {fieldErrors.password && <span style={fieldErrorText}>{fieldErrors.password}</span>}
          </div>

          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text2)" }}>
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
  position: "relative",
  padding: 16,
};

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: "40px 36px",
  width: "100%",
  maxWidth: 420,
  boxShadow: "var(--shadow)",
};

const fieldGroup = { marginBottom: 16 };

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text2)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const inputErrorStyle = {
  ...inputStyle,
  border: "1px solid #dc2626",
};

const fieldErrorText = {
  display: "block",
  marginTop: 6,
  fontSize: 12,
  color: "#dc2626",
};

const primaryBtn = {
  width: "100%",
  padding: "12px",
  background: "var(--primary)",
  color: "#fff",
  fontSize: 15,
  borderRadius: 10,
  marginTop: 8,
  border: "none",
  cursor: "pointer",
};

const errorBox = {
  background: "#fee2e2",
  color: "#dc2626",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  marginBottom: 16,
};

const themeBtn = {
  position: "absolute",
  top: 20,
  right: 20,
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: 10,
  padding: "6px 12px",
  fontSize: 18,
  cursor: "pointer",
};
