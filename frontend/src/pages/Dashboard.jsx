import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const cards = [
    {
      icon: "📄", title: "Resume Analyzer",
      desc: "Upload your resume and get ATS score, AI rating, keyword gaps, and improvement suggestions.",
      btn: "Analyze Resume", path: "/analyze", color: "#6366f1"
    },
    {
      icon: "🎤", title: "Mock Interview",
      desc: "Practice with AI-generated questions based on your resume. Get feedback on every answer.",
      btn: "Start Interview", path: "/interview", color: "#8b5cf6"
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px", fontFamily: "sans-serif" }}>

      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        borderRadius: 20, padding: "36px 40px", marginBottom: 36, color: "#fff"
      }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 8px" }}>Welcome back! 👋</h1>
        <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>
          Your AI-powered career toolkit — analyze resumes and practice interviews.
        </p>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 36 }}>
        {cards.map((card) => (
          <div key={card.title} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 28, boxShadow: "var(--shadow)",
            display: "flex", flexDirection: "column", gap: 12
          }}>
            <span style={{ fontSize: 40 }}>{card.icon}</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>{card.title}</h2>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: 0, flex: 1 }}>{card.desc}</p>
            <button
              onClick={() => navigate(card.path)}
              style={{ background: card.color, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 14, alignSelf: "flex-start" }}>
              {card.btn} →
            </button>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>💡 Quick Tips</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { icon: "📋", tip: "Paste a job description for a full ATS score" },
            { icon: "🎯", tip: "Interview works best after analyzing your resume first" },
            { icon: "🌙", tip: "Toggle dark mode from the navbar anytime" },
          ].map((t) => (
            <div key={t.tip} style={{ background: "var(--surface2)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}