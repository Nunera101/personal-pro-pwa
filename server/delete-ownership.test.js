// Teste de ATAQUE ao vetor mais destrutivo (R-19): DELETE /collections/:collection/:id.
// Reproduz fielmente o gate de autorizacao do handler em routes/api.js (busca o recurso-alvo
// na colecao e exige assertOwnership antes de deletar) usando os MESMOS modulos reais que a
// rota importa: dataScope (getDataScope/splitByOwner/OWNER_SCOPED_COLLECTIONS) + ownership.
//
// Confirma que um aluno nao deleta item de outro aluno e que um manager nao deleta item de
// outro trainer (ambos => 403), alem de inexistente => 404 e caminhos legitimos => deletam.
//
// Roda com:  node --test server/delete-ownership.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { getDataScope, splitByOwner, OWNER_SCOPED_COLLECTIONS } = require("./storage/dataScope");
const { assertOwnership } = require("./ownership");

const UPDATES_KEY = "personal-pro-updates-v1";
const STUDENTS_KEY = "personal-pro-students-v2";
const EXERCISES_KEY = "personal-pro-exercises-v1";

// Espelha exatamente o gate da rota DELETE /collections/:collection/:id.
// Retorna a colecao apos a remocao; lanca error.statusCode (403/404) quando o ataque e barrado.
function attemptDelete(collection, id, auth, items) {
  const scope = getDataScope(auth);
  const { ownerItems: existing, otherItems } = splitByOwner(items, scope, collection);
  if (OWNER_SCOPED_COLLECTIONS.has(collection)) {
    const target = existing.find((item) => String(item.id || "") === String(id));
    assertOwnership(target, auth);
  }
  const updated = existing.filter((item) => String(item.id || "") !== String(id));
  return [...otherItems, ...updated];
}

function expectStatus(fn, status) {
  try {
    fn();
    assert.fail(`deveria lancar ${status}`);
  } catch (error) {
    assert.equal(error.statusCode, status, `esperado statusCode ${status}, recebido ${error.statusCode}`);
  }
}

// --- Cenario aluno x aluno (mesmo trainer) ---------------------------------
const alunoA = { role: "student", trainerId: "t1", studentId: "sA" };
const updatesDoisAlunos = [
  { id: "uA", trainerId: "t1", studentId: "sA" },
  { id: "uB", trainerId: "t1", studentId: "sB" }
];

test("ATAQUE: aluno A tentando deletar item do aluno B -> 403", () => {
  expectStatus(() => attemptDelete(UPDATES_KEY, "uB", alunoA, updatesDoisAlunos), 403);
});

test("aluno A deleta o proprio item -> remove apenas o dele", () => {
  const result = attemptDelete(UPDATES_KEY, "uA", alunoA, updatesDoisAlunos);
  assert.deepEqual(result.map((i) => i.id), ["uB"]);
});

// --- Cenario manager trainer X x trainer Y ---------------------------------
const managerX = { role: "manager", trainerId: "tX", studentId: "" };
const studentsDoisTrainers = [
  { id: "alunoDoX", trainerId: "tX" },
  { id: "alunoDoY", trainerId: "tY" }
];

test("ATAQUE: manager do trainer X tentando deletar item do trainer Y -> 403", () => {
  expectStatus(() => attemptDelete(STUDENTS_KEY, "alunoDoY", managerX, studentsDoisTrainers), 403);
});

test("manager do trainer X deleta aluno do proprio trainer -> remove apenas o dele", () => {
  const result = attemptDelete(STUDENTS_KEY, "alunoDoX", managerX, studentsDoisTrainers);
  assert.deepEqual(result.map((i) => i.id), ["alunoDoY"]);
});

// --- Recurso inexistente ---------------------------------------------------
test("ATAQUE: deletar id inexistente em colecao com dono -> 404", () => {
  expectStatus(() => attemptDelete(UPDATES_KEY, "nao-existe", alunoA, updatesDoisAlunos), 404);
});

// --- Biblioteca compartilhada (sem dono) fica fora do ownership ------------
test("EXERCISES_KEY (biblioteca compartilhada) nao passa por ownership", () => {
  assert.equal(OWNER_SCOPED_COLLECTIONS.has(EXERCISES_KEY), false);
  const exercises = [{ id: "ex1" }, { id: "ex2" }];
  const result = attemptDelete(EXERCISES_KEY, "ex1", managerX, exercises);
  assert.deepEqual(result.map((i) => i.id), ["ex2"]);
});
