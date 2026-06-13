const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." }
});
const { isDatabaseReady, query: dbQuery } = require("../db");
const { storageDriver } = require("../config");
const { readCollection, writeCollection } = require("../storage/collections");
const { getDataScope, filterByOwner, splitByOwner, OWNER_SCOPED_COLLECTIONS } = require("../storage/dataScope");
const { assertOwnership, enforceOwnerOnWrite } = require("../ownership");
const { isMailConfigured, sendPasswordResetEmail, sendStudentInviteEmail, sendContractEmail } = require("../mail");
const { TRAINER_ID, SESSION_TTL, createSessionToken, requireAuth, requireManager } = require("../auth");
const { getVapidPublicKey, savePushSubscription, removePushSubscriptionByEndpoint, sendPushToStudent, sendPushToManager } = require("../push");

// E-mail do admin e hash bcrypt da senha vem SEMPRE do ambiente em producao.
// No Railway defina: ADMIN_EMAIL e ADMIN_PASSWORD_HASH (ver README "Variaveis de ambiente").
// Gere o hash com: node server/gen-admin-hash.js "suaSenhaForte"
const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || "admin@personalpro.app");
const ADMIN_PASSWORD_HASH_ENV = String(process.env.ADMIN_PASSWORD_HASH || "").trim();
const STUDENTS_KEY = "personal-pro-students-v2";
const EXERCISES_KEY = "personal-pro-exercises-v1";
const WORKOUTS_KEY = "personal-pro-workouts-v3";
const ACTIVITIES_KEY = "personal-pro-activities-v2";
const SESSIONS_KEY = "personal-pro-training-sessions-v1";
const UPDATES_KEY = "personal-pro-updates-v1";
const CONTRACTS_KEY = "personal-pro-contracts-v1";
const MESSAGES_KEY = "personal-pro-messages-v1";
const PAYMENTS_KEY = "personal-pro-payments-v1";
const DIETS_KEY = "personal-pro-diets-v1";
const SETTINGS_KEY = "personal-pro-settings-v1";
const PASSWORD_RESETS_KEY = "personal-pro-password-resets-v1";
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const STUDENT_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CONTRACT_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STUDENT_AREA_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const COLLECTION_ALLOWLIST = new Set([
  STUDENTS_KEY,
  EXERCISES_KEY,
  WORKOUTS_KEY,
  ACTIVITIES_KEY,
  SESSIONS_KEY,
  UPDATES_KEY,
  CONTRACTS_KEY,
  MESSAGES_KEY,
  PAYMENTS_KEY,
  DIETS_KEY,
  SETTINGS_KEY
]);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(value) {
  let hash = 2166136261;
  const input = `personal-pro-demo:${String(value || "")}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ""));
}

function createPasswordHash(password) {
  return bcrypt.hashSync(String(password || ""), 12);
}

function verifyPassword(password, storedHash) {
  const hash = String(storedHash || "");
  if (!hash) return false;
  if (isBcryptHash(hash)) return bcrypt.compareSync(String(password || ""), hash);
  return hashPassword(password) === hash;
}

// Senha de admin para desenvolvimento local quando ADMIN_PASSWORD_HASH nao esta no ambiente.
// Nunca e usada em producao e o hash nunca e enviado ao cliente.
const DEV_ADMIN_PASSWORD = "admin-dev";
let devAdminPasswordHash = "";

// Resolve o hash bcrypt da senha do admin sem nunca expor a senha em si.
// Prioridade: ADMIN_PASSWORD_HASH (ambiente) > fallback local (apenas fora de producao).
function resolveAdminPasswordHash() {
  if (ADMIN_PASSWORD_HASH_ENV) return ADMIN_PASSWORD_HASH_ENV;
  if (process.env.NODE_ENV === "production") return "";
  if (!devAdminPasswordHash) {
    devAdminPasswordHash = createPasswordHash(DEV_ADMIN_PASSWORD);
    console.warn(
      `[seguranca] ADMIN_PASSWORD_HASH nao definido: usando senha de DESENVOLVIMENTO "${DEV_ADMIN_PASSWORD}" (apenas local). ` +
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD_HASH no ambiente (Railway) antes de ir para producao."
    );
  }
  return devAdminPasswordHash;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

function sanitizeBaseUrl(value) {
  try {
    const url = new URL(value || "");
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (_error) {
    return "";
  }
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}$/;
function isValidEmail(value) { return EMAIL_RE.test(String(value || "")); }
function withinLen(value, max) { return String(value ?? "").length <= max; }

function buildResetUrl(request, token) {
  const requestedBase = sanitizeBaseUrl(request.body?.appUrl);
  const origin = `${request.protocol}://${request.get("host")}`;
  const fallbackBase = sanitizeBaseUrl(process.env.APP_PUBLIC_URL || origin) || origin;
  const url = new URL(requestedBase || fallbackBase);
  url.searchParams.set("reset", token);
  return url.toString();
}

function buildContractUrl(request, token) {
  const requestedBase = sanitizeBaseUrl(request.body?.appUrl);
  const origin = `${request.protocol}://${request.get("host")}`;
  const fallbackBase = sanitizeBaseUrl(process.env.APP_PUBLIC_URL || origin) || origin;
  const url = new URL(requestedBase || fallbackBase);
  url.searchParams.set("contract", token);
  return url.toString();
}

