# RELATÓRIO DE AUDITORIA — ISOLAMENTO DE DADOS

**Data:** 2026-06-13
**Escopo:** Leitura de código sem alteração — apenas diagnóstico
**Cobertura:** Treino · Dieta · Agenda · Mensagens · Progresso · Perfil · Contrato · Financeiro · Biblioteca · Padrões

---

## Metodologia

Para cada área verificou-se:
1. Se leituras e escritas filtram pelo dono correto (trainerId / studentId)
2. Se há estado global que mistura dados de usuários distintos
3. Se aplicar treino/plano gera cópia independente ou referência compartilhada
4. Se um usuário consegue acessar dado de outro via ID manipulado (IDOR)

Legenda de severidade: **CRÍTICO** · **ALTO** · **MÉDIO** · **BAIXO**

---

## Sumário Executivo

| Severidade | Achados |
|:---:|:---:|
| CRÍTICO | 14 |
| ALTO | 4 |
| MÉDIO | 3 |
| **Total** | **21** |

O sistema armazena dados em JSON via coleções em memória. O backend filtra coleções por role em `sanitizeCollection()`, mas o frontend opera sobre `state.data` com todos os registros carregados — e a maioria das funções getter/setter **não verifica propriedade** antes de agir, abrindo IDOR direto pelo console do navegador ou por URL manipulada.

---

## 1. TREINO

### R-01 — `getWorkout()` não valida `studentId` — **CRÍTICO**

**Arquivo:** `app.js:1390-1392`

```js
function getWorkout(id) {
  return state.data.workouts.find(
    (workout) => workout.id === id && workout.trainerId === TRAINER_ID
  );
}
```

Filtra apenas por `trainerId`. Um aluno autenticado pode passar qualquer `id` e obter o objeto de treino de outro aluno. Todas as funções abaixo derivam de `getWorkout()` e herdam a falha:

| Função derivada | Linha | Impacto |
|---|---|---|
| `deleteWorkout()` | `~12957` | deleta treino alheio |
| `duplicateWorkout()` | `~12901` | copia treino alheio |
| `publishWorkout()` | `~12924` | publica rascunho alheio |
| `archiveWorkout()` | `~12936` | arquiva treino alheio |
| `handleWorkoutForm()` | `~11023` | sobrescreve treino alheio |

**Recomendação:** Adicionar guarda de role em `getWorkout()`:

```js
if (state.currentUser?.role === "student"
    && workout.studentId
    && workout.studentId !== state.currentUser.studentId) {
  return null;
}
```

---

### R-02 — `handleWorkoutForm()` aceita `studentId` arbitrário do formulário — **CRÍTICO**

**Arquivo:** `app.js:11023`

```js
const old = getWorkout(id);   // sem guarda de propriedade
const studentId = String(data.get("studentId") || "");
```

Um aluno pode editar o DOM do formulário, injetar `studentId` de outro aluno e salvar. O backend persiste sem re-validar.

**Recomendação:** No formulário, fixar `studentId` com o valor autenticado do servidor; nunca confiar no campo vindo do cliente.

---

### R-03 — `duplicateWorkout()` copia treino de outro aluno — **CRÍTICO**

**Arquivo:** `app.js:12900-12922`

Chama `getWorkout(id)` sem verificar propriedade. A cópia gerada recebe o `studentId` do original, podendo depois ser reatribuída.

**Recomendação:** Bloquear antes de duplicar:

```js
if (state.currentUser?.role === "student"
    && workout.studentId !== state.currentUser.studentId) {
  return showToast("Treino indisponível.");
}
```

---

## 2. DIETA

### R-04 — `getDietPlan()` não valida `studentId` — **CRÍTICO**

**Arquivo:** `app.js:1908-1910`

```js
function getDietPlan(planId) {
  return state.data.diets.find(
    (plan) => plan.id === planId && plan.trainerId === TRAINER_ID
  );
}
```

Mesma estrutura de R-01. Funções derivadas:

| Função | Linha | Impacto |
|---|---|---|
| `openDietPlanDetail()` | `~8933` | lê plano alheio |
| `openDietPlanForm()` | `~8899` | edita plano alheio |
| `openMealPlanBuilder()` | `~9097` | edita refeições alheias |
| `handleDietForm()` | `~11140` | sobrescreve plano alheio |

**Recomendação:** Mesma guarda de role que R-01, aplicada em `getDietPlan()`.

---

### R-05 — `handleDietForm()` aceita `studentId` do cliente — **CRÍTICO**

**Arquivo:** `app.js:11140-11184`

