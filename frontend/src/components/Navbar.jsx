import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const authPages = ["/", "/register"];
  if (authPages.includes(location.pathname)) return null;

  const handleLogout = () => { logout(); navigate("/"); };
  const handleNav = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <>
      <nav style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow)"
      }}>
        {/* Logo */}
        <div
          onClick={() => handleNav("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>ResuMockAI</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
          className="desktop-nav">
          <NavBtn onClick={() => handleNav("/dashboard")} active={location.pathname === "/dashboard"}>Dashboard</NavBtn>
          <NavBtn onClick={() => handleNav("/analyze")} active={location.pathname === "/analyze"}>Analyzer</NavBtn>
          <NavBtn onClick={() => handleNav("/interview")} active={location.pathname === "/interview"}>Interview</NavBtn>

          <button onClick={toggleTheme} style={{
            background: "var(--surface2)", color: "var(--text)",
            border: "1.5px solid var(--border)", borderRadius: 10,
            padding: "6px 12px", fontSize: 16, marginLeft: 4, cursor: "pointer"
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {user && (
            <button onClick={handleLogout} style={{
              background: "var(--danger)", color: "#fff",
              padding: "7px 16px", borderRadius: 10, fontSize: 13,
              border: "none", cursor: "pointer"
            }}>
              Logout
            </button>
          )}
        </div>

        {/* Mobile Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
          className="mobile-nav">
          <button onClick={toggleTheme} style={{
            background: "var(--surface2)", color: "var(--text)",
            border: "1.5px solid var(--border)", borderRadius: 10,
            padding: "6px 10px", fontSize: 16, cursor: "pointer"
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent", border: "1.5px solid var(--border)",
              borderRadius: 10, padding: "6px 10px", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 5,
              alignItems: "center", justifyContent: "center", width: 40, height: 38
            }}>
            <span style={{
              display: "block", width: 20, height: 2,
              background: "var(--text)",
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
              transition: "all 0.3s"
            }} />
            <span style={{
              display: "block", width: 20, height: 2,
              background: "var(--text)",
              opacity: menuOpen ? 0 : 1,
              transition: "all 0.3s"
            }} />
            <span style={{
              display: "block", width: 20, height: 2,
              background: "var(--text)",
              transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
              transition: "all 0.3s"
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0,
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          zIndex: 99, padding: "16px 24px",
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: "var(--shadow)"
        }} className="mobile-menu">
          <MobileNavBtn
            onClick={() => handleNav("/dashboard")}
            active={location.pathname === "/dashboard"}>
            🏠 Dashboard
          </MobileNavBtn>
          <MobileNavBtn
            onClick={() => handleNav("/analyze")}
            active={location.pathname === "/analyze"}>
            📄 Analyzer
          </MobileNavBtn>
          <MobileNavBtn
            onClick={() => handleNav("/interview")}
            active={location.pathname === "/interview"}>
            🎤 Interview
          </MobileNavBtn>

          {user && (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{
              background: "var(--danger)", color: "#fff",
              padding: "12px 16px", borderRadius: 10, fontSize: 14,
              border: "none", cursor: "pointer", textAlign: "left",
              marginTop: 8
            }}>
              🚪 Logout
            </button>
          )}
        </div>
      )}

      {/* CSS for showing/hiding desktop vs mobile */}
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        .mobile-menu { display: flex; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }

        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}

function NavBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--primary)" : "transparent",
      color: active ? "#fff" : "var(--text2)",
      padding: "7px 16px", borderRadius: 10, fontSize: 14,
      border: active ? "none" : "1.5px solid transparent",
      cursor: "pointer"
    }}>
      {children}
    </button>
  );
}

function MobileNavBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--primary)" : "var(--surface2)",
      color: active ? "#fff" : "var(--text)",
      padding: "12px 16px", borderRadius: 10, fontSize: 15,
      border: "1.5px solid var(--border)",
      cursor: "pointer", textAlign: "left", width: "100%"
    }}>
      {children}
    </button>
  );
}