function buildStudentAreaUrl(request, token) {
  const requestedBase = sanitizeBaseUrl(request.body?.appUrl);
  const origin = `${request.protocol}://${request.get("host")}`;
  const fallbackBase = sanitizeBaseUrl(process.env.APP_PUBLIC_URL || origin) || origin;
  const url = new URL(requestedBase || fallbackBase);
  url.pathname = "/acesso";
  url.search = "";
  url.searchParams.set("token", token);
  return url.toString();
}

function normalizeStudentAccessStatus(value, hasPassword = false) {
  const status = String(value || "").trim();
  if (["active", "invite_pending", "awaiting_activation"].includes(status)) return status;
  return hasPassword ? "active" : "invite_pending";
}

function sanitizeStudent(student = {}) {
  const hasPassword = Boolean(student.passwordHash || student.hasPassword);
  const { password, passwordHash, ...safeStudent } = student;
  return {
    ...safeStudent,
    accessStatus: normalizeStudentAccessStatus(student.accessStatus, hasPassword),
    hasPassword
  };
}

function sanitizeSettings(settings = {}) {
  // Nunca expor hash ao cliente; descartamos tambem o campo legado adminPasswordHash/At.
  // adminPasswordConfigured reflete o AMBIENTE (ADMIN_PASSWORD_HASH), unica fonte de verdade.
  const { adminPasswordHash, adminPasswordUpdatedAt, ...safeSettings } = settings || {};
  return {
    ...safeSettings,
    adminPasswordConfigured: Boolean(resolveAdminPasswordHash())
  };
}

function sanitizeCollection(collection, value, auth) {
  if (collection === SETTINGS_KEY) return sanitizeSettings(value || {});
  if (!Array.isArray(value)) return value;

  if (collection === STUDENTS_KEY) {
    const students = auth.role === "student" ? value.filter((item) => item.id === auth.studentId) : value;
    return students.map(sanitizeStudent);
  }

  if (auth.role === "manager") return value;

  if ([ACTIVITIES_KEY, SESSIONS_KEY, UPDATES_KEY, CONTRACTS_KEY, MESSAGES_KEY, PAYMENTS_KEY, DIETS_KEY].includes(collection)) {
    return value.filter((item) => item.studentId === auth.studentId);
  }

  if (collection === WORKOUTS_KEY) {
    return value.filter((item) => item.studentId === auth.studentId && item.status === "published");
  }

  if (collection === EXERCISES_KEY) {
    return value.filter((item) => item.status !== "inactive");
  }

  return [];
}

function mergeStudentsForWrite(existing = [], incoming = [], auth = {}) {
  const existingById = new Map(existing.map((item) => [String(item.id || ""), item]));
  return incoming.map((student) => {
    const previous = existingById.get(String(student.id || "")) || {};
    const passwordHash = student.passwordHash && student.passwordHash !== "[hash]" ? student.passwordHash : previous.passwordHash || "";
    // OWNERSHIP (R-02): trainerId do aluno vem do SERVIDOR — preserva o do registro
    // ja gravado ou carimba o da sessao em novos alunos. Nunca aceito do corpo.
    const trainerId = previous.trainerId || auth.trainerId || TRAINER_ID;
    return {
      ...student,
      trainerId,
      passwordHash,
      accessStatus: normalizeStudentAccessStatus(student.accessStatus, Boolean(passwordHash || student.hasPassword))
    };
  });
}

function mergeSettingsForWrite(existing = {}, incoming = {}) {
  // A senha do admin vem EXCLUSIVAMENTE de ADMIN_PASSWORD_HASH (ambiente).
  // Removemos adminPasswordHash/adminPasswordUpdatedAt de qualquer gravacao de settings,
  // purgando o hash legado do storage (Postgres/JSON) na proxima escrita e impedindo que
  // ele volte a ser persistido. O login nunca mais le esse campo.
  const { adminPasswordHash: _legacyIn, adminPasswordUpdatedAt: _legacyInAt, ...cleanIncoming } = incoming || {};
  return { ...cleanIncoming };
}

function mergeStudentContracts(existing = [], incoming = [], auth = {}) {
  // R-14: filtra PRIMEIRO os contratos do proprio aluno e SO DEPOIS mescla.
  // Contratos de outros alunos NUNCA entram neste resultado — a preservacao
  // deles fica a cargo do chamador, que concatena os contratos alheios intactos
  // antes de gravar (ver writeCollectionForAuth/CONTRACTS_KEY).
  const incomingById = new Map(incoming.filter((item) => item.studentId === auth.studentId).map((item) => [String(item.id || ""), item]));
  return existing.filter((contract) => contract.studentId === auth.studentId).map((contract) => {
    const next = incomingById.get(String(contract.id || ""));
    if (!next) return contract;
    const signed = next.status === "signed" || contract.status === "signed";
    return {
      ...contract,
      viewedAt: next.viewedAt || contract.viewedAt || "",
      status: signed ? "signed" : contract.status,
      signedAt: signed ? next.signedAt || contract.signedAt || new Date().toISOString() : contract.signedAt || "",
      signedVersion: signed ? contract.version || next.signedVersion || "" : contract.signedVersion || "",
      signerName: next.signerName || contract.signerName || "",
      signerCpf: next.signerCpf || contract.signerCpf || "",
      technicalId: next.technicalId || contract.technicalId || "",
      signatureIp: next.signatureIp || contract.signatureIp || "",
      signatureUserAgent: next.signatureUserAgent || contract.signatureUserAgent || "",
      signatureMeta: next.signatureMeta || contract.signatureMeta || ""
    };
  });
}

