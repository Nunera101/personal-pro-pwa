// Teste de ATAQUE a escrita de colecao (R-02, R-05, R-17): PUT /collections/:collection.
// Reproduz fielmente o gate de ownership da escrita do manager em routes/api.js
// (splitByOwner para separar itens de outros donos + enforceOwnerOnWrite para garantir
// que trainerId/studentId vem do SERVIDOR, nunca do corpo do cliente) usando os MESMOS
// modulos reais que a rota importa: dataScope + ownership.
//
// Confirma que o corpo do cliente NAO consegue:
//   - reatribuir um treino/pagamento existente para outro studentId (servidor ignora);
//   - reatribuir um recurso para outro trainerId (servidor mantem o da sessao);
//   - sequestrar/sobrescrever recurso de outro dono reusando seu id.
// E que caminhos legitimos (criar item novo, atualizar campo nao-dono) funcionam.
//
// Roda com:  node --test server/write-ownership.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { getDataScope, splitByOwner, OWNER_SCOPED_COLLECTIONS } = require("./storage/dataScope");
const { enforceOwnerOnWrite } = require("./ownership");

const WORKOUTS_KEY = "personal-pro-workouts-v3";
const PAYMENTS_KEY = "personal-pro-payments-v1";
const EXERCISES_KEY = "personal-pro-exercises-v1";

// Espelha exatamente o gate da escrita do manager para colecoes com dono.
// Retorna a colecao final que seria persistida.
function attemptWrite(collection, payload, auth, existing) {
  if (!(OWNER_SCOPED_COLLECTIONS.has(collection) && Array.isArray(payload))) {
    return payload;
  }
  const split = splitByOwner(Array.isArray(existing) ? existing : [], getDataScope(auth), collection);
  const foreignIds = new Set(split.otherItems.map((item) => String(item.id || "")));
  const writable = enforceOwnerOnWrite(payload, split.ownerItems, auth, foreignIds);
  return [...split.otherItems, ...writable];
}

const manager = { role: "manager", trainerId: "trainer-demo", studentId: "" };

// --- ATAQUE: reatribuir treino existente para outro studentId via corpo ----
test("ATAQUE: reatribuir treino existente para outro studentId -> servidor ignora", () => {
  const existing = [{ id: "w1", trainerId: "trainer-demo", studentId: "alunoA", title: "Treino A" }];
  const payload = [{ id: "w1", trainerId: "trainer-demo", studentId: "alunoB", title: "Treino A" }];
  const result = attemptWrite(WORKOUTS_KEY, payload, manager, existing);
  assert.equal(result[0].studentId, "alunoA", "studentId do recurso deve permanecer o do servidor");
});

// --- ATAQUE: reatribuir pagamento existente para outro studentId -----------
test("ATAQUE: reatribuir pagamento existente para outro studentId -> servidor ignora", () => {
  const existing = [{ id: "p1", trainerId: "trainer-demo", studentId: "alunoA", valor: 100 }];
  const payload = [{ id: "p1", trainerId: "trainer-demo", studentId: "alunoB", valor: 100 }];
  const result = attemptWrite(PAYMENTS_KEY, payload, manager, existing);
  assert.equal(result[0].studentId, "alunoA", "studentId do pagamento deve permanecer o do servidor");
});

// --- ATAQUE: reatribuir trainerId via corpo --------------------------------
test("ATAQUE: reatribuir trainerId de item existente -> servidor mantem o gravado", () => {
  const existing = [{ id: "w1", trainerId: "trainer-demo", studentId: "alunoA" }];
  const payload = [{ id: "w1", trainerId: "trainer-malicioso", studentId: "alunoA" }];
  const result = attemptWrite(WORKOUTS_KEY, payload, manager, existing);
  assert.equal(result[0].trainerId, "trainer-demo");
});

test("ATAQUE: criar item novo com trainerId forjado -> servidor carimba o da sessao", () => {
  const payload = [{ id: "w2", trainerId: "trainer-malicioso", studentId: "alunoA" }];
  const result = attemptWrite(WORKOUTS_KEY, payload, manager, []);
  assert.equal(result[0].trainerId, "trainer-demo");
});

// --- Caminho legitimo: atualizar campo que nao e dono ----------------------
test("legitimo: atualizar titulo do proprio treino preserva dono e aplica mudanca", () => {
  const existing = [{ id: "w1", trainerId: "trainer-demo", studentId: "alunoA", title: "Antigo" }];
  const payload = [{ id: "w1", trainerId: "trainer-demo", studentId: "alunoA", title: "Novo" }];
  const result = attemptWrite(WORKOUTS_KEY, payload, manager, existing);
  assert.equal(result[0].title, "Novo");
  assert.equal(result[0].studentId, "alunoA");
});

// --- ATAQUE: sequestrar id de outro dono (escopo multi-personal) -----------
// enforceOwnerOnWrite recebe foreignIds (ids de outros donos). Testado direto
// porque sob escopo global splitByOwner ainda nao separa otherItems.
test("ATAQUE: reusar id de recurso de outro dono -> descartado", () => {
  const payload = [{ id: "alheio", trainerId: "trainer-demo", titulo: "tentativa" }];
  const result = enforceOwnerOnWrite(payload, [], manager, new Set(["alheio"]));
  assert.deepEqual(result, [], "id pertencente a outro dono nao pode ser gravado");
});

// --- Biblioteca compartilhada (sem dono) fica fora do ownership ------------
test("EXERCISES_KEY (biblioteca compartilhada) nao passa por enforcement", () => {
  assert.equal(OWNER_SCOPED_COLLECTIONS.has(EXERCISES_KEY), false);
  const payload = [{ id: "ex1", trainerId: "qualquer" }];
  const result = attemptWrite(EXERCISES_KEY, payload, manager, []);
  assert.equal(result[0].trainerId, "qualquer", "exercicios nao tem dono — payload passa intacto");
});
