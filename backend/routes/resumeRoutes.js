import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import mongoose from "mongoose";

import {
  parseResumeToProfile,
  calculateATSScore,
  generateRatingAndImprovements,
} from "../services/aiService.js";
import Resume from "../models/Resume.js";

const router = express.Router();

// POST /api/resume/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { jobTitle = "", jobDescription = "", userId } = req.body;
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // ── 1. Extract text ──────────────────────────────────────────────────────
    let extractedText = "";

    if (fileType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      return res.status(400).json({ message: "Only PDF and DOCX allowed" });
    }

    if (!extractedText.trim())
      return res.status(400).json({ message: "Could not extract text" });

    // ── 2. Parse into structured profile ────────────────────────────────────
    const parsedProfile = await parseResumeToProfile(extractedText);

    // ── 3. ATS score (only if JD provided) ──────────────────────────────────
    let atsData = {
      atsScore: null,
      keywordScore: null,
      cosineSimilarity: null,
      matchedKeywords: [],
      missingKeywords: [],
    };

    if (jobDescription.trim()) {
      atsData = calculateATSScore(extractedText, jobDescription);
    }

    // ── 4. AI Rating + Improvements ─────────────────────────────────────────
    const aiResult = await generateRatingAndImprovements(
      extractedText,
      jobTitle,
      jobDescription
    );

    // ── 5. Save to MongoDB ───────────────────────────────────────────────────
    const resumeDoc = await Resume.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      fileName: req.file.originalname,
      extractedText,
      parsedProfile,
      jobTitle,
      jobDescription,
      ...atsData,
      ...aiResult,
      uploadedAt: new Date(),
    });

    res.status(200).json({
      message: "Resume analyzed successfully",
      resumeId: resumeDoc._id,
      parsedProfile,
      atsData,
      rating: aiResult.rating,
      ratingReason: aiResult.ratingReason,
      missingSkills: aiResult.missingSkills,
      improvements: aiResult.improvements,
      strengths: aiResult.strengths,
      actionItems: aiResult.actionItems,
    });
  } catch (error) {
    console.error("Analyze Route Error:", error.message);
    res.status(500).json({ message: "Error analyzing resume", error: error.message });
  }
});

// GET /api/resume/history/:userId
router.get("/history/:userId", async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 })
      .select("-extractedText -jobDescription"); // exclude large fields
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;