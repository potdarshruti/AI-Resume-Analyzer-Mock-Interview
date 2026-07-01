import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const CircularProgress = ({ value, max = 10, size = 120, color = "#6366f1" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / max) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circumference} strokeDashoffset={progress}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
        fontSize="20" fontWeight="bold" fill={color}>{value ?? "–"}</text>
      <text x="50" y="65" textAnchor="middle" fontSize="8" fill="#6b7280">/ {max}</text>
    </svg>
  );
};

const Badge = ({ text, color = "#e0e7ff" }) => (
  <span style={{ background: color, borderRadius: 12, padding: "2px 10px", fontSize: 13, marginRight: 6, marginBottom: 6, display: "inline-block" }}>
    {text}
  </span>
);

const ResumeAnalyzer = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file) return setError("Please select a resume file.");
    setError(""); setLoading(true); setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    const userId = localStorage.getItem("userId");
    if (userId) formData.append("userId", userId);

    try {
      const res = await axios.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { high: "#fee2e2", medium: "#fef9c3", low: "#dcfce7" };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🧠 Resume Analyzer</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Upload your resume and optionally paste a Job Description for ATS scoring.</p>

      {/* ── Upload Section ── */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Resume (PDF or DOCX)</label>
            <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
            {file && <span style={{ fontSize: 13, color: "#6b7280", display: "block", marginTop: 4 }}>📄 {file.name}</span>}
            <p style={{ fontSize: 12, color: "#f59e0b", marginTop: 6, marginBottom: 0 }}>
              ⚠️ Please upload a text-based PDF or DOCX. Scanned image PDFs (e.g. from DocScanner) are not supported.
            </p>
          </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Target Job Title (optional)</label>
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Job Description (optional, for ATS score)</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..." rows={4}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <button onClick={handleAnalyze} disabled={loading}
          style={{ background: loading ? "#a5b4fc" : "#6366f1", color: "#fff", padding: "10px 28px", borderRadius: 8, border: "none", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "⏳ Analyzing..." : "Analyze Resume"}
        </button>
        {error && <p style={{ color: "#ef4444", marginTop: 12 }}>{error}</p>}
      </div>

      {/* ── Results ── */}
      {result && (
        <div>
          {/* Score Cards */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>

            {/* AI Rating */}
            <div style={{ flex: 1, minWidth: 180, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <p style={{ fontWeight: 600, marginBottom: 12, color: "#374151" }}>AI Rating</p>
              <CircularProgress value={result.rating} max={10} color="#6366f1" />
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>{result.ratingReason}</p>
            </div>

            {/* ATS Score */}
            {result.atsData?.atsScore != null && (
              <div style={{ flex: 1, minWidth: 180, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "#374151" }}>ATS Score</p>
                <CircularProgress value={result.atsData.atsScore} max={100} color="#10b981" />
                <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>
                  <div>Keywords: {result.atsData.keywordScore}%</div>
                  <div>Similarity: {result.atsData.cosineSimilarity}%</div>
                </div>
              </div>
            )}

            {/* Parsed Profile */}
            <div style={{ flex: 2, minWidth: 220, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 10, color: "#374151" }}>Parsed Profile</p>
              <p style={{ margin: "4px 0", fontSize: 14 }}><strong>Name:</strong> {result.parsedProfile?.name || "–"}</p>
              <p style={{ margin: "4px 0", fontSize: 14 }}><strong>Email:</strong> {result.parsedProfile?.email || "–"}</p>
              <div style={{ marginTop: 8 }}>
                <strong style={{ fontSize: 14 }}>Skills:</strong>
                <div style={{ marginTop: 6 }}>
                  {result.parsedProfile?.skills?.map((s) => <Badge key={s} text={s} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Matched / Missing Keywords */}
          {result.atsData?.matchedKeywords?.length > 0 && (
            <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 600, color: "#15803d", marginBottom: 8 }}>✅ Matched Keywords</p>
                {result.atsData.matchedKeywords.map((k) => <Badge key={k} text={k} color="#dcfce7" />)}
              </div>
              <div style={{ flex: 1, minWidth: 200, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 600, color: "#c2410c", marginBottom: 8 }}>⚠️ Missing Keywords</p>
                {result.atsData.missingKeywords.map((k) => <Badge key={k} text={k} color="#ffedd5" />)}
              </div>
            </div>
          )}

          {/* Improvements */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>💡 Suggested Improvements</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {result.improvements?.map((imp, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 14, color: "#374151" }}>{imp}</li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>✅ Action Items</p>
            {result.actionItems?.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: priorityColor[item.priority] || "#f9fafb", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", paddingTop: 2, minWidth: 48 }}>{item.priority}</span>
                <span style={{ fontSize: 14 }}>{item.action}</span>
              </div>
            ))}
          </div>

          {/* Missing Skills */}
          {result.missingSkills?.length > 0 && (
            <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>🧩 Missing Key Skills</p>
              <div>{result.missingSkills.map((s) => <Badge key={s} text={s} color="#f3e8ff" />)}</div>
            </div>
          )}

          {/* ── START INTERVIEW BUTTON ── */}
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <button
              onClick={() => navigate("/interview", { state: { parsedProfile: result.parsedProfile } })}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", padding: "16px 48px", borderRadius: 12,
                border: "none", fontSize: 18, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
            >
              🎤 Start Mock Interview
            </button>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 10 }}>
              7 questions based on your resume • AI feedback on every answer
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
