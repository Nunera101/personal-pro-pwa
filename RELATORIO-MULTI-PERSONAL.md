# Relatório de Migração: Multi-Personal (Multi-Tenant)

**Data:** 2026-06-13  
**Escopo:** mapeamento de tudo que precisa mudar para o app aceitar vários personais com dados isolados  
**Alterações de código:** nenhuma neste documento

---

## 1. Diagnóstico — raiz do problema

O sistema é single-tenant por constante hardcoded em três pontos:

| Arquivo | Linha | Declaração |
|---|---|---|
| `app.js` | 2 | `const TRAINER_ID = "trainer-demo"` |
| `server/auth.js` | 4 | `const TRAINER_ID = "trainer-demo"` |
| `server/routes/api.js` | 20 | `const TRAINER_ID = "trainer-demo"` |

Toda query ao banco e todo acesso ao storage em `app_collections` usa este ID fixo. Remover esses três hardcodes (e dar suporte a um `trainerId` real por sessão) é o núcleo da migração.

---

## 2. Coleções / tabelas que precisam de vínculo `trainer_id`

### 2.1 Banco de dados PostgreSQL

Esquema definido em `server/migrations/001_initial.sql`.  
Todas as tabelas abaixo **já possuem `trainer_id` como FK** no schema, mas as queries nunca filtram por ele (usam o hardcode).

| Tabela | Campo isolador | Index existente | Linhas do schema |
|---|---|---|---|
| `students` | `trainer_id FK→trainers.id NOT NULL CASCADE` | `students_trainer_id_idx` (ln 198) | 34–46 |
| `exercises` | `trainer_id FK→trainers.id NOT NULL CASCADE` | `exercises_trainer_id_status_idx` (ln 199) | 48–65 |
| `workouts` | `trainer_id FK→trainers.id NOT NULL CASCADE` | `workouts_trainer_student_idx` (ln 200) | 67–81 |
| `activities` | `trainer_id FK→trainers.id NOT NULL CASCADE` | `activities_trainer_date_idx` (ln 202) | 83–98 |
| `workout_sessions` | `trainer_id FK→trainers.id NOT NULL CASCADE` | — | 100–113 |
| `updates` | `trainer_id FK→trainers.id NOT NULL CASCADE` | — | 115–134 |
| `contracts` | `trainer_id FK→trainers.id NOT NULL CASCADE` | — | 136–151 |
| `messages` | `trainer_id FK→trainers.id NOT NULL CASCADE` | `messages_student_created_idx` (ln 207) | 153–161 |
| `media_uploads` | `trainer_id FK→trainers.id SET NULL` | — | 163–173 |
| `audit_logs` | `trainer_id FK→trainers.id SET NULL` | — | 175–185 |
| `videos` | `trainer_id text` | — | `003_videos_bytea.sql:4` |

**Coleções que NÃO têm `trainer_id` e precisam receber:**

| Tabela | Problema | Localização |
|---|---|---|
| `app_collections` | Armazenamento JSON de fallback totalmente global — sem nenhum campo de isolamento | `001_initial.sql:3–7` |
| `trainers.settings` | Configurações do sistema (senhaHash admin, nome, foto) num único JSONB por trainers.id — ok se houver um row por trainer, mas hoje há só um | `001_initial.sql:9–18` |

### 2.2 Arquivos JSON de fallback (`data/`)

Usados quando o Postgres não está disponível. Nenhum tem `trainer_id` no nome ou no conteúdo:

| Arquivo | Coleção |
|---|---|
| `data/personal-pro-students-v2.json` | alunos |
| `data/personal-pro-exercises-v1.json` | biblioteca de exercícios |
| `data/personal-pro-workouts-v3.json` | treinos |
| `data/personal-pro-activities-v2.json` | agenda |
| `data/personal-pro-training-sessions-v1.json` | sessões |
| `data/personal-pro-updates-v1.json` | avaliações |
| `data/personal-pro-contracts-v1.json` | contratos |
| `data/personal-pro-messages-v1.json` | mensagens |
| `data/personal-pro-payments-v1.json` | financeiro |
| `data/personal-pro-diets-v1.json` | dietas |
| `data/personal-pro-settings-v1.json` | configurações |

