const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { rootDir, uploadDir } = require("./config");
const { createApiRouter } = require("./routes/api");
const { createUploadRouter, createUploadsAssetRouter } = require("./routes/uploads");
const { createVideosRouter } = require("./routes/videos");
const { configureRealtime } = require("./realtime");
const { initWebPush } = require("./push");

function createServer() {
  fs.mkdirSync(uploadDir, { recursive: true });
  initWebPush();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.disable("x-powered-by");

  // Cabeçalhos de segurança (A3): CSP, HSTS, X-Frame-Options e nosniff via helmet.
  // A CSP é montada a partir do que o app realmente usa: scripts/estilos inline,
  // jsPDF via cdnjs, cliente Socket.IO + API no backend (self ou Railway),
  // embeds do YouTube e mídias data:/blob:. Se algo for bloqueado, ajustar a
  // lista de origens — nunca desligar a CSP.
  const RAILWAY_ORIGIN = "https://personal-pro-pwa-production.up.railway.app";
  const RAILWAY_WSS = "wss://personal-pro-pwa-production.up.railway.app";
  const JSPDF_CDN = "https://cdnjs.cloudflare.com";
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          // 'unsafe-inline' cobre os handlers inline (onclick/onload) e o
          // <script> inline de acesso.html; cdnjs serve o jsPDF e o backend
          // serve o cliente socket.io.js.
          "script-src": ["'self'", "'unsafe-inline'", JSPDF_CDN, RAILWAY_ORIGIN],
          // Handlers inline em atributos (onclick, e o onload="this.media='all'"
          // que ativa cada folha de estilo carregada como media="print"). Sem
          // isto o padrão do helmet (script-src-attr 'none') deixaria o app sem
          // estilo.
          "script-src-attr": ["'unsafe-inline'"],
          // Estilos inline (<style> e atributos style) usados em todo o app.
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "blob:", RAILWAY_ORIGIN],
          "font-src": ["'self'", "data:"],
          // Fetch da API + transporte do Socket.IO (https/wss), self e Railway.
          "connect-src": ["'self'", RAILWAY_ORIGIN, RAILWAY_WSS],
          // Vídeos/contratos servidos como blob:/data: ou pelo backend.
          "media-src": ["'self'", "data:", "blob:", RAILWAY_ORIGIN],
          // Embeds de vídeo de exercício.
          "frame-src": ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
          "worker-src": ["'self'", "blob:"],
          "manifest-src": ["'self'"],
          "object-src": ["'none'"],
          "base-uri": ["'self'"],
          "form-action": ["'self'"],
          // Anti-clickjacking: ninguém pode enquadrar o app.
          "frame-ancestors": ["'none'"],
          // Mantém apenas em https quando servido sob TLS (Railway).
          "upgrade-insecure-requests": []
        }
      },
      // HSTS: força https por 1 ano, incluindo subdomínios.
      hsts: { maxAge: 31536000, includeSubDomains: true },
      // X-Frame-Options: DENY (reforça frame-ancestors 'none').
      frameguard: { action: "deny" },
      // X-Content-Type-Options: nosniff já vem habilitado por padrão.
      // COEP desligado para não quebrar o carregamento do jsPDF/YouTube.
      crossOriginEmbedderPolicy: false,
      // Frontend pode estar em outra origem (ex.: GitHub Pages) consumindo a API.
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // /uploads NÃO é mais estático público: contratos e fotos de perfil passam
  // por rota autenticada com verificação de ownership (C3). Vídeos de exercício
  // seguem servidos estaticamente dentro do próprio router.
  app.use("/uploads", createUploadsAssetRouter());
  app.use("/api/uploads", createUploadRouter());
  app.use("/api/videos", createVideosRouter());
  app.use("/api", createApiRouter());

  configureRealtime(io);

  app.get("/acesso", (_request, response) => {
    response.sendFile(path.join(rootDir, "acesso.html"));
  });

  app.use(
    express.static(rootDir, {
      setHeaders(response, filePath) {
        if (filePath.endsWith("sw.js")) {
          response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        if (filePath.endsWith("index.html") || filePath.endsWith("app.js") || filePath.endsWith("styles.css")) {
          response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        if (filePath.endsWith("manifest.json")) {
          response.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
          response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      }
    })
  );

  app.get("*", (_request, response) => {
    response.sendFile(path.join(rootDir, "index.html"));
  });

  app.use((error, _request, response, _next) => {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(413).json({ error: "Arquivo muito grande. Verifique o limite de tamanho permitido para este tipo de envio." });
      return;
    }
    if (error.type === "entity.too.large") {
      response.status(413).json({ error: "Requisição muito grande para o servidor processar." });
      return;
    }
    const status = Number(error.status || error.statusCode || 500);
    response.status(status).json({
      error: status >= 500 ? "Erro interno do servidor." : error.message
    });
  });

  return { app, server, io };
}

module.exports = {
  createServer
};
