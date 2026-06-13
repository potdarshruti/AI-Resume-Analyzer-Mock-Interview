import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";

// ── Text to Speech helper ─────────────────────────────────────────────────────
const speak = (text, onEnd) => {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
};

// ── Category badge colors ─────────────────────────────────────────────────────
const categoryStyle = {
  intro:       { bg: "#ede9fe", color: "#7c3aed", label: "Introduction" },
  skills:      { bg: "#dbeafe", color: "#1d4ed8", label: "Skills" },
  project:     { bg: "#dcfce7", color: "#15803d", label: "Project" },
  internship:  { bg: "#fef9c3", color: "#a16207", label: "Internship" },
};

const sentimentColor = { good: "#15803d", average: "#a16207", poor: "#dc2626" };

export default function Interview() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const parsedProfile = location.state?.parsedProfile;

  const INTRO_QUESTION = {
    id: 0,
    category: "intro",
    question: "Tell me about yourself — your background, skills, and what you're looking for.",
  };

  const [allQuestions, setAllQuestions]   = useState([INTRO_QUESTION]);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [inputMode, setInputMode]         = useState("type"); // "type" | "speak"
  const [typedAnswer, setTypedAnswer]     = useState("");
  const [isListening, setIsListening]     = useState(false);
  const [transcript, setTranscript]       = useState("");
  const [feedbacks, setFeedbacks]         = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [finished, setFinished]           = useState(false);

  const recognitionRef = useRef(null);

  // ── Load questions on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!parsedProfile) { navigate("/analyze"); return; }

    const loadQuestions = async () => {
      try {
        const res = await axios.post("/interview/questions", { parsedProfile });
        setAllQuestions([INTRO_QUESTION, ...res.data.questions]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, []);

  // ── Speak question whenever it changes ───────────────────────────────────
  useEffect(() => {
    if (!loadingQuestions && allQuestions[currentIndex]) {
      setIsSpeaking(true);
      speak(allQuestions[currentIndex].question, () => setIsSpeaking(false));
    }
  }, [currentIndex, loadingQuestions]);

  // ── Speech recognition setup ─────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const result = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(result);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ── Submit answer and get feedback ───────────────────────────────────────
  const handleSubmitAnswer = async () => {
    const answer = inputMode === "type" ? typedAnswer : transcript;
    if (!answer.trim()) return alert("Please provide an answer.");

    const question = allQuestions[currentIndex];
    setLoadingFeedback(true);
    setCurrentFeedback(null);

    try {
      const res = await axios.post("/interview/feedback", {
        question: question.question,
        answer,
        category: question.category,
      });

      const fb = { ...res.data, question: question.question, answer, category: question.category };
      setCurrentFeedback(fb);
      setFeedbacks((prev) => [...prev, fb]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  // ── Next question ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentIndex + 1 >= allQuestions.length) {
      setFinished(true);
      window.speechSynthesis.cancel();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTypedAnswer("");
    setTranscript("");
    setCurrentFeedback(null);
  };

  // ── Replay question ───────────────────────────────────────────────────────
  const handleReplay = () => {
    setIsSpeaking(true);
    speak(allQuestions[currentIndex].question, () => setIsSpeaking(false));
  };

  // ── Final report ──────────────────────────────────────────────────────────
  if (finished) {
    const avg = feedbacks.length
      ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1)
      : 0;

    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>🎉 Interview Complete!</h1>
        <p style={{ color: "#6b7280" }}>Here's your performance summary</p>

        {/* Overall score */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 48, fontWeight: 800, color: "#15803d", margin: 0 }}>{avg}<span style={{ fontSize: 24 }}>/10</span></p>
          <p style={{ color: "#166534", marginTop: 4 }}>Overall Interview Score</p>
        </div>

        {/* Per-question breakdown */}
        {feedbacks.map((fb, i) => {
          const cat = categoryStyle[fb.category] || categoryStyle.skills;
          return (
            <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ background: cat.bg, color: cat.color, borderRadius: 12, padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>
                  {cat.label}
                </span>
                <span style={{ fontWeight: 700, color: sentimentColor[fb.sentiment] }}>
                  {fb.score}/10 — {fb.sentiment.toUpperCase()}
                </span>
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Q: {fb.question}</p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>A: {fb.answer}</p>
              <p style={{ fontSize: 14, marginBottom: 6 }}>{fb.feedback}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✅ {fb.strength}</div>
                <div style={{ background: "#fff7ed", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>💡 {fb.improvement}</div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => navigate("/analyze")}
          style={{ background: "#6366f1", color: "#fff", padding: "10px 28px", borderRadius: 8, border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
          ← Back to Resume Analyzer
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
        <p style={{ fontSize: 18, fontWeight: 600 }}>Preparing your interview questions...</p>
        <p style={{ color: "#6b7280" }}>Analyzing your resume profile</p>
      </div>
    );
  }

  const currentQ = allQuestions[currentIndex];
  const cat = categoryStyle[currentQ.category] || categoryStyle.skills;
  const progress = ((currentIndex) / allQuestions.length) * 100;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>🎤 Mock Interview</h1>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Question {currentIndex + 1} of {allQuestions.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6, marginBottom: 24 }}>
        <div style={{ background: "#6366f1", width: `${progress}%`, height: "100%", borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>

      {/* Question card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ background: cat.bg, color: cat.color, borderRadius: 12, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
            {cat.label}
          </span>
          <button
            onClick={handleReplay}
            disabled={isSpeaking}
            style={{ background: isSpeaking ? "#e5e7eb" : "#ede9fe", color: "#7c3aed", border: "none", borderRadius: 8, padding: "6px 14px", cursor: isSpeaking ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
            {isSpeaking ? "🔊 Speaking..." : "🔁 Replay"}
          </button>
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{currentQ.question}</p>
      </div>

      {/* Input mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setInputMode("type"); stopListening(); }}
          style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${inputMode === "type" ? "#6366f1" : "#e5e7eb"}`, background: inputMode === "type" ? "#ede9fe" : "#fff", color: inputMode === "type" ? "#6366f1" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          ⌨️ Type Answer
        </button>
        <button
          onClick={() => { setInputMode("speak"); setTypedAnswer(""); }}
          style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${inputMode === "speak" ? "#6366f1" : "#e5e7eb"}`, background: inputMode === "speak" ? "#ede9fe" : "#fff", color: inputMode === "speak" ? "#6366f1" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          🎤 Speak Answer
        </button>
      </div>

      {/* Answer input */}
      {inputMode === "type" ? (
        <textarea
          value={typedAnswer}
          onChange={(e) => setTypedAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
          style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" }}
        />
      ) : (
        <div style={{ background: "#f9fafb", border: `2px solid ${isListening ? "#6366f1" : "#e5e7eb"}`, borderRadius: 10, padding: 16, minHeight: 120, marginBottom: 8 }}>
          <p style={{ color: transcript ? "#111827" : "#9ca3af", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            {transcript || "Your spoken answer will appear here..."}
          </p>
        </div>
      )}

      {/* Speak controls */}
      {inputMode === "speak" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={startListening}
            disabled={isListening}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: isListening ? "#e5e7eb" : "#dcfce7", color: isListening ? "#9ca3af" : "#15803d", fontWeight: 600, cursor: isListening ? "not-allowed" : "pointer" }}>
            {isListening ? "🔴 Listening..." : "🎙️ Start Speaking"}
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: !isListening ? "#e5e7eb" : "#fee2e2", color: !isListening ? "#9ca3af" : "#dc2626", fontWeight: 600, cursor: !isListening ? "not-allowed" : "pointer" }}>
            ⏹️ Stop
          </button>
        </div>
      )}

      {/* Submit button */}
      {!currentFeedback && (
        <button
          onClick={handleSubmitAnswer}
          disabled={loadingFeedback || (!typedAnswer.trim() && !transcript.trim())}
          style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 10, border: "none", background: loadingFeedback ? "#a5b4fc" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loadingFeedback ? "not-allowed" : "pointer" }}>
          {loadingFeedback ? "⏳ Getting feedback..." : "Submit Answer →"}
        </button>
      )}

      {/* Feedback card */}
      {currentFeedback && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>📊 Feedback</p>
            <span style={{ fontWeight: 700, fontSize: 16, color: sentimentColor[currentFeedback.sentiment] }}>
              {currentFeedback.score}/10
            </span>
          </div>
          <p style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{currentFeedback.feedback}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", fontSize: 13, flex: 1 }}>
              <strong>✅ Strength:</strong> {currentFeedback.strength}
            </div>
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "8px 14px", fontSize: 13, flex: 1 }}>
              <strong>💡 Improve:</strong> {currentFeedback.improvement}
            </div>
          </div>
          <button
            onClick={handleNext}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: currentIndex + 1 >= allQuestions.length ? "#15803d" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            {currentIndex + 1 >= allQuestions.length ? "🎉 See Final Report" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}