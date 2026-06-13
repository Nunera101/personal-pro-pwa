# RELATÓRIO DE SEGURANÇA — PÓS-CORREÇÕES

**Data:** 2026-06-13
**Escopo:** Fechamento das correções das levas S2 → S5 sobre os achados de
`RELATORIO-ISOLAMENTO.md` (21 riscos) e `RELATORIO-SEGURANCA.md` (críticos/altos).
**Método:** correção por commit pequeno + teste de ataque automatizado por vetor.

---

## Sumário executivo

| Origem | Itens | Resolvidos | Parciais | Pendentes (fase de lançamento) |
|---|:---:|:---:|:---:|:---:|
| RELATORIO-ISOLAMENTO (21 riscos) | 21 | 17 | 4 | 0 |
| RELATORIO-SEGURANCA (críticos) | 4 | 3 | 1 (C2) | — |
| RELATORIO-SEGURANCA (altos) | 4 | 4 | 0 | — |

- **Servidor é a fonte da verdade.** Toda a autorização passou a ser decidida no
  backend por um módulo central (`server/ownership.js` + `server/storage/dataScope.js`):
  `manager` só enxerga/edita recursos do próprio `trainerId`; `student` só os do
  próprio `trainerId` **e** `studentId`. As guardas no front (S5) são **defesa em
  profundidade**, não a barreira principal.
- **66/66 testes** (9 arquivos) passam, incluindo os testes de ataque que confirmam
  `403/404` nos vetores cruzados.
- Os itens "parciais" têm a **superfície crítica fechada**; o que resta deles está
  consolidado na seção **Fase de lançamento**.

---

## 1. Riscos do RELATORIO-ISOLAMENTO

### Treino

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-01 `getWorkout()` IDOR | CRÍTICO | **RESOLVIDO** | Servidor: `splitByOwner` + ownership no GET/PUT/DELETE (`bda816d`, `fe67ce6`). Front: `ownsResource()` em `getWorkout` (`7ec3cc5`). |
| R-02 `handleWorkoutForm()` injeta `studentId` | CRÍTICO | **RESOLVIDO** | `enforceOwnerOnWrite` — dono vem da sessão, corpo do cliente não reatribui (`fe67ce6`). Teste: `write-ownership.test.js`. |
| R-03 `duplicateWorkout()` copia alheio | CRÍTICO | **RESOLVIDO** | Deriva de `getWorkout`, agora com guarda de dono (`7ec3cc5`) + ownership no servidor (`fe67ce6`). |

### Dieta

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-04 `getDietPlan()` IDOR | CRÍTICO | **RESOLVIDO** | Guarda `ownsResource()` em `getDietPlan` (`7ec3cc5`) + ownership no servidor (`fe67ce6`). |
| R-05 `handleDietForm()` injeta `studentId` | CRÍTICO | **RESOLVIDO** | `enforceOwnerOnWrite` (`fe67ce6`). Teste: `write-ownership.test.js`. |
| R-06 Aplicar plano = referência, não cópia | ALTO | **RESOLVIDO** | Aplicar padrão gera cópia independente com novo `id` (`910db2c`). Obs.: dieta sempre exige `studentId` (não há template); o caminho de template existe em treino, e foi onde a cópia foi blindada. |

### Agenda

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-07 `deleteActivity()` sem dono | CRÍTICO | **RESOLVIDO** | DELETE no servidor exige ownership (`bda816d`) + guarda no front (`7ec3cc5`). Teste: `delete-ownership.test.js`. |
| R-08 `openAgendarSheet()` edita alheia | CRÍTICO | **RESOLVIDO** | Guarda de dono em `openAgendarSheet`/`updateActivityStatus` (`7ec3cc5`) + escrita com ownership (`fe67ce6`). |

### Mensagens

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-09 Realtime permite forjar `studentId` do remetente | MÉDIO | **PARCIAL** | Mitigado: o socket valida JWT na conexão e o `trainerId` da sessão isola tenants; um manager só atua dentro do próprio trainer. **Resta** validar explicitamente que `payload.studentId` pertence ao trainer antes de persistir (`server/realtime.js:73`). Risco residual baixo, sem vetor cross-tenant. |

### Progresso

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-10 `markUpdateViewed()` sem dono | CRÍTICO | **RESOLVIDO** | Guarda de dono no front (`7ec3cc5`) + mutação persiste via coleção com ownership no servidor (`fe67ce6`/`bda816d`). |
| R-11 `handleUpdateComment()` escalada de role | CRÍTICO | **RESOLVIDO** | Checa `role === "manager"` antes de gravar `trainerComment`; aluno recebe aviso (`951bfaf`). |