```js
const old = getDietPlan(id);                         // sem guarda
const studentId = String(data.get("studentId") || ""); // controlado pelo cliente
```

**Recomendação:** Ver R-02.

---

### R-06 — Aplicar plano gera referência, não cópia independente — **ALTO**

Quando um plano padrão (`studentId` vazio) é "aplicado" a um aluno, o código apenas define `studentId` no objeto existente em vez de cloná-lo. Se o plano-pai for editado, todos os alunos que o receberam são afetados retroativamente.

**Recomendação:** Ao aplicar, sempre fazer `deepClone()` do plano e gerar novo `id` para a cópia.

---

## 3. AGENDA

### R-07 — `deleteActivity()` não valida propriedade — **CRÍTICO**

**Arquivo:** `app.js:13020-13025`

```js
function deleteActivity(id) {
  if (!confirm("Remover este item da agenda?")) return;
  state.data.activities = state.data.activities.filter(
    (activity) => activity.id !== id
  );
  persistData();
}
```

Qualquer usuário autenticado apaga qualquer atividade pelo ID.

**Recomendação:**

```js
const activity = state.data.activities.find((a) => a.id === id);
if (state.currentUser?.role === "student"
    && activity?.studentId !== state.currentUser.studentId) {
  return showToast("Atividade indisponível.");
}
```

---

### R-08 — `openAgendarSheet()` edita atividade alheia — **CRÍTICO**

**Arquivo:** `app.js:8735-8776`

```js
function openAgendarSheet(activityId = "", prefillStudentId = "") {
  const activity = state.data.activities.find(
    (item) => item.id === activityId
  ) || {};
  // Sem verificação de propriedade
```

Um aluno pode abrir a sheet de edição de qualquer atividade agendada via DevTools.

**Recomendação:** Adicionar guarda logo após o `find()`.

---

## 4. MENSAGENS

### R-09 — Realtime permite forjar `studentId` do remetente — **MÉDIO**

**Arquivo:** `server/realtime.js:68-106`

```js
studentId: session.role === "student"
  ? session.studentId
  : payload.studentId,   // manager pode injetar studentId arbitrário
```

Um gerenciador pode enviar mensagens fingindo ser qualquer aluno.

**Recomendação:** Validar que `payload.studentId` pertence ao trainer antes de persistir:

```js
if (session.role === "manager" && payload.studentId) {
  const students = await readCollection(STUDENTS_KEY, []);
  if (!students.find((s) => s.id === payload.studentId)) {
    return callback({ ok: false, error: "Aluno não encontrado." });
  }
}
```

---

## 5. PROGRESSO

### R-10 — `markUpdateViewed()` não valida propriedade — **CRÍTICO**

**Arquivo:** `app.js:13256-13264`

```js
function markUpdateViewed(id) {
  const update = state.data.updates.find((item) => item.id === id);
  if (!update || update.status === "pending") return;
  update.status = "viewed";
  persistData();
}
```

Um aluno pode marcar registros de progresso de outros alunos como "visto".

**Recomendação:** Verificar `update.studentId === state.currentUser.studentId` antes de mutar.

---

### R-11 — `handleUpdateComment()` permite aluno comentar como gestor — **CRÍTICO**

**Arquivo:** `app.js:11365-11376`

```js
const update = state.data.updates.find((item) => item.id === form.dataset.id);
if (!update) return;
update.trainerComment = String(
  new FormData(form).get("trainerComment") || ""
).trim();
```

Não verifica role nem propriedade. Um aluno pode escrever `trainerComment` em qualquer registro, inclusive de outro aluno.

**Recomendação:**

```js
if (state.currentUser?.role !== "manager") {
  return showToast("Ação restrita ao gestor.");
}
```

---

## 6. PERFIL

### R-12 — IDOR via URL hash — **MÉDIO**

**Arquivo:** `app.js:1476-1495`

`applyRouteFromHash()` aceita `studentId` da URL sem limite além do `trainerId`. Um gerenciador pode digitar `#student/QUALQUER_ID` e visualizar qualquer perfil.

**Recomendação:** Confirmar que o student encontrado pertence ao trainer autenticado (já feito em `getStudent()`). Registrar a tentativa em log de auditoria caso o ID não pertença ao trainer.

---

### R-13 — Upload de foto não valida JWT duplo — **ALTO**

**Arquivo:** `server/routes/uploads.js:139-180` (linha `~164`)

```js
const idx = students.findIndex((s) => s.id === auth.studentId);
```

Se o JWT for forjado com `studentId` de outro aluno (chave secreta comprometida), a foto é salva no perfil errado sem segunda checagem.

