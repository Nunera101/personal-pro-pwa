const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadDir, contractUploadDir, profileUploadDir } = require("../config");
const { isDatabaseReady, query } = require("../db");
const { requireAuth, requireManager, verifySessionToken } = require("../auth");
const { ownsResource } = require("../ownership");
const { readCollection, writeCollection } = require("../storage/collections");

const SETTINGS_KEY = "personal-pro-settings-v1";
const STUDENTS_KEY = "personal-pro-students-v2";
const CONTRACTS_KEY = "personal-pro-contracts-v1";

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

// --- Serviço autenticado de /uploads (C3) -----------------------------------
// PDFs de contrato e fotos de perfil NÃO podem ser baixados por URL pública
// adivinhável. São servidos por esta rota, que exige sessão válida e confirma
// ownership do recurso contra os registros do servidor (coleções) — nunca
// confiando no nome do arquivo. Vídeos de exercício (biblioteca do personal)
// continuam servidos estaticamente, preservando compatibilidade.

// Último segmento do path de uma URL (sem query/fragmento). Robusto para URL
// absoluta (https://.../uploads/contracts/x.pdf) ou relativa (/uploads/...).
function fileNameFromUrl(value) {
  const raw = String(value || "").split("?")[0].split("#")[0];
  const slash = raw.lastIndexOf("/");
  return slash >= 0 ? raw.slice(slash + 1) : raw;
}

// Lê a sessão do header Authorization OU do parâmetro ?token= — necessário
// porque <img>/<iframe>/<a> não enviam o cabeçalho Authorization.
function authFromRequest(request) {
  const header = String(request.headers.authorization || "");
  let token = "";
  if (header.toLowerCase().startsWith("bearer ")) token = header.slice(7).trim();
  if (!token && request.query) token = String(request.query.token || "");
  return verifySessionToken(token);
}

// Decide o acesso a um arquivo de upload com base APENAS nos registros do
// servidor. Função pura (recebe as coleções) para ser testável diretamente.
//   { ok:true }            → autorizado
//   { ok:false, status:401 } → sem sessão válida
//   { ok:false, status:404 } → arquivo não pertence a nenhum recurso conhecido
//   { ok:false, status:403 } → pertence a recurso de OUTRO dono
function authorizeUploadAccess(category, fileName, auth, data = {}) {
  if (!auth) return { ok: false, status: 401 };
  const name = path.basename(String(fileName || ""));
  if (!name) return { ok: false, status: 404 };

  if (category === "contracts") {
    const contracts = Array.isArray(data.contracts) ? data.contracts : [];
    const contract = contracts.find((item) => fileNameFromUrl(item && item.pdfUrl) === name);
    if (!contract) return { ok: false, status: 404 };
    return ownsResource(contract, auth) ? { ok: true } : { ok: false, status: 403 };
  }

  if (category === "profiles") {
    const students = Array.isArray(data.students) ? data.students : [];
    const student = students.find((item) => fileNameFromUrl(item && item.photoUrl) === name);
    if (student) {
      const owner = { trainerId: student.trainerId, studentId: student.id };
      return ownsResource(owner, auth) ? { ok: true } : { ok: false, status: 403 };
    }
    const settings = data.settings || {};
    if (fileNameFromUrl(settings.trainerPhotoUrl) === name) {
      // Foto do personal: visível a qualquer usuário autenticado do mesmo tenant.
      if (settings.trainerId && settings.trainerId !== auth.trainerId) {
        return { ok: false, status: 403 };
      }
      return { ok: true };
    }
    return { ok: false, status: 404 };
  }

  return { ok: false, status: 404 };
}

function denyAsset(response, status) {
  const message =
    status === 401 ? "Sessao expirada ou ausente. Entre novamente." :
    status === 403 ? "Acesso negado a este arquivo." :
    "Arquivo nao encontrado.";
  response.status(status).json({ error: message });
}

function createUploadsAssetRouter() {
  const router = express.Router();

  async function serveProtected(category, dir, request, response, next) {
    try {
      const auth = authFromRequest(request);
      const fileName = path.basename(String(request.params.file || ""));
      const data = {};
      if (category === "contracts") {
        data.contracts = await readCollection(CONTRACTS_KEY, []);
      } else {
        data.students = await readCollection(STUDENTS_KEY, []);
        data.settings = await readCollection(SETTINGS_KEY, {});
      }
      const decision = authorizeUploadAccess(category, fileName, auth, data);
      if (!decision.ok) {
        denyAsset(response, decision.status);
        return;
      }
      response.sendFile(path.join(dir, fileName), (error) => {
        if (error) {
          if (response.headersSent) return;
          denyAsset(response, 404);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  router.get("/contracts/:file", (request, response, next) =>
    serveProtected("contracts", contractUploadDir, request, response, next)
  );
  router.get("/profiles/:file", (request, response, next) =>
    serveProtected("profiles", profileUploadDir, request, response, next)
  );

  // Vídeos de exercício: biblioteca do personal — mantém compatibilidade.
  router.use("/exercises", express.static(uploadDir));

  return router;
}

module.exports = {
  createUploadRouter,
  createUploadsAssetRouter,
  authorizeUploadAccess,
  fileNameFromUrl
};
