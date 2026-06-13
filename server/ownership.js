// Utilitario central de ownership (pertencimento de recurso ao requisitante).
//
// REGRA UNICA — nenhuma rota deve reimplementar esta checagem. Importe daqui.
//   manager: recurso pertence se  resource.trainerId === auth.trainerId
//   student: recurso pertence se  resource.trainerId === auth.trainerId
//                                 E resource.studentId === auth.studentId
//
// Use assertOwnership(resource, auth) em rotas que carregam UM recurso:
//   lanca erro com statusCode 404 (inexistente) ou 403 (nao-autorizado),
//   compativel com o tratamento de erro existente (error.statusCode).
// Use filterOwned(list, auth) para reduzir uma lista apenas aos recursos do dono.

function ownsResource(resource, auth) {
  if (!resource || !auth) return false;
  if (resource.trainerId !== auth.trainerId) return false;
  if (auth.role === "student") {
    return resource.studentId === auth.studentId;
  }
  return true;
}

// Garante que `resource` existe e pertence a `auth`.
// Retorna o proprio recurso quando autorizado (permite encadear).
// Lanca:
//   404 quando resource e null/undefined (recurso inexistente)
//   403 quando existe mas nao pertence ao requisitante
function assertOwnership(resource, auth) {
  if (resource === null || resource === undefined) {
    const error = new Error("Recurso nao encontrado.");
    error.statusCode = 404;
    throw error;
  }
  if (!ownsResource(resource, auth)) {
    const error = new Error("Acesso negado a este recurso.");
    error.statusCode = 403;
    throw error;
  }
  return resource;
}

// Retorna apenas os itens da lista que pertencem ao requisitante.
// Itens nulos ou nao-pertencentes sao descartados silenciosamente.
function filterOwned(list, auth) {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => ownsResource(item, auth));
}

module.exports = { assertOwnership, filterOwned, ownsResource };
