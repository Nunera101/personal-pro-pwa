const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadDir, contractUploadDir, profileUploadDir } = require("../config");
const { isDatabaseReady, query } = require("../db");
const { requireAuth, requireManager } = require("../auth");
const { readCollection, writeCollection } = require("../storage/collections");

const SETTINGS_KEY = "personal-pro-settings-v1";
const STUDENTS_KEY = "personal-pro-students-v2";

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(contractUploadDir, { recursive: true });
fs.mkdirSync(profileUploadDir, { recursive: true });

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

const contractPdfStorage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, contractUploadDir),
  filename: (request, file, callback) => {
    const contractId = String(request.body.contractId || "contract").replace(/[^a-z0-9_-]/gi, "");
    const extension = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    callback(null, `${contractId}-${Date.now()}${extension}`);
  }
});

const contractPdfUpload = multer({
  storage: contractPdfStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype === "application/pdf");
  }
});

const profilePhotoStorage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, profileUploadDir),
  filename: (request, file, callback) => {
    const auth = request.auth || {};
    const ownerId = auth.role === "student" ? (String(auth.studentId || "student")) : String(auth.trainerId || "trainer");
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    callback(null, `${ownerId}-${Date.now()}${extension}`);
  }
});

const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
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

  router.post("/contracts", requireManager, contractPdfUpload.single("pdf"), async (request, response, next) => {
    if (!request.file) {
      response.status(400).json({ error: "PDF upload required." });
      return;
    }
    try {
      const url = `/uploads/contracts/${request.file.filename}`;
      if (await isDatabaseReady()) {
        await query(
          `insert into media_uploads (trainer_id, owner_type, owner_id, url, original_name, size_bytes, mime_type)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [
            String(request.body.trainerId || "trainer-demo"),
            "contract",
            String(request.body.contractId || ""),
            url,
            request.file.originalname,
            request.file.size,
            request.file.mimetype
          ]
        );
      }
      response.json({ url, originalName: request.file.originalname, size: request.file.size });
    } catch (error) {
      next(error);
    }
  });

  router.post("/profile", requireAuth, profilePhotoUpload.single("photo"), async (request, response, next) => {
    if (!request.file) {
      response.status(400).json({ error: "Foto de perfil obrigatória (JPEG, PNG ou WebP até 5 MB)." });
      return;
    }
    try {
      const url = `/uploads/profiles/${request.file.filename}`;
      const auth = request.auth;

      if (await isDatabaseReady()) {
        await query(
          `insert into media_uploads (trainer_id, owner_type, owner_id, url, original_name, size_bytes, mime_type)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [
            String(auth.trainerId || "trainer-demo"),
            "profile",
            String(auth.role === "student" ? auth.studentId : (auth.trainerId || "trainer-demo")),
            url,
            request.file.originalname,
            request.file.size,
            request.file.mimetype
          ]
        );
      }

      if (auth.role === "manager") {
        const settings = await readCollection(SETTINGS_KEY, {});
        await writeCollection(SETTINGS_KEY, { ...settings, trainerPhotoUrl: url });
      } else if (auth.role === "student" && auth.studentId) {
        const students = await readCollection(STUDENTS_KEY, []);
        const idx = students.findIndex((s) => s.id === auth.studentId);
        if (idx >= 0) {
          students[idx] = { ...students[idx], photoUrl: url };
          await writeCollection(STUDENTS_KEY, students);
        }
      }

      response.json({ url, originalName: request.file.originalname, size: request.file.size });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createUploadRouter
};
