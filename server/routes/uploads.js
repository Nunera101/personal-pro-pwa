const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadDir } = require("../config");
const { isDatabaseReady, query } = require("../db");
const { requireManager } = require("../auth");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDir),
  filename: (request, file, callback) => {
    const exerciseId = String(request.body.exerciseId || "exercise").replace(/[^a-z0-9_-]/gi, "");
    const extension = path.extname(file.originalname || "").toLowerCase() || ".mp4";
    callback(null, `${exerciseId}-${Date.now()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowed = new Set(["video/mp4", "video/webm", "video/quicktime"]);
    callback(null, allowed.has(file.mimetype));
  }
});

function createUploadRouter() {
  const router = express.Router();

  router.post("/exercises", requireManager, upload.single("video"), async (request, response, next) => {
    if (!request.file) {
      response.status(400).json({ error: "Video upload required." });
      return;
    }

    try {
      const url = `/uploads/exercises/${request.file.filename}`;
      if (await isDatabaseReady()) {
        await query(
          `
            insert into media_uploads (trainer_id, owner_type, owner_id, url, original_name, size_bytes, mime_type)
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            String(request.body.trainerId || "trainer-demo"),
            "exercise",
            String(request.body.exerciseId || ""),
            url,
            request.file.originalname,
            request.file.size,
            request.file.mimetype
          ]
        );
      }

      response.json({
        url,
        originalName: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createUploadRouter
};