function mergeStudentMessages(existing = [], incoming = [], auth = {}) {
  const byId = new Map(existing.map((item) => [String(item.id || ""), item]));
  incoming
    .filter((item) => item.studentId === auth.studentId)
    .forEach((message) => {
      const id = String(message.id || "");
      const previous = byId.get(id);
      if (previous) {
        byId.set(id, { ...previous, readAt: message.readAt || previous.readAt || null });
        return;
      }
      if (message.senderRole === "student") {
        byId.set(id, {
          ...message,
          trainerId: TRAINER_ID,
          studentId: auth.studentId,
          senderRole: "student"
        });
      }
    });
  return Array.from(byId.values());
}

function mergeStudentOwnedCollection(existing = [], incoming = [], auth = {}) {
  const remaining = existing.filter((item) => item.studentId !== auth.studentId);
  const owned = incoming.filter((item) => item.studentId === auth.studentId);
  return [...remaining, ...owned];
}

async function writeAuditLog(action, entityType, entityId, auth) {
  try {
    if (!await isDatabaseReady()) return;
    await dbQuery(
      "insert into audit_logs (action, entity_type, entity_id, trainer_id, actor_id, actor_role) values ($1, $2, $3, $4, $5, $6)",
      [
        action,
        entityType,
        String(entityId || ""),
        auth.trainerId || TRAINER_ID,
        auth.studentId || auth.trainerId || "",
        auth.role || ""
      ]
    );
  } catch (_error) {
    // audit log failures are non-critical
  }
}

async function readCollectionForAuth(collection, auth) {
  if (!COLLECTION_ALLOWLIST.has(collection)) {
    const error = new Error("Colecao indisponivel.");
    error.statusCode = 404;
    throw error;
  }
  const fallback = collection === SETTINGS_KEY ? {} : [];
  const scope = getDataScope(auth);
  // PONTO CENTRAL DE LEITURA — filterByOwner é no-op enquanto scope.type==='global'
  const raw = filterByOwner(await readCollection(collection, fallback), scope, collection);
  return sanitizeCollection(collection, raw, auth);
}

async function writeCollectionForAuth(collection, payload, auth) {
  if (!COLLECTION_ALLOWLIST.has(collection)) {
    const error = new Error("Colecao indisponivel.");
    error.statusCode = 404;
    throw error;
  }

  const fallback = collection === SETTINGS_KEY ? {} : [];
  // MULTI-PERSONAL: trocar readCollection por splitByOwner e propagar otherItems em cada writeCollection abaixo
  const existing = await readCollection(collection, fallback);

  if (auth.role === "manager") {
    if (collection === STUDENTS_KEY) return writeCollection(collection, mergeStudentsForWrite(existing, Array.isArray(payload) ? payload : [], auth));
    if (collection === SETTINGS_KEY) return writeCollection(collection, mergeSettingsForWrite(existing, payload || {}));

    // OWNERSHIP (R-02, R-05, R-17): em colecoes com dono, os campos trainerId/studentId
    // do recurso vem do SERVIDOR (sessao). Em update preserva o dono ja gravado (ignora
    // tentativa de reatribuir treino/pagamento para outro studentId via corpo); em create
    // carimba o trainerId da sessao. Itens de outro dono (otherItems, escopo multi-personal)
    // sao preservados intactos e seus ids nao podem ser sequestrados.
    let writablePayload = payload;
    let otherItems = [];
    const isOwnerScopedArray = OWNER_SCOPED_COLLECTIONS.has(collection) && Array.isArray(payload);
    if (isOwnerScopedArray) {
      const split = splitByOwner(Array.isArray(existing) ? existing : [], getDataScope(auth), collection);
      otherItems = split.otherItems;
      const foreignIds = new Set(otherItems.map((item) => String(item.id || "")));
      writablePayload = enforceOwnerOnWrite(payload, split.ownerItems, auth, foreignIds);
    }
    const persist = isOwnerScopedArray ? [...otherItems, ...writablePayload] : payload;

    if (collection === WORKOUTS_KEY && Array.isArray(payload)) {
      const existingById = new Map((Array.isArray(existing) ? existing : []).map((w) => [w.id, w]));
      const newlyPublished = writablePayload.filter((w) => {
        const old = existingById.get(w.id);
        return w.status === "published" && w.studentId && (!old || old.status !== "published");
      });
      await writeCollection(collection, persist);
      for (const w of newlyPublished) {
        sendPushToStudent(w.studentId, {
          title: "Novo treino disponível!",
          body: `Seu treino "${w.title || "Treino"}" foi publicado.`,
          url: "/#workouts"
        }).catch(() => {});
      }
      return;
    }

    if (collection === ACTIVITIES_KEY && Array.isArray(payload)) {
      const existingIds = new Set((Array.isArray(existing) ? existing : []).map((a) => a.id));
      const newActivities = writablePayload.filter((a) => !existingIds.has(a.id) && a.studentId);
      await writeCollection(collection, persist);
      for (const a of newActivities) {
        sendPushToStudent(a.studentId, {
          title: "Nova atividade na agenda!",
          body: a.title || "O gestor adicionou uma atividade para você.",
          url: "/#agenda"
        }).catch(() => {});
      }
      return;
    }

    return writeCollection(collection, persist);
  }

  if ([EXERCISES_KEY, WORKOUTS_KEY, STUDENTS_KEY, SETTINGS_KEY, PAYMENTS_KEY, DIETS_KEY].includes(collection)) return;
  if (collection === CONTRACTS_KEY) {
    const existingArr = Array.isArray(existing) ? existing : [];
    const existingById = new Map(existingArr.map((c) => [String(c.id), c]));
    // mergeStudentContracts retorna SOMENTE os contratos do aluno (R-14).
    // Contratos de outros alunos sao preservados intactos: nunca passam pelo
    // merge, evitando vazamento e tambem perda dos dados alheios na gravacao.
    const ownMerged = mergeStudentContracts(existingArr, Array.isArray(payload) ? payload : [], auth);
    const foreign = existingArr.filter((c) => c.studentId !== auth.studentId);
    await writeCollection(collection, [...foreign, ...ownMerged]);
    const newlySigned = ownMerged.filter((c) => c.status === "signed" && existingById.get(String(c.id))?.status !== "signed");
    if (newlySigned.length) {
      const students = await readCollection(STUDENTS_KEY, []);
      const student = students.find((s) => s.id === auth.studentId);
      sendPushToManager({
        title: "Contrato assinado!",
        body: `${student?.name || "Um aluno"} assinou o contrato.`,
        url: "/#contracts"
      }).catch(() => {});
    }
    return;
  }
  if (collection === MESSAGES_KEY) return writeCollection(collection, mergeStudentMessages(existing, Array.isArray(payload) ? payload : [], auth));

  if (collection === UPDATES_KEY && Array.isArray(payload)) {
    const existingIds = new Set((Array.isArray(existing) ? existing : []).map((u) => u.id));
    const newUpdates = payload.filter((u) => u.studentId === auth.studentId && !existingIds.has(u.id));
    const merged = mergeStudentOwnedCollection(existing, payload, auth);
    await writeCollection(collection, merged);
    if (newUpdates.length) {
      const students = await readCollection(STUDENTS_KEY, []);
      const student = students.find((s) => s.id === auth.studentId);
      sendPushToManager({
        title: "Atualização de progresso!",
        body: `${student?.name || "Um aluno"} enviou uma atualização de progresso.`,
        url: "/#updates"
      }).catch(() => {});
    }
    return;
  }

  if ([ACTIVITIES_KEY, SESSIONS_KEY].includes(collection)) {
    return writeCollection(collection, mergeStudentOwnedCollection(existing, Array.isArray(payload) ? payload : [], auth));
  }
}

