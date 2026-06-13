// Teste de USO UNICO de tokens (A1): findActiveSingleUseToken.
// Importa a funcao REAL exportada por routes/api.js — sem espelho de logica.
//
// Propriedade central: um link de uso unico (area do aluno / reset de senha)
// funciona UMA vez e e recusado na segunda tentativa, porque o chamador marca
// usedAt apos o primeiro acesso bem-sucedido. Tambem confirma que:
//   - token expirado nao e aceito;
//   - o filtro por `type` impede usar um token de outro fluxo;
//   - sem `type` (reset de senha) qualquer registro valido casa pelo hash.
//
// Roda com:  node --test server/single-use-token.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { findActiveSingleUseToken } = require("./routes/api");

const NOW = "2026-06-13T12:00:00.000Z";
const FUTURE = "2026-06-15T12:00:00.000Z";
const PAST = "2026-06-12T12:00:00.000Z";

function areaToken(extra = {}) {
  return {
    tokenHash: "hash-area",
    type: "student_area_view",
    usedAt: "",
    expiresAt: FUTURE,
    studentId: "aluno-1",
    ...extra
  };
}

// --- Caminho legitimo: primeiro acesso encontra o token ----------------------
test("primeiro acesso: token valido e localizado pelo hash e tipo", () => {
  const resets = [areaToken()];
  const index = findActiveSingleUseToken(resets, { tokenHash: "hash-area", type: "student_area_view", now: NOW });
  assert.equal(index, 0);
});

// --- ATAQUE: reuso do mesmo link e recusado ----------------------------------
test("ATAQUE: token ja consumido (usedAt) NAO e aceito na segunda vez", () => {
  const resets = [areaToken()];
  const first = findActiveSingleUseToken(resets, { tokenHash: "hash-area", type: "student_area_view", now: NOW });
  assert.equal(first, 0);

  // Consumo como o handler faz apos o primeiro acesso bem-sucedido.
  resets[first] = { ...resets[first], usedAt: NOW };

  const second = findActiveSingleUseToken(resets, { tokenHash: "hash-area", type: "student_area_view", now: NOW });
  assert.equal(second, -1);
});

// --- ATAQUE: token expirado nao casa -----------------------------------------
test("ATAQUE: token expirado e recusado", () => {
  const resets = [areaToken({ expiresAt: PAST })];
  const index = findActiveSingleUseToken(resets, { tokenHash: "hash-area", type: "student_area_view", now: NOW });
  assert.equal(index, -1);
});

// --- ATAQUE: tipo errado nao casa --------------------------------------------
test("ATAQUE: token de outro fluxo (type diferente) e recusado", () => {
  const resets = [areaToken({ type: "contract_view" })];
  const index = findActiveSingleUseToken(resets, { tokenHash: "hash-area", type: "student_area_view", now: NOW });
  assert.equal(index, -1);
});

// --- reset de senha: sem `type`, casa qualquer registro valido pelo hash -----
test("reset de senha: sem filtro de tipo, localiza pelo hash e consome uma vez", () => {
  const resets = [areaToken({ tokenHash: "hash-reset", type: "password_reset", studentId: "" })];
  const first = findActiveSingleUseToken(resets, { tokenHash: "hash-reset", now: NOW });
  assert.equal(first, 0);

  resets[first] = { ...resets[first], usedAt: NOW };
  const second = findActiveSingleUseToken(resets, { tokenHash: "hash-reset", now: NOW });
  assert.equal(second, -1);
});
