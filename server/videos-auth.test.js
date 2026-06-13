// Teste de ATAQUE à rota GET /api/videos/:id (C4): authorizeVideoAccess.
// Importa a função REAL exportada por routes/videos.js — nenhum espelho de lógica.
//
// Cenário central exigido: um usuário SEM permissão tenta baixar um vídeo por id
// e recebe 403. Confirma que:
//   - acesso sem sessão é bloqueado (401);
//   - vídeo de OUTRO trainer é negado a gestor e a aluno (403);
//   - id inexistente não vaza informação (404);
//   - gestor e alunos do mesmo trainer (dono da biblioteca) acessam normalmente.
//
// Roda com:  node --test server/videos-auth.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { authorizeVideoAccess } = require("./routes/videos");

// Linhas como vêm do banco (coluna trainer_id).
const videoDemo = { trainer_id: "trainer-demo", mimetype: "video/mp4" };

const manager = { role: "manager", trainerId: "trainer-demo" };
const aluno = { role: "student", studentId: "alunoA", trainerId: "trainer-demo" };
const managerOutro = { role: "manager", trainerId: "trainer-x" };
const alunoOutro = { role: "student", studentId: "alunoZ", trainerId: "trainer-x" };

// --- ATAQUE principal: usuário de outro trainer baixa vídeo por id -----------
test("ATAQUE: gestor de OUTRO trainer NAO baixa o video (403)", () => {
  const result = authorizeVideoAccess(videoDemo, managerOutro);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("ATAQUE: aluno de OUTRO trainer NAO baixa o video (403)", () => {
  const result = authorizeVideoAccess(videoDemo, alunoOutro);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

// --- ATAQUE: sem sessão (URL pública crua) -----------------------------------
test("ATAQUE: requisicao sem sessao e bloqueada (401)", () => {
  const result = authorizeVideoAccess(videoDemo, null);
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});

// --- ATAQUE: id inexistente nao revela existencia ----------------------------
test("ATAQUE: video inexistente retorna 404", () => {
  const result = authorizeVideoAccess(undefined, manager);
  assert.equal(result.ok, false);
  assert.equal(result.status, 404);
});

// --- Caminho legítimo: gestor do tenant acessa o proprio video ---------------
test("legitimo: gestor do tenant acessa o video da propria biblioteca", () => {
  assert.deepEqual(authorizeVideoAccess(videoDemo, manager), { ok: true });
});

// --- Caminho legítimo: aluno do mesmo trainer acessa o video do exercicio ----
test("legitimo: aluno do mesmo trainer acessa o video do exercicio", () => {
  assert.deepEqual(authorizeVideoAccess(videoDemo, aluno), { ok: true });
});
