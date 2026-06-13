// Camada de escopo de dados — preparada para filtro por dono (multi-personal).
//
// ESTADO ATUAL: escopo global (type:'global') — todas as leituras retornam todos os dados,
// preservando o comportamento existente sem nenhuma mudança funcional.
//
// COMO ATIVAR MULTI-PERSONAL (uma única mudança aqui basta):
//   Em getDataScope, substituir a linha ativa pela linha comentada abaixo dela.
//   filterByOwner e splitByOwner passam a filtrar por professionalId automaticamente.
//
// Pontos centralizados que já passam por estas funções:
//   routes/api.js → readCollectionForAuth       usa filterByOwner (leitura autenticada principal)
//   routes/api.js → DELETE /collections/:id     usa splitByOwner  (preserva dados de outros donos)
//   routes/api.js → writeCollectionForAuth      marcado com comentário MULTI-PERSONAL para ativação futura

// Coleções que serão filtradas por professionalId quando multi-personal for ativado.
// EXERCISES_KEY (biblioteca compartilhada entre trainers) e SETTINGS_KEY (singleton de objeto) ficam fora.
const OWNER_SCOPED_COLLECTIONS = new Set([
  "personal-pro-students-v2",
  "personal-pro-workouts-v3",
  "personal-pro-activities-v2",
  "personal-pro-training-sessions-v1",
  "personal-pro-updates-v1",
  "personal-pro-contracts-v1",
  "personal-pro-messages-v1",
  "personal-pro-payments-v1",
  "personal-pro-diets-v1"
]);

// Retorna o escopo de dados para uma requisição autenticada.
// type:'global' = sem filtro por dono (comportamento atual).
// Para ativar multi-personal: trocar pela linha comentada abaixo.
function getDataScope(auth) {
  return { type: "global", ownerId: auth?.trainerId || null };
  // return { type: "owned", ownerId: auth?.trainerId || null };
}

// Separa um array em { ownerItems, otherItems } baseado no escopo.
// Com escopo global: ownerItems = todos os itens, otherItems = [].
// Com escopo 'owned': filtra por professionalId === scope.ownerId.
// Usado em operações de escrita para preservar itens de outros donos ao salvar.
function splitByOwner(items, scope, collectionName) {
  if (!Array.isArray(items)) return { ownerItems: items, otherItems: [] };
  if (scope.type !== "owned" || !OWNER_SCOPED_COLLECTIONS.has(collectionName)) {
    return { ownerItems: items, otherItems: [] };
  }
  return {
    ownerItems: items.filter((item) => item.professionalId === scope.ownerId),
    otherItems: items.filter((item) => item.professionalId !== scope.ownerId)
  };
}

// Retorna apenas os itens pertencentes ao dono do escopo.
// Com escopo global: retorna tudo sem filtro (comportamento atual).
function filterByOwner(items, scope, collectionName) {
  return splitByOwner(items, scope, collectionName).ownerItems;
}

// Carimba professionalId do dono em um item novo ao ser criado.
// Com escopo global: retorna o item sem modificação (comportamento atual).
function stampOwner(item, scope) {
  if (scope.type !== "owned") return item;
  return { ...item, professionalId: scope.ownerId };
}

module.exports = { getDataScope, filterByOwner, splitByOwner, stampOwner, OWNER_SCOPED_COLLECTIONS };
