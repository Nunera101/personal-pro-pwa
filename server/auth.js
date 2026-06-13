const jwt = require("jsonwebtoken");
const { jwtSecret: JWT_SECRET } = require("./config");

const TRAINER_ID = "trainer-demo";
const SESSION_TTL = process.env.SESSION_TTL || "12h";

function createSessionToken(account = {}) {
  return jwt.sign(
    {
      role: account.role,
      email: account.email || "",
      trainerId: account.trainerId || TRAINER_ID,
      studentId: account.studentId || ""
    },
    JWT_SECRET,
    {
      expiresIn: SESSION_TTL,
      issuer: "elite-as"
    }
  );
}

function verifySessionToken(token) {
  try {
    return jwt.verify(String(token || ""), JWT_SECRET, { issuer: "elite-as" });
  } catch (_error) {
    return null;
  }
}

function bearerToken(request) {
  const header = String(request.headers.authorization || "");
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

function requireAuth(request, response, next) {
  const session = verifySessionToken(bearerToken(request));
  if (!session) {
    response.status(401).json({ error: "Sessao expirada ou ausente. Entre novamente." });
    return;
  }
  request.auth = session;
  next();
}

function requireManager(request, response, next) {
  requireAuth(request, response, () => {
    if (request.auth.role !== "manager") {
      response.status(403).json({ error: "Acesso restrito ao gestor." });
      return;
    }
    next();
  });
}

module.exports = {
  TRAINER_ID,
  SESSION_TTL,
  createSessionToken,
  verifySessionToken,
  requireAuth,
  requireManager
};