**Recomendação:** Usar JWT com expiração curta (< 15 min) e assinar com secret rotativo.

---

## 7. CONTRATO

### R-14 — `mergeStudentContracts()` vaza contratos de outros alunos — **CRÍTICO**

**Arquivo:** `server/routes/api.js:202-222` (linha `~206`)

```js
return existing.map((contract) => {
  const next = incomingById.get(String(contract.id || ""));
  if (!next || contract.studentId !== auth.studentId) return contract;
  // BUG: contratos de outros alunos passam inalterados
  // em vez de serem excluídos do resultado
```

A intenção é retornar apenas contratos do aluno, mas a lógica retorna o objeto original quando o contrato não está no payload incoming — incluindo contratos de outros alunos.

**Recomendação:** Substituir `map` por `filter` + `map`:

```js
return existing
  .filter((c) => c.studentId === auth.studentId)
  .map((contract) => {
    const next = incomingById.get(String(contract.id || ""));
    return next ? { ...contract, ...next } : contract;
  });
```

---

### R-15 — Upload de PDF de contrato sem validação de propriedade — **ALTO**

**Arquivo:** `server/routes/uploads.js:111-137`

```js
const contractId = String(request.body.contractId || "contract");
// Sem verificar se contractId pertence ao trainer autenticado
```

Um gerenciador pode fazer upload de PDF para qualquer `contractId`, sobrescrevendo contrato de outro trainer.

**Recomendação:** Consultar a coleção de contratos e confirmar `contract.trainerId === auth.trainerId` antes de aceitar o arquivo.

---

## 8. FINANCEIRO

### R-16 — `openPaymentForm()` expõe pagamentos de outros alunos — **CRÍTICO**

**Arquivo:** `app.js:10340-10350` (linha `~10341`)

```js
const payment = paymentId
  ? state.data.payments.find((item) => item.id === paymentId)
  : null;
// Sem verificação de propriedade
```

Um aluno que conheça o `paymentId` de outro aluno abre o formulário com os dados dele.

**Recomendação:**

```js
if (payment && state.currentUser?.role === "student"
    && payment.studentId !== state.currentUser.studentId) {
  return showToast("Pagamento indisponível.");
}
```

---

### R-17 — `handlePaymentFormSheet()` não valida propriedade cruzada — **CRÍTICO**

**Arquivo:** `app.js:10410-10465` (linha `~10414`)

```js
const old = paymentId
  ? state.data.payments.find((item) => item.id === paymentId)
  : null;
// old pode pertencer a studentId diferente do formulário
```

Um manager pode editar um pagamento e trocar o `studentId` no formulário, reatribuindo-o a outro aluno.

**Recomendação:** Confirmar `old.studentId === studentId` antes de sobrescrever.

---

## 9. BIBLIOTECA / PADRÕES

### R-18 — `sanitizeCollection()` não filtra exercícios referenciados — **MÉDIO**

**Arquivo:** `server/routes/api.js:168-170`

```js
if (collection === WORKOUTS_KEY) {
  return value.filter(
    (item) => item.studentId === auth.studentId && item.status === "published"
  );
}
```

Treinos publicados de outros alunos aparecem se estiverem na `EXERCISES_KEY` como referência, pois essa coleção não tem filtro equivalente.

**Recomendação:** Aplicar filtro por `trainerId` e verificar se o aluno tem permissão explícita de leitura na biblioteca.

---

### R-19 — DELETE de coleção sem verificação de dono — **CRÍTICO**

**Arquivo:** `server/routes/api.js:912-935`

```js
router.delete("/collections/:collection/:id", requireAuth, async (req, res, next) => {
  const updated = existing.filter(
    (item) => String(item.id || "") !== String(id)
  );
  await writeCollection(collection, updated);
```

Não verifica se o item pertence ao usuário autenticado. Um aluno pode deletar qualquer item de qualquer coleção (treinos, atividades, mensagens, contratos, progresso de outros alunos) informando o ID correto.

**Recomendação:**

```js
if (auth.role === "student") {
  const item = existing.find((i) => String(i.id) === String(id));
  if (!item || item.studentId !== auth.studentId) {
    return response.status(403).json({ error: "Acesso negado." });
  }
}
```

---

## 10. ESTADO GLOBAL FRONTEND

### R-20 — `state.data` carrega todos os registros do trainer — **ALTO**

**Arquivo:** `app.js:40-50`

```js
const state = {
  currentUser: null,
  activeStudentProfileId: "",
  data: {
    students: [],
    workouts: [],
    activities: [],
    diets: [],
    payments: [],
    // ... demais coleções
  }
};
```

