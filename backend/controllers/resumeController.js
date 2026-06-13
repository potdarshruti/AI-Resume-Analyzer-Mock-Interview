import fs from "fs";
import pdf from "pdf-parse";

export const uploadResume = async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    res.status(200).json({
      message: "Resume uploaded successfully",
      text: data.text,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};