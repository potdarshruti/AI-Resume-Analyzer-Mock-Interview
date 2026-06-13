import Groq from "groq-sdk";

let client = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("Initializing Groq client with key:", apiKey?.slice(0, 10));
    client = new Groq({ apiKey });
  }
  return client;
};

const askGroq = async (prompt) => {
  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",  // free + very capable
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content;
};

// ─── Parse resume text into structured JSON profile ───────────────────────────
export const parseResumeToProfile = async (resumeText) => {
  const prompt = `
Extract structured data from this resume. Return ONLY a valid JSON object with NO markdown, no backticks, no explanation.

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "title": "string", "company": "string", "duration": "string", "description": "string" }
  ],
  "education": [
    { "degree": "string", "institution": "string", "year": "string" }
  ],
  "summary": "string"
}

Resume:
${resumeText}
`;
  const text = await askGroq(prompt);
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

// ─── Calculate ATS score (pure JS, no AI needed) ─────────────────────────────
export const calculateATSScore = (resumeText, jdText) => {
  const tokenize = (text) =>
    text.toLowerCase().match(/\b[a-z][a-z0-9+#.]*\b/g) || [];

  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jdText);

  const jdKeywords = [...new Set(jdTokens)];
  const matched = jdKeywords.filter((kw) => resumeTokens.includes(kw));
  const keywordScore = Math.round((matched.length / jdKeywords.length) * 100);

  const allWords = [...new Set([...resumeTokens, ...jdTokens])];
  const toVector = (tokens) =>
    allWords.map((w) => tokens.filter((t) => t === w).length);

  const resumeVec = toVector(resumeTokens);
  const jdVec = toVector(jdTokens);

  const dot = resumeVec.reduce((sum, v, i) => sum + v * jdVec[i], 0);
  const magResume = Math.sqrt(resumeVec.reduce((sum, v) => sum + v * v, 0));
  const magJD = Math.sqrt(jdVec.reduce((sum, v) => sum + v * v, 0));
  const cosineSimilarity =
    magResume && magJD ? Math.round((dot / (magResume * magJD)) * 100) : 0;

  const atsScore = Math.round(keywordScore * 0.6 + cosineSimilarity * 0.4);

  return {
    atsScore,
    keywordScore,
    cosineSimilarity,
    matchedKeywords: matched.slice(0, 20),
    missingKeywords: jdKeywords
      .filter((kw) => !resumeTokens.includes(kw))
      .slice(0, 20),
  };
};

// ─── AI Rating + Improvements ─────────────────────────────────────────────────
export const generateRatingAndImprovements = async (
  resumeText,
  jobTitle = "",
  jdText = ""
) => {
  const prompt = `
Analyze this resume${jobTitle ? ` for a "${jobTitle}" role` : ""}.
${jdText ? `Job Description:\n${jdText}\n` : ""}

Return ONLY a valid JSON object with NO markdown, no backticks, no explanation.

{
  "rating": <number 1-10>,
  "ratingReason": "brief explanation",
  "missingSkills": ["skill1", "skill2", "skill3"],
  "improvements": [
    "Improvement 1",
    "Improvement 2",
    "Improvement 3",
    "Improvement 4",
    "Improvement 5"
  ],
  "strengths": ["strength1", "strength2"],
  "actionItems": [
    { "priority": "high", "action": "string" },
    { "priority": "medium", "action": "string" },
    { "priority": "low", "action": "string" }
  ]
}

Resume:
${resumeText}
`;
  const text = await askGroq(prompt);
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};