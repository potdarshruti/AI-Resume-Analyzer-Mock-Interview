import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  fileName: String,
  extractedText: String,

  // Structured profile (Step 1)
  parsedProfile: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    summary: String,
  },

  // ATS score (Step 2)
  jobTitle: String,
  jobDescription: String,
  atsScore: Number,
  keywordScore: Number,
  cosineSimilarity: Number,
  matchedKeywords: [String],
  missingKeywords: [String],

  // AI rating (Step 3)
  rating: Number,
  ratingReason: String,
  missingSkills: [String],
  improvements: [String],
  strengths: [String],
  actionItems: [
    {
      priority: String,
      action: String,
    },
  ],

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Resume", resumeSchema);