O frontend recebe e armazena em memória todos os dados do trainer. Um aluno abre o DevTools e acessa `state.data.students`, `state.data.payments` etc. de qualquer colega.

O backend já faz `sanitizeCollection()`, mas os dados de alunos diferentes ficam todos acessíveis a qualquer aluno via console.

**Recomendação (curto prazo):** Garantir que o backend entregue apenas os dados do aluno autenticado na rota `/collections/:collection` — já parcialmente implementado, mas com as lacunas apontadas nos itens anteriores.

**Recomendação (longo prazo):** Migrar para API REST com endpoints dedicados por recurso e filtros SQL, eliminando o modelo de "dump de coleção".

---

### R-21 — `activeStudentProfileId` manipulável — **MÉDIO**

**Arquivo:** `app.js:1495, 7881, 7913`

O ID do perfil ativo é lido de `state` ou da URL hash. Um gerenciador pode mudar `state.activeStudentProfileId` via DevTools e visualizar perfil de qualquer aluno. Embora `getStudent()` valide `trainerId`, não há log de auditoria para acessos suspeitos.

**Recomendação:** Registrar no servidor cada acesso a perfil de aluno, associado ao usuário autenticado.

---

## Matriz de Risco Consolidada

| ID | Área | Arquivo:Linha | Tipo | Severidade |
|---|---|---|---|---|
| R-01 | Treino | `app.js:1390` | IDOR getter | CRÍTICO |
| R-02 | Treino | `app.js:11023` | Injeção de studentId | CRÍTICO |
| R-03 | Treino | `app.js:12901` | IDOR duplicação | CRÍTICO |
| R-04 | Dieta | `app.js:1908` | IDOR getter | CRÍTICO |
| R-05 | Dieta | `app.js:11140` | Injeção de studentId | CRÍTICO |
| R-06 | Dieta | `app.js:~9097` | Referência sem cópia | ALTO |
| R-07 | Agenda | `app.js:13020` | IDOR delete | CRÍTICO |
| R-08 | Agenda | `app.js:8735` | IDOR edição | CRÍTICO |
| R-09 | Mensagens | `server/realtime.js:68` | Forja de remetente | MÉDIO |
| R-10 | Progresso | `app.js:13256` | IDOR mutação | CRÍTICO |
| R-11 | Progresso | `app.js:11365` | Escalada de role | CRÍTICO |
| R-12 | Perfil | `app.js:1476` | IDOR via URL | MÉDIO |
| R-13 | Perfil | `server/routes/uploads.js:164` | JWT fraco | ALTO |
| R-14 | Contrato | `server/routes/api.js:206` | Vazamento de registros | CRÍTICO |
| R-15 | Contrato | `server/routes/uploads.js:111` | IDOR upload | ALTO |
| R-16 | Financeiro | `app.js:10341` | IDOR leitura | CRÍTICO |
| R-17 | Financeiro | `app.js:10414` | IDOR escrita | CRÍTICO |
| R-18 | Biblioteca | `server/routes/api.js:168` | Filtro incompleto | MÉDIO |
| R-19 | Padrões/Geral | `server/routes/api.js:912` | IDOR delete global | CRÍTICO |
| R-20 | Geral | `app.js:40` | Estado global exposto | ALTO |
| R-21 | Geral | `app.js:1495` | profileId manipulável | MÉDIO |

---

## Recomendações Gerais (prioridade decrescente)

1. **Corrigir R-19 imediatamente** — o DELETE global sem verificação de dono é o vetor de maior destruição (um aluno apaga dados de qualquer colega com uma chamada).
2. **Adicionar guarda em `getWorkout()` e `getDietPlan()`** — resolve R-01 a R-05 em cascata.
3. **Corrigir `mergeStudentContracts()`** (R-14) — trocar `map` por `filter + map`.
4. **Corrigir `deleteActivity()`** (R-07) e `openAgendarSheet()`** (R-08).
5. **Bloquear `handleUpdateComment()` por role** (R-11) — impede aluno de forjar avaliação do gestor.
6. **Validar `studentId` em `openPaymentForm()` e `handlePaymentFormSheet()`** (R-16, R-17).
7. **Clonar ao aplicar plano/treino padrão** (R-06) — evita efeitos retroativos.
8. **Adicionar log de auditoria** no servidor para todos os acessos a dados de aluno.
9. **Migrar para endpoints REST por recurso** com `WHERE student_id = $1 AND trainer_id = $2` — elimina a raiz arquitetural dos vazamentos.
