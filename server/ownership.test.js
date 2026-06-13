// Teste unitario do utilitario central de ownership.
// Roda com o test runner nativo do Node (>=20):  node --test server/ownership.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { assertOwnership, filterOwned, ownsResource } = require("./ownership");

const trainer = { role: "manager", trainerId: "t1", studentId: "" };
const student = { role: "student", trainerId: "t1", studentId: "s1" };

function res(trainerId, studentId) {
  return { id: "r", trainerId, studentId };
}

test("manager: dono do recurso do proprio trainer", () => {
  const r = res("t1", "s1");
  assert.equal(assertOwnership(r, trainer), r);
  assert.equal(ownsResource(r, trainer), true);
});

test("manager: recurso de outro trainer -> 403", () => {
  try {
    assertOwnership(res("t2", "s1"), trainer);
    assert.fail("deveria lancar");
  } catch (error) {
    assert.equal(error.statusCode, 403);
  }
});

test("student: dono do proprio recurso", () => {
  const r = res("t1", "s1");
  assert.equal(assertOwnership(r, student), r);
  assert.equal(ownsResource(r, student), true);
});

test("student: recurso de outro aluno do mesmo trainer -> 403", () => {
  try {
    assertOwnership(res("t1", "s2"), student);
    assert.fail("deveria lancar");
  } catch (error) {
    assert.equal(error.statusCode, 403);
  }
});

test("student: recurso de outro trainer -> 403", () => {
  try {
    assertOwnership(res("t2", "s1"), student);
    assert.fail("deveria lancar");
  } catch (error) {
    assert.equal(error.statusCode, 403);
  }
});

test("recurso inexistente (null/undefined) -> 404", () => {
  for (const missing of [null, undefined]) {
    try {
      assertOwnership(missing, trainer);
      assert.fail("deveria lancar");
    } catch (error) {
      assert.equal(error.statusCode, 404);
    }
  }
});

test("filterOwned: manager ve todos os recursos do seu trainer", () => {
  const list = [res("t1", "s1"), res("t1", "s2"), res("t2", "s1")];
  const owned = filterOwned(list, trainer);
  assert.equal(owned.length, 2);
  assert.ok(owned.every((item) => item.trainerId === "t1"));
});

test("filterOwned: student ve apenas os proprios recursos", () => {
  const list = [res("t1", "s1"), res("t1", "s2"), res("t2", "s1"), res("t1", "s1")];
  const owned = filterOwned(list, student);
  assert.equal(owned.length, 2);
  assert.ok(owned.every((item) => item.trainerId === "t1" && item.studentId === "s1"));
});

test("filterOwned: entrada nao-array retorna lista vazia", () => {
  assert.deepEqual(filterOwned(null, trainer), []);
  assert.deepEqual(filterOwned(undefined, student), []);
});

test("ownsResource: sem auth retorna false", () => {
  assert.equal(ownsResource(res("t1", "s1"), null), false);
});