async function createAccountToken(account, ttlMs, type = "password_reset", extra = {}) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const reset = {
    id: createId(type === "student_invite" ? "invite" : "reset"),
    trainerId: TRAINER_ID,
    type,
    email: account.email,
    role: account.role,
    studentId: account.studentId || "",
    tokenHash: hashToken(token),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    usedAt: "",
    ...extra
  };

  const resets = await readCollection(PASSWORD_RESETS_KEY, []);
  const activeResets = resets.filter((item) => {
    if (item.expiresAt <= now.toISOString() || item.usedAt) return false;
    if (type === "student_invite" && item.type === "student_invite" && item.studentId === account.studentId) return false;
    if (type === "contract_view" && item.type === "contract_view" && item.contractId === extra.contractId) return false;
    if (type === "student_area_view" && item.type === "student_area_view" && item.studentId === account.studentId) return false;
    return true;
  });
  activeResets.push(reset);
  await writeCollection(PASSWORD_RESETS_KEY, activeResets);
  return { token, reset };
}

async function findAccountByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail === ADMIN_EMAIL) {
    return {
      role: "manager",
      email: ADMIN_EMAIL,
      name: "Admin",
      studentId: ""
    };
  }

  const students = await readCollection(STUDENTS_KEY, []);
  const student = students.find((item) => normalizeEmail(item.email) === normalizedEmail && item.status !== "inactive");
  if (!student) return null;
  return {
    role: "student",
    email: normalizedEmail,
    name: student.name || "Aluno",
    studentId: student.id || ""
  };
}

