const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const { isDatabaseReady, query } = require("../db");
const { requireManager, verifySessionToken } = require("../auth");

// Sessão a partir do header Authorization OU do parâmetro ?token=. O elemento
// <video> (e o streaming com Range no iOS) não envia o cabeçalho Authorization,
// então o token de sessão também é aceito na query string.
function authFromRequest(request) {
  const header = String(request.headers.authorization || "");
  let token = "";
  if (header.toLowerCase().startsWith("bearer ")) token = header.slice(7).trim();
  if (!token && request.query) token = String(request.query.token || "");
  return verifySessionToken(token);
}

// Decide o acesso a UM vídeo com base APENAS no registro do servidor. Função
// pura (recebe a linha do banco) para ser testável diretamente.
//   { ok:true }              → autorizado
//   { ok:false, status:401 } → sem sessão válida
//   { ok:false, status:404 } → vídeo inexistente
//   { ok:false, status:403 } → vídeo de OUTRO trainer
// O vídeo é da biblioteca de um trainer; gestor e alunos do mesmo trainer têm
// acesso (os alunos acessam os exercícios desse trainer). Vídeo de outro
// trainer é negado independentemente do papel.
function authorizeVideoAccess(video, auth) {
  if (!auth) return { ok: false, status: 401 };
  if (!video) return { ok: false, status: 404 };
  if (video.trainer_id !== auth.trainerId) return { ok: false, status: 403 };
  return { ok: true };
}

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
      // Exige sessão válida (C4): header Authorization OU ?token=.
      const auth = authFromRequest(req);
      if (!auth) {
        res.status(401).json({ error: "Sessao expirada ou ausente. Entre novamente." });
        return;
      }
      if (!(await isDatabaseReady())) {
        res.status(503).end();
        return;
      }
      const result = await query(
        "select trainer_id, mimetype, size_bytes, data from videos where id = $1",
        [req.params.id]
      );
      // Ownership multi-tenant verificado contra o registro do servidor.
      const decision = authorizeVideoAccess(result.rows[0], auth);
      if (!decision.ok) {
        if (decision.status === 403) {
          res.status(403).json({ error: "Acesso negado a este video." });
        } else {
          res.status(decision.status).end();
        }
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

module.exports = { createVideosRouter, authorizeVideoAccess };
