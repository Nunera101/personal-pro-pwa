// Teste da COPIA INDEPENDENTE ao aplicar padrao (R-06).
//
// Confirma o contrato de buildStudentWorkoutFromPattern (app.js:909):
// aplicar um PADRAO (molde, sem studentId) a um aluno gera um NOVO treino com
// novo id e o studentId do aluno, copiando os exercicios POR VALOR (deep copy,
// com novos ids de exercicio). sourcePatternId/sourcePatternTitle ficam apenas
// como REFERENCIA HISTORICA (strings), nunca como ponteiro vivo para o padrao.
//
// Como app.js e um IIFE de browser (nao requerivel), espelhamos aqui a logica
// real, fiel as funcoes citadas — mesma estrategia dos demais *.test.js do repo.
//
// Roda com:  node --test server/aplicar-padrao-copia.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

// --- Espelho fiel das funcoes de app.js ------------------------------------

// app.js:579 — id unico com prefixo.
function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// app.js:887 — copia profunda de dados puros (sem funcoes/DOM).
function deepClonePlain(value) {
  if (value == null || typeof value !== "object") return value;
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
  } catch (_) {}
  return JSON.parse(JSON.stringify(value));
}

// app.js:895 — cada exercicio copiado ganha um NOVO id de exercicio.
function cloneWorkoutExercises(exercises = []) {
  return exercises.map((item, index) => ({
    ...item,
    id: createId("workout-exercise"),
    order: item.order || index + 1
  }));
}

// app.js:909 — converte PADRAO em TREINO DO ALUNO (copia profunda + novo id).
function buildStudentWorkoutFromPattern(pattern, studentId, overrides = {}) {
  const base = deepClonePlain(pattern);
  return {
    ...base,
    ...overrides,
    id: overrides.id || createId("workout"),
    studentId,
    sourcePatternId: pattern.id,
    sourcePatternTitle: pattern.title,
    status: overrides.status || "draft",
    appliedAt: new Date().toISOString(),
    exercises: cloneWorkoutExercises(base.exercises)
  };
}

// app.js:13175/13183 — delete remove SOMENTE o item cujo id casa (filter por id).
function removeWorkoutById(workouts, id) {
  return workouts.filter((workout) => workout.id !== id);
}

// --- Fixtures --------------------------------------------------------------

function novoPadrao() {
  return {
    id: "padrao-1",
    title: "Treino A — Peito e Triceps",
    studentId: "", // sem studentId => e PADRAO (molde)
    exercises: [
      { id: "wx-base-1", exerciseId: "ex-supino", sets: 4, targetReps: "10", suggestedLoad: "40kg", order: 1 },
      { id: "wx-base-2", exerciseId: "ex-triceps", sets: 3, targetReps: "12", suggestedLoad: "20kg", order: 2 }
    ]
  };
}

// --- A copia nasce desacoplada do padrao -----------------------------------

test("aplicar padrao gera NOVO treino: novo id, studentId do aluno, novos ids de exercicio", () => {
  const padrao = novoPadrao();
  const treino = buildStudentWorkoutFromPattern(padrao, "aluno-7", { status: "published" });

  assert.notEqual(treino.id, padrao.id, "treino do aluno deve ter id proprio");
  assert.equal(treino.studentId, "aluno-7", "treino deve pertencer ao aluno");
  assert.equal(treino.status, "published");
  assert.equal(treino.exercises.length, padrao.exercises.length);
  treino.exercises.forEach((ex, i) => {
    assert.notEqual(ex.id, padrao.exercises[i].id, "cada exercicio copiado deve ter id novo");
  });
});

test("sourcePatternId/Title sao referencia historica (strings), nao ponteiro vivo", () => {
  const padrao = novoPadrao();
  const treino = buildStudentWorkoutFromPattern(padrao, "aluno-7");

  assert.equal(treino.sourcePatternId, "padrao-1");
  assert.equal(treino.sourcePatternTitle, "Treino A — Peito e Triceps");
  assert.equal(typeof treino.sourcePatternId, "string");
  // Nenhum campo do treino aponta para o objeto-padrao em si.
  assert.notEqual(treino.exercises, padrao.exercises, "array de exercicios nao pode ser o mesmo");
  assert.notEqual(treino.exercises[0], padrao.exercises[0], "item de exercicio nao pode ser o mesmo objeto");
});

// --- EDITAR o padrao depois NAO altera o treino ja aplicado ----------------

test("editar o padrao depois NAO muda o treino do aluno", () => {
  const padrao = novoPadrao();
  const treino = buildStudentWorkoutFromPattern(padrao, "aluno-7");

  // Edicoes no padrao apos a aplicacao:
  padrao.title = "Treino A — RENOMEADO";
  padrao.exercises[0].suggestedLoad = "999kg";
  padrao.exercises[0].sets = 99;
  padrao.exercises.push({ id: "wx-base-3", exerciseId: "ex-novo", sets: 5, order: 3 });

  assert.equal(treino.title, "Treino A — Peito e Triceps", "titulo do treino do aluno permanece");
  assert.equal(treino.exercises.length, 2, "exercicio adicionado no padrao nao vaza para o treino");
  assert.equal(treino.exercises[0].suggestedLoad, "40kg", "carga do treino do aluno permanece");
  assert.equal(treino.exercises[0].sets, 4, "series do treino do aluno permanecem");
});

// --- APAGAR o padrao: o treino do aluno sobrevive e continua executavel -----

test("apagar o padrao mantem o treino do aluno existente e executavel", () => {
  const padrao = novoPadrao();
  const treino = buildStudentWorkoutFromPattern(padrao, "aluno-7", { status: "published" });
  let workouts = [padrao, treino];

  // Remove o PADRAO da colecao (delete por id — app.js:13183).
  workouts = removeWorkoutById(workouts, padrao.id);

  const aindaVive = workouts.find((w) => w.id === treino.id);
  assert.ok(aindaVive, "treino do aluno deve continuar na colecao");
  assert.equal(workouts.some((w) => w.id === padrao.id), false, "padrao foi removido");

  // Continua executavel: tem proprios exercicios com series/reps/carga, sem
  // depender de buscar nada no padrao removido.
  assert.equal(aindaVive.exercises.length, 2);
  aindaVive.exercises.forEach((ex) => {
    assert.ok(ex.exerciseId, "exercicio mantem referencia ao catalogo");
    assert.ok(ex.sets >= 1, "exercicio mantem series");
    assert.ok(ex.targetReps, "exercicio mantem reps alvo");
  });
});
