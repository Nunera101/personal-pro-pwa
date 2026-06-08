// services.js — camada de serviços MOCK
// Todas as funções retornam Promises com dados de exemplo.
// Para ligar à API real, substitua o corpo de cada função por uma chamada a src/api.js
// (ex: return api.post('/alunos', payload)) e apague o bloco de stub abaixo dela.
//
// PONTO DE TROCA: cada função tem um comentário "→ API: <método> <rota>" indicando
// o endpoint que deverá substituí-la no BLOCO 3.

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ─── ALUNOS ──────────────────────────────────────────────────────────────────

// → API: POST /alunos
export async function createAluno(payload) {
  await delay();
  return { id: 'aluno-001', nome: payload.nome ?? 'Aluno Demo', email: payload.email ?? 'demo@example.com', ...payload };
}

// → API: POST /alunos/:id/link-acesso
export async function gerarLink(alunoId) {
  await delay();
  return { url: `https://app.personalpro.com/acesso/${alunoId}?token=demo-token-abc` };
}

// → API: POST /alunos/:id/whatsapp
export async function enviarWhatsApp(alunoId, mensagem) {
  await delay();
  return { sucesso: true, alunoId, preview: mensagem?.slice(0, 60) ?? '' };
}

// ─── AGENDA ──────────────────────────────────────────────────────────────────

// → API: POST /eventos
export async function createEvento(payload) {
  await delay();
  return { id: 'evento-001', titulo: payload.titulo ?? 'Evento Demo', data: payload.data ?? new Date().toISOString(), ...payload };
}

// → API: PUT /eventos/:id
export async function updateEvento(eventoId, payload) {
  await delay();
  return { id: eventoId, ...payload };
}

// ─── TREINOS / PADRÕES ────────────────────────────────────────────────────────

// → API: POST /padroes
export async function savePadrao(payload) {
  await delay();
  return { id: 'padrao-001', nome: payload.nome ?? 'Padrão Demo', itens: [], ...payload };
}

// → API: POST /alunos/:id/aplicar-padrao
export async function aplicarPadrao(alunoId, padraoId) {
  await delay();
  return { sucesso: true, alunoId, padraoId, aplicadoEm: new Date().toISOString() };
}

// ─── EXERCÍCIOS ──────────────────────────────────────────────────────────────

// → API: POST /exercicios
export async function saveExercicio(payload) {
  await delay();
  return { id: 'exercicio-001', nome: payload.nome ?? 'Exercício Demo', grupo: payload.grupo ?? 'Peito', ...payload };
}

// → API: POST /exercicios/:id/video
export async function uploadVideo(exercicioId, arquivo) {
  await delay(600);
  return { exercicioId, videoUrl: `https://cdn.personalpro.com/videos/${exercicioId}/demo.mp4` };
}

// → API: POST /padroes/:id/itens
export async function addItemPadrao(padraoId, item) {
  await delay();
  return { id: `item-${Date.now()}`, padraoId, ...item };
}

// ─── CONTRATOS ───────────────────────────────────────────────────────────────

// → API: POST /contratos
export async function savePlano(payload) {
  await delay();
  return { id: 'contrato-001', descricao: payload.descricao ?? 'Plano Demo', valor: payload.valor ?? 0, ...payload };
}

// → API: POST /contratos/:id/enviar
export async function enviarAssinatura(contratoId) {
  await delay();
  return { sucesso: true, contratoId, enviadoEm: new Date().toISOString() };
}

// → API: POST /contratos/:id/reenviar
export async function reenviarAssinatura(contratoId) {
  await delay();
  return { sucesso: true, contratoId, reenviado: true, enviadoEm: new Date().toISOString() };
}

// → API: GET /contratos/:id/pdf
export async function gerarPdf(contratoId) {
  await delay(500);
  return { url: `https://cdn.personalpro.com/contratos/${contratoId}/contrato.pdf` };
}

// ─── FINANCEIRO ──────────────────────────────────────────────────────────────

// → API: POST /pagamentos
export async function registrarPagamento(payload) {
  await delay();
  return { id: `pag-${Date.now()}`, status: 'pago', data: new Date().toISOString(), ...payload };
}

// → API: GET /mensalidades/:alunoId
export async function getMensalidade(alunoId) {
  await delay();
  return {
    alunoId,
    valor: 350,
    vencimento: '2026-07-05',
    status: 'pendente',
    historico: [
      { mes: '2026-06', valor: 350, pago: true },
      { mes: '2026-05', valor: 350, pago: true },
    ],
  };
}

// → API: POST /mensalidades/:alunoId/cobrar
export async function cobrar(alunoId, payload) {
  await delay();
  return { sucesso: true, alunoId, cobrancaId: `cob-${Date.now()}`, ...payload };
}

// → API: GET /pagamentos/:pagamentoId/recibo
export async function gerarRecibo(pagamentoId) {
  await delay(400);
  return { url: `https://cdn.personalpro.com/recibos/${pagamentoId}/recibo.pdf` };
}

// → API: GET /relatorios/exportar?tipo=:tipo
export async function exportarRelatorio(tipo = 'financeiro', filtros = {}) {
  await delay(700);
  return { url: `https://cdn.personalpro.com/relatorios/${tipo}-${Date.now()}.xlsx`, tipo, filtros };
}

// ─── CHAT / MENSAGENS ────────────────────────────────────────────────────────

// → API: POST /mensagens
export async function enviarMensagem(payload) {
  await delay();
  return { id: `msg-${Date.now()}`, status: 'enviada', criadaEm: new Date().toISOString(), ...payload };
}