### 2.3 Estado em memória no frontend (`app.js`)

```
app.js:43–103  — objeto `state`
app.js:90      — state.data.students   = []
app.js:91      — state.data.exercises  = []
app.js:92      — state.data.workouts   = []
app.js:93      — state.data.activities = []
app.js:94      — state.data.sessions   = []
app.js:95      — state.data.updates    = []
app.js:96      — state.data.contracts  = []
app.js:97      — state.data.messages   = []
app.js:98      — state.data.payments   = []
app.js:99      — state.data.diets      = []
app.js:100     — state.data.settings   = {}
```

Todos globais em memória: o navegador carrega **tudo** que o servidor devolveu sem filtro adicional no cliente. O isolamento real precisa acontecer no servidor.

### 2.4 Mapeamento nome-frontend → nome-collection (`app.js:29–41`)

```
app.js:30  ["students",  "personal-pro-students-v2"]
app.js:31  ["exercises", "personal-pro-exercises-v1"]
app.js:32  ["workouts",  "personal-pro-workouts-v3"]
app.js:33  ["activities","personal-pro-activities-v2"]
app.js:34  ["sessions",  "personal-pro-training-sessions-v1"]
app.js:35  ["updates",   "personal-pro-updates-v1"]
app.js:36  ["contracts", "personal-pro-contracts-v1"]
app.js:37  ["messages",  "personal-pro-messages-v1"]
app.js:38  ["payments",  "personal-pro-payments-v1"]
app.js:39  ["diets",     "personal-pro-diets-v1"]
app.js:40  ["settings",  "personal-pro-settings-v1"]
```

---

## 3. Onde dados são lidos e escritos

### 3.1 Frontend → API

| Função | Operação | Arquivo:linha |
|---|---|---|
| `fetchJsonFromApi()` | GET/PUT/POST genérico | `app.js:394–431` |
| `readRemoteCollection()` | GET `/collections/:name` | `app.js:433–436` |
| `writeRemoteCollection()` | PUT `/collections/:name` | `app.js:438–445` |
| `readRemoteCollections()` | GET paralelo de todas as 11 coleções | `app.js:447–459` |
| fetch direto `/videos` | POST multipart (vídeo exercício) | `app.js:2072` |
| fetch direto `/uploads/contracts` | POST PDF contrato | `app.js:9662`, `app.js:9799` |
| fetch direto `/uploads/profile` | POST foto perfil | `app.js:11328–11329` |
| fetch direto `/push/vapid-public-key` | GET (público) | `app.js:11937` |
| fetch direto `/push/subscribe` | POST/DELETE subscription | `app.js:11966–11967` |

### 3.2 Rotas do servidor — leitura/escrita de coleções

Arquivo principal: `server/routes/api.js`

| Rota | Método | Autenticação | Acesso | Linha |
|---|---|---|---|---|
| `GET /collections/:collection` | GET | `requireAuth` | `sanitizeCollection()` — lê tudo, filtra por studentId se role=student | 894–900 |
| `PUT /collections/:collection` | PUT | `requireAuth` | `writeCollectionForAuth()` — sobrescreve coleção inteira | 902–910 |
| `DELETE /collections/:collection/:id` | DELETE | `requireAuth` + `requireManager` para students | Remove item por id sem checar trainer ownership | 912–935 |
| `GET /:collection` | GET | `requireAuth` | Alias para o GET acima | 988–994 |
| `PUT /:collection` | PUT | `requireAuth` | Alias para o PUT acima | 996–1004 |
| `GET /profile` | GET | `requireAuth` | Manager → settings / Student → seu registro | 937–959 |
| `PUT /profile` | PUT | `requireAuth` | Manager → settings / Student → telefone | 961–986 |

