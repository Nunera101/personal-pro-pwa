// Teste de VALIDACAO DE SCHEMA (M1): validateSchema / validateCollectionPayload.
// Importa as funcoes REAIS exportadas por routes/api.js — sem espelho de logica.
//
// Propriedade central: payload malformado e barrado com 400 (mensagem clara)
// ANTES de qualquer acesso ao banco. Cobrimos:
//   - corpo nao-objeto (string/array/null) e recusado;
//   - campos obrigatorios ausentes/vazios usam a mensagem definida;
//   - tipo errado (email/string) e recusado;
//   - limites de tamanho (min/max) sao aplicados;
//   - payload valido passa ("" = sem erro);
//   - escrita de colecao aceita objeto/array e corpo vazio, mas recusa primitivos.
//
// Roda com:  node --test server/schema-validation.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateSchema,
  validateCollectionPayload,
  LOGIN_SCHEMA,
  RESET_PASSWORD_SCHEMA
} = require("./routes/api");

test("validateSchema recusa corpo que nao e objeto JSON", () => {
  assert.equal(validateSchema(null, LOGIN_SCHEMA), "Payload invalido: esperado um objeto JSON.");
  assert.equal(validateSchema("texto", LOGIN_SCHEMA), "Payload invalido: esperado um objeto JSON.");
  assert.equal(validateSchema([], LOGIN_SCHEMA), "Payload invalido: esperado um objeto JSON.");
  assert.equal(validateSchema(undefined, LOGIN_SCHEMA), "Payload invalido: esperado um objeto JSON.");
});

test("login: campos obrigatorios ausentes usam a mensagem combinada", () => {
  assert.equal(validateSchema({}, LOGIN_SCHEMA), "Informe e-mail e senha.");
  assert.equal(validateSchema({ email: "a@b.com" }, LOGIN_SCHEMA), "Informe e-mail e senha.");
  assert.equal(validateSchema({ email: "a@b.com", password: "" }, LOGIN_SCHEMA), "Informe e-mail e senha.");
});

test("login: e-mail com tipo/formato invalido e recusado", () => {
  assert.equal(validateSchema({ email: { x: 1 }, password: "12345678" }, LOGIN_SCHEMA), "Formato de e-mail invalido.");
  assert.equal(validateSchema({ email: "sem-arroba", password: "12345678" }, LOGIN_SCHEMA), "Formato de e-mail invalido.");
});

test("login: senha do tipo errado ou longa demais e recusada", () => {
  assert.equal(validateSchema({ email: "a@b.com", password: { y: 2 } }, LOGIN_SCHEMA), 'O campo "password" deve ser um texto.');
  assert.equal(validateSchema({ email: "a@b.com", password: "x".repeat(129) }, LOGIN_SCHEMA), "Senha muito longa.");
});

test("login: payload valido passa", () => {
  assert.equal(validateSchema({ email: "Aluno@Exemplo.com", password: "senhaForte1" }, LOGIN_SCHEMA), "");
});

test("reset-password: token/senha ausentes ou senha curta usam mensagem clara", () => {
  const msg = "Informe um link valido e uma senha com pelo menos 8 caracteres.";
  assert.equal(validateSchema({}, RESET_PASSWORD_SCHEMA), msg);
  assert.equal(validateSchema({ token: "abc" }, RESET_PASSWORD_SCHEMA), msg);
  assert.equal(validateSchema({ token: "abc", password: "1234567" }, RESET_PASSWORD_SCHEMA), msg);
});

test("reset-password: campos longos demais sao recusados", () => {
  assert.equal(validateSchema({ token: "t".repeat(129), password: "12345678" }, RESET_PASSWORD_SCHEMA), "Campos fora do tamanho permitido.");
  assert.equal(validateSchema({ token: "abc", password: "x".repeat(129) }, RESET_PASSWORD_SCHEMA), "Campos fora do tamanho permitido.");
});

test("reset-password: payload valido passa", () => {
  assert.equal(validateSchema({ token: "deadbeef", password: "senhaForte1" }, RESET_PASSWORD_SCHEMA), "");
});

test("validateCollectionPayload aceita objeto, array e corpo vazio", () => {
  assert.equal(validateCollectionPayload({}), "");
  assert.equal(validateCollectionPayload([{ id: "x" }]), "");
  assert.equal(validateCollectionPayload(null), "");
  assert.equal(validateCollectionPayload(undefined), "");
});

test("validateCollectionPayload recusa primitivos (JSON malformado)", () => {
  const msg = "Payload invalido: esperado objeto ou array JSON.";
  assert.equal(validateCollectionPayload("texto"), msg);
  assert.equal(validateCollectionPayload(42), msg);
  assert.equal(validateCollectionPayload(true), msg);
});
