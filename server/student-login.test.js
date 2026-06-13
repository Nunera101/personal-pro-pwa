// Teste do login de aluno multi-tenant (RELATORIO-MULTI-PERSONAL secao 6).
// Roda com o test runner nativo do Node (>=20):  node --test server/student-login.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveStudentLogin } = require("./student-login");
const { createSessionToken, verifySessionToken } = require("./auth");

// Helpers injetados (em producao vem de api.js): comparam senha em texto plano
// pelo "hash" que e a propria senha — suficiente para isolar a regra de login.
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const verifyPassword = (password, hash) => Boolean(hash) && password === hash;

function student(trainerId, password, extra = {}) {
  return { id: `s-${trainerId}`, email: "aluno@x.com", trainerId, passwordHash: password, ...extra };
}

test("token carrega o trainerId do PROPRIO registro encontrado", () => {
  const students = [student("t1", "senha-t1"), student("t2", "senha-t2")];
  const { student: found } = resolveStudentLogin(students, "aluno@x.com", {
    normalizeEmail,
    verifyPassword,
    password: "senha-t2"
  });
  assert.equal(found.trainerId, "t2");

  const token = createSessionToken({ role: "student", email: found.email, trainerId: found.trainerId, studentId: found.id });
  const payload = verifySessionToken(token);
  assert.equal(payload.trainerId, "t2");
  assert.equal(payload.studentId, "s-t2");
  assert.equal(payload.role, "student");
});

test("e-mail unico: resolve o registro e seu trainer", () => {
  const students = [student("t9", "abc")];
  const { student: found, reason } = resolveStudentLogin(students, "aluno@x.com", {
    normalizeEmail,
    verifyPassword,
    password: "abc"
  });
  assert.equal(reason, "ok");
  assert.equal(found.trainerId, "t9");
});

test("senha errada: login negado", () => {
  const students = [student("t1", "senha-t1")];
  const result = resolveStudentLogin(students, "aluno@x.com", {
    normalizeEmail,
    verifyPassword,
    password: "errada"
  });
  assert.equal(result.student, null);
  assert.equal(result.reason, "no-match");
});

test("colisao desempatada pela senha: cada trainer tem senha distinta", () => {
  const students = [student("t1", "senha-t1"), student("t2", "senha-t2")];
  const r1 = resolveStudentLogin(students, "aluno@x.com", { normalizeEmail, verifyPassword, password: "senha-t1" });
  assert.equal(r1.student.trainerId, "t1");
});

test("colisao ambigua (mesmo e-mail E mesma senha em trainers distintos): recusa", () => {
  const students = [student("t1", "igual"), student("t2", "igual")];
  const result = resolveStudentLogin(students, "aluno@x.com", {
    normalizeEmail,
    verifyPassword,
    password: "igual"
  });
  assert.equal(result.student, null);
  assert.equal(result.reason, "ambiguous");
});

test("aluno inativo nao e candidato mesmo com senha correta", () => {
  const students = [student("t1", "abc", { status: "inactive" })];
  const result = resolveStudentLogin(students, "aluno@x.com", {
    normalizeEmail,
    verifyPassword,
    password: "abc"
  });
  assert.equal(result.student, null);
  assert.equal(result.reason, "no-match");
});

test("entrada nao-array nao quebra", () => {
  assert.equal(resolveStudentLogin(null, "aluno@x.com", { normalizeEmail, verifyPassword, password: "x" }).student, null);
});