### 3.3 Rotas de autenticação

| Rota | Arquivo:linha | Acesso a dados |
|---|---|---|
| `POST /auth/login` | `api.js:506–566` | Lê `settings.adminPasswordHash` e `students[]` por email — sem filtro trainer |
| `POST /auth/forgot-password` | `api.js:568–599` | Busca usuário por email sem filtro trainer |
| `POST /auth/student-invite` | `api.js:601–662` | requireManager — cria convite para students[] |
| `POST /auth/contract-link` | `api.js:664–727` | requireManager — busca contrato por id sem filtro trainer |
| `POST /auth/contract-token` | `api.js:729–757` | Público (token) — busca contrato por token |
| `POST /auth/student-area-link` | `api.js:759–780` | requireManager — gera link de área do aluno |
| `POST /auth/student-area-view` | `api.js:782–849` | Público (token) — devolve workouts/diets/updates/sessions do aluno SEM filtro trainer |
| `POST /auth/reset-password` | `api.js:862–892` | Rate-limited — reset de senha sem filtro trainer |

### 3.4 Rotas de upload e vídeo

| Rota | Arquivo:linha | Acesso |
|---|---|---|
| `POST /api/uploads/exercises` | `server/routes/uploads.js:74–109` | requireManager — salva em media_uploads com trainer_id da sessão |
| `POST /api/uploads/contracts` | `server/routes/uploads.js:111–137` | requireManager |
| `POST /api/uploads/profile` | `server/routes/uploads.js:139–180` | requireAuth |
| `POST /api/videos` | `server/routes/videos.js:19–47` | requireManager — insere em videos com trainer_id da sessão |
| `GET /api/videos/:id` | `server/routes/videos.js:49–93` | Público — sem verificação de trainer ownership |

### 3.5 Autenticação e sessão

| Função | Arquivo:linha | Relevância |
|---|---|---|
| `createSessionToken()` | `server/auth.js:11–25` | Gera JWT com `trainerId` + `studentId` + `role` — estrutura ok para multi-tenant |
| `verifySessionToken()` | `server/auth.js:27–33` | Valida JWT |
| `requireAuth()` | `server/auth.js:41–49` | Popula `req.auth` com payload do JWT |
| `requireManager()` | `server/auth.js:51–59` | Verifica `req.auth.role === "manager"` |
| `bearerToken()` | `server/auth.js:35–39` | Extrai Authorization header |

**Payload JWT atual:**
```json
{ "role": "manager|student", "email": "...", "trainerId": "trainer-demo", "studentId": "" }
```
O campo `trainerId` já existe — o problema é que é preenchido com o hardcode.

### 3.6 Realtime (Socket.IO)

| Localização | Relevância |
|---|---|
| `server/realtime.js:58–65` | Registra conexão em rooms `trainer:${trainerId}` e `student:${studentId}` — usa `auth.trainerId \|\| TRAINER_ID` |

---

## 4. Consultas que precisarão de filtro `trainer_id`

Todas as queries de coleção passam por `sanitizeCollection()` e `writeCollectionForAuth()` em `server/routes/api.js`. Quando migradas para Postgres diretamente (e não via `app_collections`), cada uma precisará de `WHERE trainer_id = $trainerId`:

| Coleção | Operação | Localização atual | Filtro necessário |
|---|---|---|---|
| `students` | SELECT / UPDATE / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `exercises` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `workouts` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `activities` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `workout_sessions` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `updates` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `contracts` | SELECT / PUT / DELETE + `/auth/contract-link:664` | `api.js:894–935` | `WHERE trainer_id = $1` |
| `messages` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `payments` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `diets` | SELECT / PUT / DELETE | `api.js:894–935` via collection | `WHERE trainer_id = $1` |
| `settings` | GET/PUT `/profile` | `api.js:937–986` | Usar `trainers.settings WHERE id = $trainerId` |
| `app_collections` | fallback tudo | `api.js` (via `readCollection`/`writeCollection`) | Adicionar coluna `trainer_id` + `WHERE trainer_id = $1` |

