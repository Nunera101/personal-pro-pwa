const nodemailer = require("nodemailer");
const { mailFrom, smtp } = require("./config");

function isMailConfigured() {
  return Boolean(mailFrom && smtp.host && smtp.user && smtp.pass);
}

function createTransport() {
  if (!isMailConfigured()) {
    const error = new Error("Envio de e-mail não configurado.");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const transport = createTransport();
  const displayName = name || "usuário";
  await transport.sendMail({
    from: mailFrom,
    to,
    subject: "Redefinição de senha - Personal Pro App",
    text: [
      `Olá, ${displayName}.`,
      "",
      "Recebemos uma solicitação para redefinir sua senha no Personal Pro App.",
      "Acesse o link abaixo para criar uma nova senha:",
      resetUrl,
      "",
      "Este link expira em 1 hora. Se você não solicitou essa alteração, ignore este e-mail."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#12211f;max-width:560px">
        <h2 style="margin:0 0 12px;color:#0b6b57">Redefinir senha</h2>
        <p>Olá, ${escapeHtml(displayName)}.</p>
        <p>Recebemos uma solicitação para redefinir sua senha no <strong>Personal Pro App</strong>.</p>
        <p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#0b6b57;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Criar nova senha</a></p>
        <p style="font-size:13px;color:#66736f">Este link expira em 1 hora. Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `
  });
}

async function sendStudentInviteEmail({ to, name, inviteUrl }) {
  const transport = createTransport();
  const displayName = name || "aluno";
  await transport.sendMail({
    from: mailFrom,
    to,
    subject: "Crie sua senha - Personal Pro App",
    text: [
      `Olá, ${displayName}.`,
      "",
      "Seu acesso ao Personal Pro App foi preparado pelo personal.",
      "Acesse o link abaixo para criar sua senha com segurança:",
      inviteUrl,
      "",
      "Este link expira em 7 dias. O personal não consegue visualizar sua senha."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#12211f;max-width:560px">
        <h2 style="margin:0 0 12px;color:#0b6b57">Crie sua senha</h2>
        <p>Olá, ${escapeHtml(displayName)}.</p>
        <p>Seu acesso ao <strong>Personal Pro App</strong> foi preparado pelo personal.</p>
        <p><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;background:#0b6b57;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Criar minha senha</a></p>
        <p style="font-size:13px;color:#66736f">Este link expira em 7 dias. O personal não consegue visualizar sua senha.</p>
      </div>
    `
  });
}

async function sendContractEmail({ to, name, contractUrl, subject, message, signature }) {
  const transport = createTransport();
  const displayName = name || "aluno";
  const emailSubject = subject || "Contrato para aceite - Personal Pro App";
  const emailMessage = message || `Olá, ${displayName}. Seu contrato está pronto para aceite interno.`;
  const emailSignature = signature || "Equipe Personal Pro";
  await transport.sendMail({
    from: mailFrom,
    to,
    subject: emailSubject,
    text: [emailMessage, "", contractUrl, "", emailSignature].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#12211f;max-width:560px">
        <h2 style="margin:0 0 12px;color:#0b6b57">Contrato para aceite</h2>
        <p>${escapeHtml(emailMessage)}</p>
        <p><a href="${escapeHtml(contractUrl)}" style="display:inline-block;background:#0b6b57;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Abrir contrato</a></p>
        <p style="font-size:13px;color:#66736f">${escapeHtml(emailSignature)}</p>
      </div>
    `
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = {
  isMailConfigured,
  sendPasswordResetEmail,
  sendStudentInviteEmail,
  sendContractEmail
};
