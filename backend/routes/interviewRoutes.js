import express from "express";
import Groq from "groq-sdk";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

let client = null;
const getClient = () => {
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
};

const askGroq = async (prompt) => {
  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content;
};

// POST /api/interview/questions
// Generate interview questions based on parsed resume profile
router.post("/questions", protect, async (req, res) => {
  try {
    const { parsedProfile } = req.body;

    if (!parsedProfile) {
      return res.status(400).json({ message: "parsedProfile is required" });
    }

    const prompt = `
You are a technical interviewer. Based on this candidate profile, generate interview questions.

Profile:
- Skills: ${parsedProfile.skills?.join(", ") || "Not specified"}
- Experience/Internships: ${parsedProfile.experience?.map(e => `${e.title} at ${e.company}`).join(", ") || "None"}
- Projects: ${parsedProfile.experience?.map(e => e.description).join(", ") || "None"}

Generate exactly 6 questions in this JSON format. Return ONLY valid JSON, no markdown, no backticks.

{
  "questions": [
    { "id": 1, "category": "skills", "question": "question about a specific skill they have" },
    { "id": 2, "category": "skills", "question": "another question about their technical skills" },
    { "id": 3, "category": "project", "question": "question about a specific project they did" },
    { "id": 4, "category": "project", "question": "another question about their project work" },
    { "id": 5, "category": "internship", "question": "question about their internship/work experience" },
    { "id": 6, "category": "internship", "question": "another question about their professional experience" }
  ]
}

Make questions specific to THEIR skills and experience, not generic.
`;

    const text = await askGroq(prompt);
    const data = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.status(200).json(data);
  } catch (error) {
    console.error("Interview Questions Error:", error.message);
    res.status(500).json({ message: "Error generating questions" });
  }
});

// POST /api/interview/feedback
// Get AI feedback on a single answer
router.post("/feedback", protect, async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }

    const prompt = `
You are an experienced interviewer giving feedback on a candidate's answer.

Question: "${question}"
Category: ${category}
Candidate's Answer: "${answer}"

Evaluate the answer and return ONLY valid JSON, no markdown, no backticks.

{
  "score": <number 1-10>,
  "sentiment": "good|average|poor",
  "feedback": "2-3 sentences of constructive feedback",
  "strength": "one thing they did well",
  "improvement": "one specific thing to improve"
}
`;

    const text = await askGroq(prompt);
    const data =
