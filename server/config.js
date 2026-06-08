const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "uploads", "exercises");
const contractUploadDir = path.join(rootDir, "uploads", "contracts");
const smtpPort = Number(process.env.SMTP_PORT || 587);

module.exports = {
  rootDir,
  dataDir,
  uploadDir,
  contractUploadDir,
  storageDriver: process.env.STORAGE_DRIVER || (process.env.DATABASE_URL ? "postgres" : "json"),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "personal-pro-local-dev-secret",
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