**Queries adicionais sem filtro no fluxo de autenticação:**

| Consulta | Arquivo:linha | Filtro necessário |
|---|---|---|
| Login por e-mail de aluno | `api.js:536–553` | `WHERE email = $1 AND trainer_id = $trainerId` (mas trainer_id é desconhecido no login — ver seção 6) |
| Busca de contrato por token | `api.js:729–757` | `WHERE token = $1` (ok — token é único) |
| Área do aluno por token | `api.js:782–849` | `WHERE student_area_token = $1` (ok) + consultas derivadas precisam do trainer_id |
| Vídeo por id (`GET /api/videos/:id`) | `videos.js:49–93` | `WHERE id = $1 AND trainer_id = $trainerId` |
| Audit log | `api.js:257–266` | Já registra `trainer_id` — ok |

---

## 5. O que a área do Admin precisará ler

Hoje não existe uma área de super-admin (administrador da plataforma) distinta da área do personal manager. O login `admin@personalpro.app` (`api.js:515–539`) é simplesmente o personal manager do único tenant.

Para multi-personal, será necessário distinguir:

### 5.1 Papel "super-admin" (administrador da plataforma)

Precisará ler — sem filtro de `trainer_id`:

| Dado | Tabela | Finalidade |
|---|---|---|
| Lista de todos os trainers | `trainers` | Gerenciar contas de personal |
| Contagem de alunos por trainer | `students GROUP BY trainer_id` | Métricas de uso |
| Logs de auditoria globais | `audit_logs` | Monitoramento de segurança |
| Uso de storage | `media_uploads`, `videos` | Controle de custos |
| Status de pagamentos (planos SaaS) | Tabela nova a criar | Cobrança |

### 5.2 Papel "manager" (personal trainer — admin do próprio espaço)

Permanece como hoje, mas **todas as leituras precisam ser filtradas por `trainer_id = sessão.trainerId`**:

| Seção do app | Função frontend | Arquivo:linha |
|---|---|---|
| Home do gestor | `renderManagerHome()` | `app.js:~2900+` |
| Alunos | `renderManagerStudents()` | `app.js:~5800+` |
| Exercícios (biblioteca) | `renderManagerExercises()` | `app.js:~6500+` |
| Treinos | `renderManagerWorkouts()` | `app.js:~7500+` |
| Agenda | `renderManagerAgenda()` | `app.js:~6000+` |
| Avaliações | `renderManagerUpdates()` | `app.js:~6700+` |
| Contratos | `renderManagerContracts()` | `app.js:~9200+` |
| Financeiro | `renderManagerPayments()` | `app.js:~10300+` |
| Dietas | `renderManagerDiets()` | `app.js:~8500+` |
| Mensagens | `renderManagerMessages()` | `app.js:~10100+` |
| Configurações | `renderManagerSettings()` | `app.js:~12900+` |

Todas consomem de `state.data.*` que hoje é carregado sem filtro de trainer.

---

## 6. Problema especial: login de aluno

O login de aluno (`api.js:536–553`) busca o aluno **por e-mail** em toda a tabela `students`, sem saber de antemão qual trainer pertence. Dois problemas:

1. E-mails de alunos **podem se repetir entre trainers** diferentes → colisão.
2. Mesmo que únicos, o trainer_id precisa ser determinado nesse momento para gerar o JWT correto.

**Solução recomendada:** a busca deve ser `SELECT * FROM students WHERE email = $1` e, se encontrar, usar o `trainer_id` devolvido pelo próprio registro para montar o token — isso já funciona bem em multi-tenant sem precisar que o aluno informe o trainer.