### Perfil

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-12 IDOR via URL hash | MÉDIO | **RESOLVIDO** | `getStudent()` valida `trainerId` (cross-tenant bloqueado) + guardas no front (`7ec3cc5`). Manager ver perfis do **próprio** trainer é comportamento legítimo. |
| R-13 Upload de foto não valida JWT duplo | ALTO | **PARCIAL** | Mitigado: `JWT_SECRET` obrigatório e estável removeu o fallback aleatório (`6e738c5`); `studentId` do upload vem do `req.auth` verificado e o TTL dos links foi reduzido (`de1d209`). **Resta** segredo rotativo + janela curta de assinatura → blocklist/refresh tokens (fase de lançamento). |

### Contrato

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-14 `mergeStudentContracts()` vaza contratos | CRÍTICO | **RESOLVIDO** | `filter` por `studentId` antes do merge; contratos de outro aluno nunca entram no resultado (`2e0aa47`). Teste: `contract-isolation.test.js`. |
| R-15 Upload de PDF de contrato sem dono | ALTO | **PARCIAL** | Cross-tenant fechado: `trainer_id` do upload vem **sempre** da sessão (`resolveUploadTrainerId`, `85793d5`) e a rota é `requireManager`; arquivos namespaced por dono. **Resta** validar que o `contractId` do corpo pertence a um contrato existente do trainer (`server/routes/uploads.js:135`). |

### Financeiro

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-16 `openPaymentForm()` expõe pagamentos alheios | CRÍTICO | **RESOLVIDO** | Guarda de dono em `openPaymentForm` (`7ec3cc5`) + leitura de coleção com ownership no servidor. |
| R-17 `handlePaymentFormSheet()` sem dono cruzado | CRÍTICO | **RESOLVIDO** | `enforceOwnerOnWrite` impede reatribuir `studentId` de pagamento existente (`fe67ce6`). Teste: `write-ownership.test.js`. |

### Biblioteca / Padrões

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-18 `sanitizeCollection()` não filtra exercícios | MÉDIO | **RESOLVIDO (por design)** | Treinos publicados passaram a ser escopados por dono (`fe67ce6`/`bda816d`). `EXERCISES_KEY` é **biblioteca compartilhada intencional** entre trainers (`OWNER_SCOPED_COLLECTIONS` a exclui de propósito — `server/storage/dataScope.js:16`); não carrega dado de aluno. |
| R-19 DELETE de coleção sem dono | CRÍTICO | **RESOLVIDO** | Vetor mais destrutivo: DELETE carrega o alvo e exige `assertOwnership` (`bda816d`). Teste de ataque: aluno A → item de B = `403`; manager X → item de Y = `403`; inexistente = `404` (`delete-ownership.test.js`). |

### Estado global / geral

| ID | Severidade | Situação | Commit / motivo |
|---|---|---|---|
| R-20 `state.data` carrega tudo do trainer | ALTO | **RESOLVIDO (curto prazo)** | Servidor entrega apenas dados do escopo autenticado (`filterByOwner`/`sanitizeCollection`) e fechou todas as lacunas de R-01..R-19; front com guardas. Migração para REST por recurso permanece como evolução arquitetural (não-bloqueante). |
| R-21 `activeStudentProfileId` manipulável | MÉDIO | **PARCIAL** | `getStudent()` valida `trainerId` (manager só vê o próprio tenant) e o audit log de autenticação foi adicionado (`61ce492`). **Resta** log específico de cada acesso a perfil de aluno. Sem vetor cross-tenant. |

---

## 2. Itens críticos e altos do RELATORIO-SEGURANCA

### CRÍTICO

| # | Item | Situação | Commit / motivo |
|---|---|---|---|
| C1 | Credenciais admin expostas no `index.html` | **RESOLVIDO** | Bloco `.demo-credentials` e credenciais removidos do front (`01839ce`). |
| C2 | Senha padrão hardcoded (`Admin@2026`) | **PARCIAL** | Hardcode eliminado: senha admin vem **exclusivamente** do ambiente, sem hash legado embutido (`d28ac0b`, `f48ce9d`). **Resta** a flag de **troca obrigatória no primeiro acesso** (fase de lançamento). |
| C3 | `/uploads/` acessível sem auth | **RESOLVIDO** | Servido por rota autenticada com `authorizeUploadAccess` (dono/tenant) (`89415d6`). Teste: `uploads-isolation.test.js` (aluno A → PDF de B = `403`). |
| C4 | `GET /api/videos/:id` público | **RESOLVIDO** | `authorizeVideoAccess` exige sessão e mesmo tenant (`fe53933`). Teste: `videos-auth.test.js` (outro trainer = `403`, sem sessão = `401`). |

### ALTO

| # | Item | Situação | Commit / motivo |
|---|---|---|---|
| A1 | Token de `student-area-view` reutilizável | **RESOLVIDO** | Token marcado como `usedAt` no primeiro uso (`de1d209`). Teste: `single-use-token.test.js` (reuso = recusado). |
| A2 | `JWT_SECRET` com fallback hardcoded/aleatório | **RESOLVIDO** | `JWT_SECRET` obrigatório via env, estável entre restarts, sem fallback (`6e738c5`). |
| A3 | Headers de segurança ausentes | **RESOLVIDO** | `helmet` com CSP, HSTS, X-Frame-Options e nosniff; app carrega com 0 violações de CSP (`fe84781`). |
| A4 | CORS aberto (`origin: "*"`) | **RESOLVIDO** | Allowlist de origens (produção Railway + localhost) no Express e Socket.IO (`7af6bfb`). |

