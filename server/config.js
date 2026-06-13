const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "uploads", "exercises");
const contractUploadDir = path.join(rootDir, "uploads", "contracts");
const profileUploadDir = path.join(rootDir, "uploads", "profiles");
const smtpPort = Number(process.env.SMTP_PORT || 587);

// Segredo do JWT — obrigatório e estável entre reinícios/deploys.
// Em produção, exige JWT_SECRET (ou SESSION_SECRET) do ambiente.
// Em dev, usa um segredo fixo (NUNCA aleatório) avisando no console,
// para não invalidar sessões a cada restart.
const DEV_JWT_SECRET = "personal-pro-local-dev-secret";
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET || process.env.SESSION_SECRET || "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET ausente: defina a variável de ambiente JWT_SECRET (segredo estável) antes de iniciar em produção."
    );
  }
  console.warn(
    "[seguranca] JWT_SECRET não definido — usando segredo fixo APENAS para desenvolvimento. Defina JWT_SECRET antes de produção."
  );
  return DEV_JWT_SECRET;
}

module.exports = {
  rootDir,
  dataDir,
  uploadDir,
  contractUploadDir,
  profileUploadDir,
  storageDriver: process.env.STORAGE_DRIVER || (process.env.DATABASE_URL ? "postgres" : "json"),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: resolveJwtSecret(),
  appPublicUrl: process.env.APP_PUBLIC_URL || "https://nunera101.github.io/personal-pro-pwa/",
  mailFrom: process.env.MAIL_FROM || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: smtpPort,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
};
