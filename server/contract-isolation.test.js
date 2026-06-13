// Teste de ATAQUE ao merge de contratos do aluno (R-14): mergeStudentContracts.
// Importa a funcao REAL exportada por routes/api.js — nenhum espelho de logica.
//
// Cenario: o aluno A envia um PUT em /collections/contracts. O storage contem
// contratos de A e de B. Confirma que:
//   - o resultado contem SOMENTE contratos do aluno A (nenhum do aluno B);
//   - o aluno A nao consegue injetar/assinar um contrato do aluno B reusando o id;
//   - a assinatura legitima do proprio contrato e aplicada.
//
// Roda com:  node --test server/contract-isolation.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { mergeStudentContracts } = require("./routes/api");

const authA = { role: "student", studentId: "alunoA", trainerId: "trainer-demo" };

// --- ATAQUE: aluno A pede merge e NAO pode receber contratos do aluno B ------
test("ATAQUE: merge do aluno A nao retorna nenhum contrato do aluno B", () => {
  const existing = [
    { id: "cA1", studentId: "alunoA", status: "pending" },
    { id: "cB1", studentId: "alunoB", status: "pending" },
    { id: "cB2", studentId: "alunoB", status: "signed", signerName: "Bruno" }
  ];
  // payload do aluno A (cliente) tenta puxar tudo
  const payload = existing.map((c) => ({ ...c }));
  const result = mergeStudentContracts(existing, payload, authA);

  assert.ok(
    result.every((c) => c.studentId === "alunoA"),
    "resultado nao pode conter contrato de outro aluno"
  );
  assert.equal(
    result.some((c) => c.id === "cB1" || c.id === "cB2"),
    false,
    "ids de contratos do aluno B nao podem aparecer no resultado"
  );
  assert.equal(result.length, 1, "apenas o unico contrato do aluno A deve sair");
  assert.equal(result[0].id, "cA1");
});

// --- ATAQUE: aluno A tenta assinar contrato do aluno B reusando o id ---------
test("ATAQUE: aluno A nao consegue assinar/injetar contrato do aluno B", () => {
  const existing = [
    { id: "cA1", studentId: "alunoA", status: "pending" },
    { id: "cB1", studentId: "alunoB", status: "pending" }
  ];
  // aluno A manda no payload um item com o id de B, marcado como seu e assinado
  const payload = [
    { id: "cB1", studentId: "alunoA", status: "signed", signerName: "Atacante" }
  ];
  const result = mergeStudentContracts(existing, payload, authA);

  assert.equal(result.length, 1, "so o contrato do proprio aluno A permanece");
  assert.equal(result[0].id, "cA1");
  assert.equal(result[0].status, "pending", "contrato de A nao foi tocado pelo payload forjado");
  // o contrato cB1 do aluno B nao aparece nem assinado nem inalterado
  assert.equal(result.some((c) => c.id === "cB1"), false);
});

// --- Caminho legitimo: aluno A assina o proprio contrato --------------------
test("legitimo: aluno A assina o proprio contrato", () => {
  const existing = [
    { id: "cA1", studentId: "alunoA", status: "pending", version: "v2" },
    { id: "cB1", studentId: "alunoB", status: "pending" }
  ];
  const payload = [
    { id: "cA1", studentId: "alunoA", status: "signed", signerName: "Ana", signerCpf: "000" }
  ];
  const result = mergeStudentContracts(existing, payload, authA);

  assert.equal(result.length, 1);
  assert.equal(result[0].status, "signed");
  assert.equal(result[0].signerName, "Ana");
  assert.equal(result[0].signedVersion, "v2", "versao assinada vem do contrato do servidor");
  assert.ok(result[0].signedAt, "signedAt e preenchido na assinatura");
  assert.equal(result.some((c) => c.id === "cB1"), false, "contrato de B nunca entra no resultado");
});