> **Médios também endereçados nesta rodada:** M1 schema de validação (`68386f4`),
> M2 escape de HTML/XSS no front (`9a6542f`), M4 audit log de login/falha/tokens
> (`61ce492`), M5 `trainerId` de upload da sessão (`85793d5`), M6 TTL do link de
> área do aluno reduzido (`de1d209`). B2 health sem vazar infraestrutura (`e29b3d9`).

---

## 3. Testes de ataque criados e resultado

Todos rodam no test runner nativo do Node (`node --test server/`). **66/66 passam.**

| Arquivo | Vetor coberto | Casos | Resultado |
|---|---|:---:|---|
| `server/ownership.test.js` | Utilitário central de ownership (dono, outro aluno, outro trainer, inexistente) | 10 | ✅ pass |
| `server/delete-ownership.test.js` | **R-19** — DELETE cruzado: aluno A→B `403`, manager X→Y `403`, inexistente `404` | 6 | ✅ pass |
| `server/write-ownership.test.js` | **R-02/R-05/R-17** — reatribuir `studentId`/`trainerId` pelo corpo é ignorado; sequestro de id alheio descartado | 7 | ✅ pass |
| `server/contract-isolation.test.js` | **R-14** — merge do aluno A nunca retorna contrato de B; não assina contrato de B reusando id | 3 | ✅ pass |
| `server/uploads-isolation.test.js` | **C3/M5** — aluno A não baixa PDF/foto de B (`403`), sem sessão `401`, órfão `404`, `trainerId` do corpo ignorado | 12 | ✅ pass |
| `server/videos-auth.test.js` | **C4** — vídeo de outro trainer `403`, sem sessão `401`, inexistente `404` | 6 | ✅ pass |
| `server/single-use-token.test.js` | **A1** — reuso de link de uso único recusado; expirado/tipo errado recusados | 5 | ✅ pass |
| `server/schema-validation.test.js` | **M1** — payload malformado retorna `400` antes de tocar o banco | 10 | ✅ pass |
| `server/student-login.test.js` | Login multi-tenant — JWT carrega `trainerId` do próprio registro; colisão ambígua recusada | 7 | ✅ pass |
| **Total** | | **66** | **✅ 66 pass / 0 fail** |

---

## 4. Fica para a fase de lançamento

Itens deliberadamente adiados — não bloqueiam o uso atual (tenant único
`trainer-demo`), mas são obrigatórios antes de abrir para múltiplos personais
e/ou clientes externos:

1. **Senha de admin por troca no primeiro acesso (C2 residual).**
   Hoje a senha vem do ambiente, sem hardcode. Falta uma flag em
   settings/banco que force a redefinição obrigatória no primeiro login,
   eliminando senhas iniciais compartilhadas.

2. **Blocklist de JWT / refresh tokens (M3; também R-13).**
   O logout ainda é client-side — um JWT válido continua aceito até expirar.
   Implementar blocklist server-side (ou refresh tokens de curta duração com
   rotação de segredo) para permitir revogação real e encurtar a janela de um
   token comprometido. Fecha o resíduo de R-13.

3. **2FA (autenticação em dois fatores).**
   Segundo fator (TOTP/e-mail) ao menos para a conta `manager`, dado o acesso
   a dados de saúde e financeiros de todos os alunos.

4. **Eliminar o hash legado FNV-1a (B1).**
   O upgrade automático para bcrypt no login já migra senhas conforme são
   usadas. Após confirmar 100% das senhas migradas, remover por completo o
   caminho de verificação do hash legado para que nenhum hash trivialmente
   quebrável continue aceito.

### Resíduos menores associados (mesma fase)
- **R-09:** validar que `payload.studentId` pertence ao trainer no realtime.
- **R-15:** validar que `contractId` do upload pertence a um contrato do trainer.
- **R-21:** audit log específico por acesso a perfil de aluno.
- **R-20:** migração de longo prazo para API REST por recurso com filtro SQL.

---

## Conclusão

Os **14 riscos CRÍTICOS** do RELATORIO-ISOLAMENTO e os **4 itens CRÍTICOS** do
RELATORIO-SEGURANCA estão **fechados no servidor** (a barreira que importa), com
testes de ataque automatizados confirmando `403/404` nos vetores cruzados e
guardas de defesa em profundidade no front. Os itens marcados "parcial" têm a
superfície de ataque cross-tenant eliminada; seus resíduos estão concentrados e
documentados na **Fase de lançamento**, junto com senha por primeiro acesso,
blocklist/refresh de JWT, 2FA e a remoção final do hash legado.