---

## 7. Lacunas de segurança atuais (cross-tenant)

| Problema | Arquivo:linha | Risco |
|---|---|---|
| DELETE sem verificação de ownership | `api.js:912–935` | Personal A pode deletar aluno/treino do personal B se souber o id |
| PUT de coleção inteira sem ownership | `api.js:902–910` | Personal A sobrescreve coleção do personal B |
| GET de vídeo sem autenticação | `videos.js:49–93` | Qualquer pessoa com o id acessa vídeo de outro trainer |
| `auth/contract-link` sem filtro trainer | `api.js:664–727` | Manager pode gerar link para contrato de outro trainer |
| `app_collections` global | `001_initial.sql:3–7` | Fallback JSON expõe dados de todos os trainers indiscriminadamente |

---

## 8. Plano de migração em fases

### Fase 0 — Pré-requisito: criar tabela `trainers` com dados reais

**Objetivo:** sair do trainer demo e ter ao menos um trainer real.

| Passo | O que fazer | Arquivo alvo |
|---|---|---|
| 0.1 | Criar migration para inserir o trainer atual com `id = 'trainer-demo'`, `email`, `name`, senha hash (vindos de settings) | Nova migration `005_seed_trainer.sql` |
| 0.2 | Verificar que todos os registros existentes em `students`, `exercises`, etc. já têm `trainer_id = 'trainer-demo'` | Consulta de validação — não altera código |

---

### Fase 1 — Adicionar campo com default e popular

**Objetivo:** garantir que nenhum registro fique sem `trainer_id` antes de ativar filtros.

| Passo | O que fazer | Arquivo alvo | Arquivo:linha ref |
|---|---|---|---|
| 1.1 | Adicionar coluna `trainer_id` na tabela `app_collections` com `DEFAULT 'trainer-demo'` | Nova migration `006_app_collections_trainer.sql` | `001_initial.sql:3–7` |
| 1.2 | `UPDATE app_collections SET trainer_id = 'trainer-demo' WHERE trainer_id IS NULL` | Mesma migration | — |
| 1.3 | Adicionar `NOT NULL` + FK para `trainers.id` na coluna nova de `app_collections` | Mesma migration (segundo passo) | — |
| 1.4 | Popular `videos.trainer_id` onde estiver NULL com `'trainer-demo'` | Nueva migration `007_backfill_videos.sql` | `003_videos_bytea.sql:4` |
| 1.5 | Confirmar que `students`, `exercises`, `workouts`, `activities`, `workout_sessions`, `updates`, `contracts`, `messages`, `media_uploads`, `audit_logs` têm `trainer_id` preenchido | Script de validação em SQL | `001_initial.sql:34–185` |

---

### Fase 2 — Ativar filtro `trainer_id` no servidor

**Objetivo:** todas as queries passam a filtrar por `req.auth.trainerId` ao invés de usar a constante.

| Passo | O que fazer | Arquivo:linha |
|---|---|---|
| 2.1 | Remover `const TRAINER_ID = "trainer-demo"` e substituir por `req.auth.trainerId` em toda a rota | `server/routes/api.js:20` |
| 2.2 | Remover `const TRAINER_ID` de auth e usar o id real do trainer autenticado | `server/auth.js:4` |
| 2.3 | Remover `const TRAINER_ID` do frontend ou deixá-la vazia — cliente não deve confiar nela | `app.js:2` |
| 2.4 | Adicionar `WHERE trainer_id = $trainerId` em todas as queries de `app_collections` | `server/routes/api.js:894–935` |
| 2.5 | Adicionar `WHERE trainer_id = $trainerId` em `GET /api/videos/:id` | `server/routes/videos.js:49–93` |
| 2.6 | Adicionar `AND trainer_id = $trainerId` em busca de contrato por id | `server/routes/api.js:664–727` |
| 2.7 | No login de aluno, usar `trainer_id` do registro encontrado para montar o JWT (não mais a constante) | `server/routes/api.js:536–553` |
| 2.8 | No Socket.IO, usar `req.auth.trainerId` sem fallback para TRAINER_ID | `server/realtime.js:58–65` |
| 2.9 | Em `readRemoteCollections()` no frontend, nenhuma mudança de código — servidor já devolve filtrado | `app.js:447–459` |

