import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import mongoose from "mongoose";
import protect from "../middleware/authMiddleware.js";

import {
  parseResumeToProfile,
  calculateATSScore,
  generateRatingAndImprovements,
} from "../services/aiService.js";
import Resume from "../models/Resume.js";

const router = express.Router();

// POST /api/resume/analyze
router.post("/analyze", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { jobTitle = "", jobDescription = "" } = req.body;
    const userId = req.user.id; // 👈 from JWT, not from req.body — don't trust client-sent userId
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    let extractedText = "";

    if (fileType === "application/pdf") {
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text;
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ message: "Only PDF and DOCX allowed" });
    }

    if (!extractedText.trim())
      return res.status(400).json({ message: "Could not extract text" });

    const parsedProfile = await parseResumeToProfile(extractedText);

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

    const aiResult = await generateRatingAndImprovements(
      extractedText,
      jobTitle,
      jobDescription
    );

    const resumeDoc = await Resume.create({
      userId: new mongoose.Types.ObjectId(userId),
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
router.get("/history/:userId", protect, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this history" });
    }

    const resumes = await Resume.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 })
      .select("-extractedText -jobDescription");
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;
