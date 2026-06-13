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
      if (!/^[0-9a-f]{24}$/.test(req.params.id)) {
        res.status(404).end();
        return;
      }
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
      const { mimetype, data } = result.rows[0];
      const totalSize = Number(result.rows[0].size_bytes);

      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", mimetype);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : totalSize - 1;

        if (isNaN(start) || isNaN(end) || start > end || end >= totalSize) {
          res.status(416).setHeader("Content-Range", `bytes */${totalSize}`).end();
          return;
        }

        const chunk = data.slice(start, end + 1);
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        res.setHeader("Content-Length", chunk.length);
        res.end(chunk);
      } else {
        res.setHeader("Content-Length", totalSize);
        res.end(data);
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createVideosRouter };