---

### Fase 3 — Validar ownership em operações destrutivas

**Objetivo:** impedir que um trainer delete ou sobrescreva dados de outro.

| Passo | O que fazer | Arquivo:linha |
|---|---|---|
| 3.1 | Antes de DELETE em qualquer coleção, fazer `SELECT trainer_id FROM <tabela> WHERE id = $id` e comparar com `req.auth.trainerId` | `server/routes/api.js:912–935` |
| 3.2 | Antes de PUT em item individual, idem | `server/routes/api.js:902–910` |
| 3.3 | Adicionar autenticação `requireAuth` em `GET /api/videos/:id` e verificar `trainer_id` | `server/routes/videos.js:49–93` |
| 3.4 | Em `/auth/student-area-view`, confirmar que os dados devolvidos pertencem ao trainer do token | `server/routes/api.js:782–849` |

---

### Fase 4 — Cadastro de novos trainers e super-admin

**Objetivo:** permitir que a plataforma tenha múltiplos personais com login próprio.

| Passo | O que fazer | Arquivo:linha referência |
|---|---|---|
| 4.1 | Criar rota `POST /auth/trainer-signup` — registra novo trainer e cria row em `trainers` | Novo arquivo `server/routes/admin.js` |
| 4.2 | Login do personal passar a buscar em `trainers WHERE email = $1` (hoje busca em settings) | `server/routes/api.js:506–539` |
| 4.3 | Criar papel `superadmin` no JWT ou rota separada `/admin/*` protegida por env secret | Novo middleware |
| 4.4 | Rota de super-admin para listar trainers, métricas, logs — leitura global sem filtro `trainer_id` | `server/routes/admin.js` |
| 4.5 | No frontend, tela de settings do trainer ler/escrever de `trainers.settings WHERE id = trainerId` em vez de `app_collections["personal-pro-settings-v1"]` | `app.js:~12900+` |

---

## 9. Resumo de esforço por fase

| Fase | Tipo | Risco | Estimativa |
|---|---|---|---|
| 0 — seed trainer real | Migration + SQL | Baixo — não altera código | 1 dia |
| 1 — adicionar campo e popular | Migration + SQL | Baixo — não altera comportamento | 1 dia |
| 2 — ativar filtro no servidor | Alteração de código server/ | Médio — testável por tenant | 3–5 dias |
| 3 — validar ownership | Alteração de código server/ | Médio — segurança crítica | 2–3 dias |
| 4 — multi-trainer + super-admin | Novo código server/ + frontend | Alto — mudança de fluxo de auth | 5–7 dias |

**Total estimado:** 12–17 dias de desenvolvimento isolado, sem contar testes de regressão.

---

## 10. O que NÃO precisa mudar

- Schema das tabelas `students`, `exercises`, `workouts`, `activities`, `workout_sessions`, `updates`, `contracts`, `messages`, `media_uploads`, `audit_logs`, `videos` — `trainer_id` já existe com FK e index.
- Estrutura do JWT — já carrega `trainerId` e `studentId`.
- Middleware `requireAuth` e `requireManager` — funcionam, só precisam deixar de usar o TRAINER_ID como fallback.
- Socket.IO rooms `trainer:${id}` — arquitetura correta, apenas o ID precisa vir da sessão real.
- Frontend `state.data.*` — os arrays continuam iguais; a diferença é que o servidor devolverá apenas os dados do trainer logado.
- IndexedDB e localStorage — escopos locais por browser, sem conflito multi-tenant.
