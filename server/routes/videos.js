const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const { isDatabaseReady, query } = require("../db");
const { requireManager } = require("../auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(["video/mp4", "video/webm", "video/quicktime"]);
    cb(null, allowed.has(file.mimetype));
  }
});

function createVideosRouter() {
  const router = express.Router();

  router.post("/", requireManager, upload.single("video"), async (req, res, next) => {
    if (!req.file) {
      res.status(400).json({ error: "Arquivo de vídeo obrigatório (mp4/webm/mov, máx 60 MB)." });
      return;
    }
    try {
      if (!(await isDatabaseReady())) {
        res.status(503).json({ error: "Banco de dados indisponível." });
        return;
      }
      const id = crypto.randomBytes(12).toString("hex");
      const exerciseId = String(req.body.exerciseId || "");
      const trainerId = String(req.body.trainerId || "trainer-demo");
      await query(
        `insert into videos (id, exercise_id, trainer_id, mimetype, size_bytes, data)
         values ($1, $2, $3, $4, $5, $6)`,
        [id, exerciseId, trainerId, req.file.mimetype, req.file.size, req.file.buffer]
      );
      res.json({
        id,
        url: `/api/videos/${id}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      if (!(await isDatabaseReady())) {
        res.status(503).end();
        return;
      }
      const result = await query(
        "select mimetype, size_bytes, data from videos where id = $1",
        [req.params.id]
      );
      if (!result.rows.length) {
        res.status(404).end();
        return;
      }
      const { mimetype, size_bytes, data } = result.rows[0];
      res.setHeader("Content-Type", mimetype);
      res.setHeader("Content-Length", size_bytes);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createVideosRouter };
