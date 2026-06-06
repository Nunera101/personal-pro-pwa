const { isDatabaseReady, query } = require("./db");
const { readCollection, writeCollection } = require("./storage/collections");
const { TRAINER_ID, verifySessionToken } = require("./auth");

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMessage(input = {}) {
  return {
    id: String(input.id || createId("message")),
    trainerId: String(input.trainerId || TRAINER_ID),
    studentId: String(input.studentId || ""),
    senderRole: input.senderRole === "student" ? "student" : "manager",
    body: String(input.body || "").trim(),
    createdAt: input.createdAt || new Date().toISOString(),
    readAt: input.readAt || null
  };
}

async function saveMessage(message) {
  if (await isDatabaseReady()) {
    await query(
      `
        insert into messages (id, trainer_id, student_id, sender_role, body, created_at, read_at)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do nothing
      `,
      [
        message.id,
        message.trainerId,
        message.studentId,
        message.senderRole,
        message.body,
        message.createdAt,
        message.readAt
      ]
    );
    return;
  }

  const messages = await readCollection("personal-pro-messages-v1", []);
  if (!messages.some((item) => item.id === message.id)) {
    messages.push(message);
    await writeCollection("personal-pro-messages-v1", messages);
  }
}

function configureRealtime(io) {
  io.on("connection", (socket) => {
    const session = verifySessionToken(socket.handshake.auth?.token || socket.handshake.query?.token || "");
    if (!session) {
      socket.disconnect(true);
      return;
    }

    socket.join(`trainer:${session.trainerId || TRAINER_ID}`);
    if (session.role === "student" && session.studentId) socket.join(`student:${session.studentId}`);

    socket.on("join", (payload = {}) => {
      const trainerId = String(session.trainerId || TRAINER_ID);
      const studentId = session.role === "student" ? String(session.studentId || "") : String(payload.studentId || "");
      socket.join(`trainer:${trainerId}`);
      if (studentId) socket.join(`student:${studentId}`);
    });

    socket.on("message:send", async (payload = {}, callback) => {
      try {
        const message = normalizeMessage({
          ...payload,
          trainerId: session.trainerId || TRAINER_ID,
          studentId: session.role === "student" ? session.studentId : payload.studentId,
          senderRole: session.role === "student" ? "student" : "manager"
        });
        if (!message.studentId || !message.body) {
          if (callback) callback({ ok: false, error: "Mensagem incompleta." });
          return;
        }

        await saveMessage(message);
        io.to(`trainer:${message.trainerId}`).to(`student:${message.studentId}`).emit("message:new", message);
        if (callback) callback({ ok: true, message });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  });
}

module.exports = {
  configureRealtime
};
