// Teste de ATAQUE ao serviço de /uploads (C3): authorizeUploadAccess.
// Importa a função REAL exportada por routes/uploads.js — nenhum espelho de lógica.
//
// Cenário central exigido: um aluno tenta baixar o PDF de contrato de OUTRO aluno
// pela URL direta. Confirma que:
//   - acesso sem sessão é bloqueado (401);
//   - aluno A não acessa contrato/foto do aluno B (403);
//   - arquivo desconhecido não vaza informação (404);
//   - o dono legítimo (aluno) e o gestor (mesmo tenant) acessam normalmente.
//
// Roda com:  node --test server/uploads-isolation.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { authorizeUploadAccess, resolveUploadTrainerId, fileNameFromUrl } = require("./routes/uploads");

const authA = { role: "student", studentId: "alunoA", trainerId: "trainer-demo" };
const authB = { role: "student", studentId: "alunoB", trainerId: "trainer-demo" };
const manager = { role: "manager", trainerId: "trainer-demo" };
const otherManager = { role: "manager", trainerId: "trainer-x" };

const contracts = [
  { id: "cA1", trainerId: "trainer-demo", studentId: "alunoA", pdfUrl: "https://api.app/uploads/contracts/cA1-100.pdf" },
  { id: "cB1", trainerId: "trainer-demo", studentId: "alunoB", pdfUrl: "https://api.app/uploads/contracts/cB1-200.pdf" }
];
const students = [
  { id: "alunoA", trainerId: "trainer-demo", photoUrl: "/uploads/profiles/alunoA-1.jpg" },
  { id: "alunoB", trainerId: "trainer-demo", photoUrl: "/uploads/profiles/alunoB-2.jpg" }
];
const settings = { trainerPhotoUrl: "/uploads/profiles/trainer-demo-9.jpg" };
const data = { contracts, students, settings };

// --- ATAQUE principal: aluno A baixa contrato do aluno B por URL direta ------
test("ATAQUE: aluno A NAO acessa o PDF de contrato do aluno B", () => {
  const result = authorizeUploadAccess("contracts", "cB1-200.pdf", authA, data);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403, "acesso cruzado a contrato deve ser proibido (403)");
});

// --- ATAQUE: sem sessão (URL pública crua) -----------------------------------
test("ATAQUE: requisicao sem sessao e bloqueada (401)", () => {
  const result = authorizeUploadAccess("contracts", "cB1-200.pdf", null, data);
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});

// --- ATAQUE: aluno A acessa a foto de perfil do aluno B ----------------------
test("ATAQUE: aluno A NAO acessa a foto de perfil do aluno B", () => {
  const result = authorizeUploadAccess("profiles", "alunoB-2.jpg", authA, data);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

// --- ATAQUE: gestor de OUTRO tenant nao acessa contrato deste tenant ---------
test("ATAQUE: gestor de outro tenant NAO acessa contrato alheio", () => {
  const result = authorizeUploadAccess("contracts", "cA1-100.pdf", otherManager, data);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

// --- ATAQUE: arquivo desconhecido nao revela existencia ----------------------
test("ATAQUE: arquivo inexistente/orfao retorna 404", () => {
  const result = authorizeUploadAccess("contracts", "naoexiste-999.pdf", manager, data);
  assert.equal(result.ok, false);
  assert.equal(result.status, 404);
});

// --- Caminho legítimo: aluno A baixa o PRÓPRIO contrato ----------------------
test("legitimo: aluno A acessa o proprio contrato", () => {
  assert.deepEqual(authorizeUploadAccess("contracts", "cA1-100.pdf", authA, data), { ok: true });
});

// --- Caminho legítimo: gestor do tenant acessa contrato de qualquer aluno ----
test("legitimo: gestor do tenant acessa contrato do aluno", () => {
  assert.deepEqual(authorizeUploadAccess("contracts", "cB1-200.pdf", manager, data), { ok: true });
});

// --- Caminho legítimo: aluno acessa a propria foto e a foto do personal ------
test("legitimo: aluno acessa a propria foto de perfil", () => {
  assert.deepEqual(authorizeUploadAccess("profiles", "alunoA-1.jpg", authA, data), { ok: true });
});

test("legitimo: foto do personal e visivel a aluno autenticado do tenant", () => {
  assert.deepEqual(authorizeUploadAccess("profiles", "trainer-demo-9.jpg", authB, data), { ok: true });
});

// --- ATAQUE (M5): forjar trainerId no corpo para gravar upload em outro tenant
test("ATAQUE: trainerId do corpo e IGNORADO; usa-se o da sessao", () => {
  // Gestor autenticado como trainer-demo tenta forjar o tenant pelo corpo.
  const request = {
    auth: { role: "manager", trainerId: "trainer-demo" },
    body: { trainerId: "trainer-x", exerciseId: "e1" }
  };
  assert.equal(resolveUploadTrainerId(request), "trainer-demo");
});

test("legitimo: trainerId vem da sessao mesmo sem corpo", () => {
  const request = { auth: { role: "manager", trainerId: "trainer-demo" } };
  assert.equal(resolveUploadTrainerId(request), "trainer-demo");
});

// --- Sanidade do extrator de nome de arquivo --------------------------------
test("fileNameFromUrl extrai o ultimo segmento sem query/fragmento", () => {
  assert.equal(fileNameFromUrl("https://api.app/uploads/contracts/cA1-100.pdf?token=x"), "cA1-100.pdf");
  assert.equal(fileNameFromUrl("/uploads/profiles/alunoA-1.jpg#z"), "alunoA-1.jpg");
  assert.equal(fileNameFromUrl(""), "");
});
