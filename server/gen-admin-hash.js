#!/usr/bin/env node
// Gera o hash bcrypt da senha do admin para usar na variavel ADMIN_PASSWORD_HASH.
//
// Uso:
//   node server/gen-admin-hash.js "suaSenhaForte"
//
// Copie o hash impresso e configure no Railway (ou no .env local):
//   ADMIN_PASSWORD_HASH=$2a$12$....
//   ADMIN_EMAIL=seu-admin@dominio.com
//
// NUNCA commite a senha real nem o hash de producao no repositorio.

const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error('Uso: node server/gen-admin-hash.js "suaSenhaForte"');
  process.exit(1);
}

const hash = bcrypt.hashSync(String(password), 12);
console.log(hash);
