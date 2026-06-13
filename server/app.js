const express = require("express");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { rootDir, uploadDir } = require("./config");
const { createApiRouter } = require("./routes/api");
const { createUploadRouter } = require("./routes/uploads");
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
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use("/uploads", express.static(path.join(rootDir, "uploads")));
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
