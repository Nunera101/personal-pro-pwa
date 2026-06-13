// Resolucao de login de aluno em ambiente MULTI-TENANT (multi-personal).
// Referencia: RELATORIO-MULTI-PERSONAL.md secao 6 e Fase 2.7.
//
// O aluno se autentica apenas por e-mail + senha; ele NAO informa qual personal
// (trainer) e o seu. Como o mesmo e-mail pode existir em trainers diferentes,
// precisamos descobrir o trainer no momento do login e usar o trainerId do
// PROPRIO REGISTRO encontrado para montar o JWT — nunca uma constante fixa.
//
// Decisao de seguranca para colisao de e-mail entre trainers (deterministica):
//   - Filtramos todos os candidatos ativos com aquele e-mail.
//   - Desempatamos pela SENHA: so e candidato valido quem tem o hash que confere.
//   - 0 validos  -> credencial invalida (login negado).
//   - 1 valido   -> autentica nesse trainer (trainerId vem do registro).
//   - 2+ validos -> ambiguidade real (mesmo e-mail E mesma senha em trainers
//                   distintos). Recusamos em vez de adivinhar o tenant; logar no
//                   trainer errado vazaria dados entre personais.
//
// A funcao e pura (recebe verifyPassword/normalizeEmail injetados) para ser
// testavel sem banco, espelhando o padrao de server/ownership.js.

function resolveStudentLogin(students, email, { normalizeEmail, verifyPassword, password }) {
  const candidates = (Array.isArray(students) ? students : []).filter(
    (item) => normalizeEmail(item.email) === email && item.status !== "inactive"
  );
  const matches = candidates.filter((item) => verifyPassword(password, item.passwordHash));

  if (matches.length === 0) return { student: null, reason: "no-match" };
  if (matches.length > 1) return { student: null, reason: "ambiguous" };
  return { student: matches[0], reason: "ok" };
}

module.exports = { resolveStudentLogin };
