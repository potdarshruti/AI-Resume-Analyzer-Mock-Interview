import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const authPages = ["/", "/register"];
  if (authPages.includes(location.pathname)) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={{
      background: "var(--surface)", borderBottom: "1px solid var(--border)",
      padding: "0 24px", height: 60, display: "flex",
      alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "var(--shadow)"
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <span style={{ fontSize: 24 }}>🧠</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>ResumeAI</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NavBtn onClick={() => navigate("/dashboard")} active={location.pathname === "/dashboard"}>Dashboard</NavBtn>
        <NavBtn onClick={() => navigate("/analyze")} active={location.pathname === "/analyze"}>Analyzer</NavBtn>
        <NavBtn onClick={() => navigate("/interview")} active={location.pathname === "/interview"}>Interview</NavBtn>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "var(--surface2)", color: "var(--text)",
            border: "1.5px solid var(--border)", borderRadius: 10,
            padding: "6px 12px", fontSize: 16, marginLeft: 4
          }}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: "var(--danger)", color: "#fff",
              padding: "7px 16px", borderRadius: 10, fontSize: 13
            }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

function NavBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--primary)" : "transparent",
      color: active ? "#fff" : "var(--text2)",
      padding: "7px 16px", borderRadius: 10, fontSize: 14,
      border: active ? "none" : "1.5px solid transparent",
    }}>
      {children}
    </button>
  );
}