async function updateAccountPassword(reset, password) {
  if (reset.role === "manager") {
    // DESATIVADO nesta fase: a senha do admin vem EXCLUSIVAMENTE de ADMIN_PASSWORD_HASH
    // (ambiente). Trocar a senha pela UI nao teria efeito no login, entao recusamos de
    // forma explicita em vez de fingir que trocou (nao deixar botao que mente).
    // TODO(lancamento): transformar isto no fluxo de PRIMEIRO ACESSO do gestor, gravando
    // a senha em um storage proprio e tornando-o a fonte de verdade do login do admin.
    const error = new Error(
      "Troca de senha do gestor indisponivel: a senha do admin e definida por ADMIN_PASSWORD_HASH no ambiente."
    );
    error.statusCode = 409;
    throw error;
  }

  const students = await readCollection(STUDENTS_KEY, []);
  const index = students.findIndex((item) => item.id === reset.studentId || normalizeEmail(item.email) === reset.email);
  if (index < 0) {
    const error = new Error("Conta nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  students[index] = {
    ...students[index],
    passwordHash: createPasswordHash(password),
    accessStatus: "active",
    inviteAcceptedAt: reset.type === "student_invite" ? new Date().toISOString() : students[index].inviteAcceptedAt || "",
    passwordUpdatedAt: new Date().toISOString()
  };
  await writeCollection(STUDENTS_KEY, students);
}

function createApiRouter() {
  const router = express.Router();

  router.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  router.get("/health/detail", requireManager, async (_request, response) => {
    const dbReady = await isDatabaseReady();
    response.json({
      ok: true,
      storage: dbReady ? "postgres" : storageDriver === "postgres" ? "postgres-unavailable" : "json",
      databaseReady: dbReady,
      realtime: true,
      mailConfigured: isMailConfigured(),
      pushConfigured: Boolean(getVapidPublicKey())
    });
  });

  router.get("/push/vapid-public-key", (_request, response) => {
    const key = getVapidPublicKey();
    if (!key) {
      response.status(503).json({ error: "Push nao configurado no servidor." });
      return;
    }
    response.json({ ok: true, publicKey: key });
  });

  router.post("/push/subscribe", requireAuth, async (request, response, next) => {
    try {
      const { endpoint, keys } = request.body || {};
      if (!endpoint || typeof endpoint !== "string" || !keys?.p256dh || typeof keys.p256dh !== "string" || !keys?.auth || typeof keys.auth !== "string") {
        response.status(400).json({ error: "Subscription invalida." });
        return;
      }
      if (!withinLen(endpoint, 2048) || !withinLen(keys.p256dh, 500) || !withinLen(keys.auth, 500)) {
        response.status(400).json({ error: "Campos fora do tamanho permitido." });
        return;
      }
      await savePushSubscription({
        endpoint,
        keys,
        userId: request.auth.studentId || request.auth.trainerId || "",
        role: request.auth.role,
        studentId: request.auth.studentId || ""
      });
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/push/subscribe", requireAuth, async (request, response, next) => {
    try {
      const { endpoint } = request.body || {};
      if (endpoint && (typeof endpoint !== "string" || !withinLen(endpoint, 2048))) {
        response.status(400).json({ error: "Endpoint invalido." });
        return;
      }
      if (endpoint) await removePushSubscriptionByEndpoint(endpoint);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/login", authRateLimiter, async (request, response, next) => {
    try {
      const email = normalizeEmail(request.body?.email);
      const password = String(request.body?.password || "");
      if (!email || !password) {
        response.status(400).json({ error: "Informe e-mail e senha." });
        return;
      }
      if (!isValidEmail(email)) {
        response.status(400).json({ error: "Formato de e-mail invalido." });
        return;
      }
      if (!withinLen(password, 128)) {
        response.status(400).json({ error: "Senha muito longa." });
        return;
      }

      if (email === ADMIN_EMAIL) {
        // Senha do admin: FONTE UNICA DE VERDADE = ADMIN_PASSWORD_HASH (ambiente).
        // NUNCA ler settings.adminPasswordHash aqui: um hash legado persistido no banco
        // (ex.: o antigo "Admin@2026") deve ser totalmente inerte e jamais autorizar login.
        const storedHash = resolveAdminPasswordHash();
        if (!storedHash || !verifyPassword(password, storedHash)) {
          response.status(401).json({ error: "E-mail ou senha invalidos." });
          return;
        }

        const settings = await readCollection(SETTINGS_KEY, {});
        const user = {
          role: "manager",
          name: settings.trainerName || "Gestor Elite AS",
          email,
          trainerId: TRAINER_ID
        };
        response.json({ ok: true, token: createSessionToken(user), expiresIn: SESSION_TTL, user });
        return;
      }

      const students = await readCollection(STUDENTS_KEY, []);
      const student = students.find((item) => normalizeEmail(item.email) === email && item.status !== "inactive");
      if (!student || !verifyPassword(password, student.passwordHash)) {
        response.status(401).json({ error: "E-mail ou senha invalidos." });
        return;
      }

      const hasPassword = Boolean(student.passwordHash);
      const accessStatus = normalizeStudentAccessStatus(student.accessStatus, hasPassword);
      if (accessStatus !== "active" || !hasPassword) {
        response.status(403).json({ error: "Acesso ainda nao ativado. Use o link de convite para criar sua senha." });
        return;
      }

      const user = {
        role: "student",
        name: student.name || "Aluno",
        email,
        trainerId: student.trainerId || TRAINER_ID,
        studentId: student.id || ""
      };
      response.json({ ok: true, token: createSessionToken(user), expiresIn: SESSION_TTL, user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/forgot-password", authRateLimiter, async (request, response, next) => {
    try {
      const email = normalizeEmail(request.body?.email);
      if (!email) {
        response.status(400).json({ error: "Informe o e-mail da conta." });
        return;
      }
      if (!isValidEmail(email)) {
        response.status(400).json({ error: "Formato de e-mail invalido." });
        return;
      }

      const account = await findAccountByEmail(email);
      if (!account) {
        response.status(404).json({ error: "Esse e-mail ainda nao tem uma conta cadastrada." });
        return;
      }

      if (!isMailConfigured()) {
        response.status(503).json({ error: "Envio de e-mail ainda nao configurado no servidor." });
        return;
      }

      const { token } = await createAccountToken(account, PASSWORD_RESET_TTL_MS, "password_reset");
      const resetUrl = buildResetUrl(request, token);
      await sendPasswordResetEmail({
        to: account.email,
        name: account.name,
        resetUrl
      });

      response.json({ ok: true, message: "Link de redefinicao enviado por e-mail." });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/student-invite", requireManager, async (request, response, next) => {
    try {
      const studentId = String(request.body?.studentId || "");
      const email = normalizeEmail(request.body?.email);
      if (!studentId && !email) {
        response.status(400).json({ error: "Informe studentId ou e-mail do aluno." });
        return;
      }
      if (email && !isValidEmail(email)) {
        response.status(400).json({ error: "Formato de e-mail invalido." });
        return;
      }
      if (!withinLen(studentId, 100) || !withinLen(email, 254)) {
        response.status(400).json({ error: "Campos fora do tamanho permitido." });
        return;
      }
      const students = await readCollection(STUDENTS_KEY, []);
      const index = students.findIndex((item) => (studentId && item.id === studentId) || (email && normalizeEmail(item.email) === email));
      if (index < 0) {
        response.status(404).json({ error: "Aluno nao encontrado." });
        return;
      }

      const student = students[index];
      if (student.status === "inactive") {
        response.status(400).json({ error: "Aluno inativo. Ative o cadastro antes de enviar convite." });
        return;
      }

      const account = {
        role: "student",
        email: normalizeEmail(student.email),
        name: student.name || "Aluno",
        studentId: student.id || ""
      };
      if (!account.email) {
        response.status(400).json({ error: "Aluno sem e-mail cadastrado." });
        return;
      }

      const { token, reset } = await createAccountToken(account, STUDENT_INVITE_TTL_MS, "student_invite");
      const inviteUrl = buildResetUrl(request, token);
      const now = new Date().toISOString();
      students[index] = {
        ...student,
        accessStatus: student.passwordHash ? "active" : "invite_pending",
        inviteSentAt: now,
        inviteExpiresAt: reset.expiresAt
      };
      await writeCollection(STUDENTS_KEY, students);

      const mailConfigured = isMailConfigured();
      if (mailConfigured) {
        await sendStudentInviteEmail({
          to: account.email,
          name: account.name,
          inviteUrl
        });
      }

      response.json({
        ok: true,
        mailConfigured,
        inviteUrl: mailConfigured ? "" : inviteUrl,
        expiresAt: reset.expiresAt,
        student: {
          ...students[index],
          passwordHash: students[index].passwordHash ? "[hash]" : ""
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/contract-link", requireManager, async (request, response, next) => {
    try {
      const contractId = String(request.body?.contractId || "");
      if (!contractId) {
        response.status(400).json({ error: "Informe o contractId." });
        return;
      }
      if (!withinLen(contractId, 100) || !withinLen(request.body?.subject, 500) || !withinLen(request.body?.message, 5000) || !withinLen(request.body?.signature, 1000)) {
        response.status(400).json({ error: "Campos fora do tamanho permitido." });
        return;
      }
      const contracts = await readCollection(CONTRACTS_KEY, []);
      const contractIndex = contracts.findIndex((item) => item.id === contractId && item.status !== "canceled");
      if (contractIndex < 0) {
        response.status(404).json({ error: "Contrato nao encontrado." });
        return;
      }

      const contract = contracts[contractIndex];
      if (contract.status === "signed") {
        response.status(400).json({ error: "Contrato ja assinado." });
        return;
      }

      const students = await readCollection(STUDENTS_KEY, []);
      const student = students.find((item) => item.id === contract.studentId && item.status !== "inactive");
      if (!student || !student.email) {
        response.status(400).json({ error: "Aluno sem e-mail ativo." });
        return;
      }

      const account = {
        role: "student",
        email: normalizeEmail(student.email),
        name: student.name || "Aluno",
        studentId: student.id || ""
      };
      const { token, reset } = await createAccountToken(account, CONTRACT_LINK_TTL_MS, "contract_view", { contractId: contract.id });
      const contractUrl = buildContractUrl(request, token);
      const subject = String(request.body?.subject || "").replace(/\{link_contrato\}/g, contractUrl);
      const message = String(request.body?.message || "").replace(/\{link_contrato\}/g, contractUrl);
      const signature = String(request.body?.signature || "").replace(/\{link_contrato\}/g, contractUrl);
      const mailConfigured = isMailConfigured();
      if (mailConfigured) {
        await sendContractEmail({
          to: account.email,
          name: account.name,
          contractUrl,
          subject,
          message,
          signature
        });
      }

      contracts[contractIndex] = {
        ...contract,
        emailSentAt: mailConfigured ? new Date().toISOString() : contract.emailSentAt || "",
        linkSentAt: new Date().toISOString(),
        contractLinkExpiresAt: reset.expiresAt
      };
      await writeCollection(CONTRACTS_KEY, contracts);

      response.json({
        ok: true,
        mailConfigured,
        contractUrl: mailConfigured ? "" : contractUrl,
        expiresAt: reset.expiresAt
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/contract-token", async (request, response, next) => {
    try {
      const token = String(request.body?.token || "");
      if (!token || !withinLen(token, 128)) {
        response.status(400).json({ error: "Link invalido ou expirado." });
        return;
      }
      const tokenHash = hashToken(token);
      const resets = await readCollection(PASSWORD_RESETS_KEY, []);
      const now = new Date().toISOString();
      const reset = resets.find((item) => item.type === "contract_view" && item.tokenHash === tokenHash && !item.usedAt && item.expiresAt > now);
      if (!reset?.contractId) {
        response.status(400).json({ error: "Link invalido ou expirado." });
        return;
      }

      const contracts = await readCollection(CONTRACTS_KEY, []);
      const contract = contracts.find((item) => item.id === reset.contractId && item.studentId === reset.studentId && item.status !== "canceled");
      if (!contract) {
        response.status(404).json({ error: "Contrato nao encontrado." });
        return;
      }

      response.json({
        ok: true,
        studentId: reset.studentId,
        contractId: reset.contractId,
        email: reset.email
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/student-area-link", requireManager, async (request, response, next) => {
    try {
      const studentId = String(request.body?.studentId || "");
      if (!studentId || !withinLen(studentId, 100)) {
        response.status(400).json({ error: "Informe um studentId valido." });
        return;
      }
      const students = await readCollection(STUDENTS_KEY, []);
      const student = students.find((item) => item.id === studentId && item.status !== "inactive");
      if (!student) {
        response.status(404).json({ error: "Aluno nao encontrado." });
        return;
      }
      const account = {
        role: "student",
        email: normalizeEmail(student.email),
        name: student.name || "Aluno",
        studentId: student.id || ""
      };
      const { token } = await createAccountToken(account, STUDENT_AREA_LINK_TTL_MS, "student_area_view");
      const areaUrl = buildStudentAreaUrl(request, token);
      response.json({ ok: true, url: areaUrl });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/student-area-view", async (request, response, next) => {
    try {
      const token = String(request.body?.token || "");
      if (!token || !withinLen(token, 128)) {
        response.status(400).json({ error: "Token nao informado." });
        return;
      }
      const tokenHash = hashToken(token);
      const resets = await readCollection(PASSWORD_RESETS_KEY, []);
      const now = new Date().toISOString();
      const reset = resets.find(
        (item) => item.type === "student_area_view" && item.tokenHash === tokenHash && !item.usedAt && item.expiresAt > now
      );
      if (!reset?.studentId) {
        response.status(400).json({ error: "Link invalido ou expirado." });
        return;
      }

      const [students, workouts, exercises, diets, updates, sessions] = await Promise.all([
        readCollection(STUDENTS_KEY, []),
        readCollection(WORKOUTS_KEY, []),
        readCollection(EXERCISES_KEY, []),
        readCollection(DIETS_KEY, []),
        readCollection(UPDATES_KEY, []),
        readCollection(SESSIONS_KEY, [])
      ]);

      const student = students.find((item) => item.id === reset.studentId);
      if (!student || student.status === "inactive") {
        response.status(404).json({ error: "Aluno nao encontrado." });
        return;
      }

      const { passwordHash, ...safeStudent } = student;

      const studentWorkouts = workouts
        .filter((w) => w.studentId === reset.studentId && w.status === "published")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

      const activeExercises = exercises.filter((e) => e.status !== "inactive");

      const studentDiets = diets
        .filter((d) => d.studentId === reset.studentId)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

      const studentUpdates = updates
        .filter((u) => u.studentId === reset.studentId)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

      const studentSessions = sessions
        .filter((s) => s.studentId === reset.studentId && s.status === "completed")
        .sort((a, b) => new Date(b.finishedAt || b.createdAt || 0) - new Date(a.finishedAt || a.createdAt || 0))
        .slice(0, 5);

      response.json({
        ok: true,
        student: safeStudent,
        workouts: studentWorkouts,
        exercises: activeExercises,
        diets: studentDiets,
        updates: studentUpdates,
        sessions: studentSessions
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/contract-signature-meta", requireAuth, async (request, response, next) => {
    try {
      const contractId = String(request.body?.contractId || "");
      const studentId = String(request.body?.studentId || "");
      if (!withinLen(contractId, 100) || !withinLen(studentId, 100)) {
        response.status(400).json({ error: "Campos fora do tamanho permitido." });
        return;
      }
      response.json({
        ok: true,
        contractId,
        studentId,
        ip: request.ip || request.headers["x-forwarded-for"] || "",
        userAgent: request.get("user-agent") || "",
        acceptedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/reset-password", authRateLimiter, async (request, response, next) => {
    try {
      const token = String(request.body?.token || "");
      const password = String(request.body?.password || "");
      if (!token || password.length < 8) {
        response.status(400).json({ error: "Informe um link valido e uma senha com pelo menos 8 caracteres." });
        return;
      }
      if (!withinLen(token, 128) || !withinLen(password, 128)) {
        response.status(400).json({ error: "Campos fora do tamanho permitido." });
        return;
      }

      const tokenHash = hashToken(token);
      const resets = await readCollection(PASSWORD_RESETS_KEY, []);
      const now = new Date().toISOString();
      const resetIndex = resets.findIndex((item) => item.tokenHash === tokenHash && !item.usedAt && item.expiresAt > now);
      if (resetIndex < 0) {
        response.status(400).json({ error: "Link invalido ou expirado. Solicite um novo link." });
        return;
      }

      const reset = resets[resetIndex];
      await updateAccountPassword(reset, password);
      resets[resetIndex] = {
        ...reset,
        usedAt: now
      };
      await writeCollection(PASSWORD_RESETS_KEY, resets);

      response.json({ ok: true, role: reset.role, email: reset.email, type: reset.type || "password_reset" });
    } catch (error) {
      next(error);
    }
  });

  router.get("/collections/:collection", requireAuth, async (request, response, next) => {
    try {
      response.json(await readCollectionForAuth(request.params.collection, request.auth));
    } catch (error) {
      next(error);
    }
  });

  router.put("/collections/:collection", requireAuth, async (request, response, next) => {
    try {
      if (request.body !== null && request.body !== undefined && typeof request.body !== "object") {
        response.status(400).json({ error: "Payload invalido: esperado objeto ou array JSON." });
        return;
      }
      await writeCollectionForAuth(request.params.collection, request.body, request.auth);
      await writeAuditLog("update", "collection", request.params.collection, request.auth);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/collections/:collection/:id", requireAuth, async (request, response, next) => {
    try {
      const { collection, id } = request.params;
      if (!id || !withinLen(id, 100)) {
        response.status(400).json({ error: "ID invalido." });
        return;
      }
      if (!COLLECTION_ALLOWLIST.has(collection)) {
        response.status(404).json({ error: "Colecao indisponivel." });
        return;
      }
      if (collection === STUDENTS_KEY && request.auth.role !== "manager") {
        response.status(403).json({ error: "Acesso negado." });
        return;
      }
      // PONTO CENTRAL DE LEITURA — splitByOwner isola itens do dono; otherItems=[]) enquanto escopo global
      const scope = getDataScope(request.auth);
      const { ownerItems: existing, otherItems } = splitByOwner(await readCollection(collection, []), scope, collection);
      if (!Array.isArray(existing)) {
        response.status(400).json({ error: "Operacao nao suportada para essa colecao." });
        return;
      }
      // OWNERSHIP (R-19, vetor mais destrutivo): antes de deletar, carregar o recurso-alvo e
      // exigir pertencimento. assertOwnership lanca 404 (inexistente) ou 403 (recurso de outro dono).
      // Aluno so deleta o proprio; manager so do proprio trainer. EXERCISES_KEY e biblioteca
      // compartilhada (sem dono) e permanece fora do ownership.
      if (OWNER_SCOPED_COLLECTIONS.has(collection)) {
        const target = existing.find((item) => String(item.id || "") === String(id));
        assertOwnership(target, request.auth);
      }
      const updated = existing.filter((item) => String(item.id || "") !== String(id));
      await writeCollection(collection, [...otherItems, ...updated]);
      await writeAuditLog("delete", "collection", id, request.auth);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.get("/profile", requireAuth, async (request, response, next) => {
    try {
      const auth = request.auth;
      if (auth.role === "manager") {
        const settings = await readCollection(SETTINGS_KEY, {});
        response.json({
          name: settings.trainerName || "",
          phone: settings.trainerPhone || "",
          email: settings.contactEmail || "",
          photoUrl: settings.trainerPhotoUrl || ""
        });
      } else if (auth.role === "student") {
        const students = await readCollection(STUDENTS_KEY, []);
        const student = students.find((s) => s.id === auth.studentId);
        if (!student) { response.status(404).json({ error: "Aluno não encontrado." }); return; }
        response.json({ name: student.name || "", phone: student.phone || "", email: student.email || "", photoUrl: student.photoUrl || "" });
      } else {
        response.status(403).json({ error: "Acesso negado." });
      }
    } catch (error) {
      next(error);
    }
  });

  router.put("/profile", requireAuth, async (request, response, next) => {
    try {
      const auth = request.auth;
      const body = request.body || {};
      if (body.name !== undefined && !withinLen(body.name, 120)) {
        response.status(400).json({ error: "Nome fora do tamanho permitido (max 120)." });
        return;
      }
      if (body.phone !== undefined && !withinLen(body.phone, 30)) {
        response.status(400).json({ error: "Telefone fora do tamanho permitido (max 30)." });
        return;
      }
      if (body.email !== undefined) {
        const normalizedProfileEmail = normalizeEmail(body.email);
        if (normalizedProfileEmail && !isValidEmail(normalizedProfileEmail)) {
          response.status(400).json({ error: "Formato de e-mail invalido." });
          return;
        }
        if (!withinLen(normalizedProfileEmail, 254)) {
          response.status(400).json({ error: "E-mail fora do tamanho permitido." });
          return;
        }
      }
      if (auth.role === "manager") {
        const settings = await readCollection(SETTINGS_KEY, {});
        const updated = { ...settings };
        if (body.name !== undefined) updated.trainerName = String(body.name || "").trim();
        if (body.phone !== undefined) updated.trainerPhone = String(body.phone || "").trim();
        if (body.email !== undefined) updated.contactEmail = String(body.email || "").trim();
        await writeCollection(SETTINGS_KEY, updated);
        response.json({ ok: true });
      } else if (auth.role === "student") {
        const students = await readCollection(STUDENTS_KEY, []);
        const idx = students.findIndex((s) => s.id === auth.studentId);
        if (idx < 0) { response.status(404).json({ error: "Aluno não encontrado." }); return; }
        if (body.phone !== undefined) students[idx] = { ...students[idx], phone: String(body.phone || "").trim() };
        await writeCollection(STUDENTS_KEY, students);
        response.json({ ok: true });
      } else {
        response.status(403).json({ error: "Acesso negado." });
      }
    } catch (error) {
      next(error);
    }
  });

  router.get("/:collection", requireAuth, async (request, response, next) => {
    try {
      response.json(await readCollectionForAuth(request.params.collection, request.auth));
    } catch (error) {
      next(error);
    }
  });

  router.put("/:collection", requireAuth, async (request, response, next) => {
    try {
      await writeCollectionForAuth(request.params.collection, request.body, request.auth);
      await writeAuditLog("update", "collection", request.params.collection, request.auth);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createApiRouter,
  mergeStudentContracts
};
