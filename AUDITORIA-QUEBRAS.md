# Auditoria de Quebras de Texto e Badge Estourando

**Data:** 2026-06-07  
**Escopo:** Todos os cards de lista do app (alunos, agenda, contratos, dieta, padrões, atualizações, mensagens)

---

## Critério de avaliação

Cada item de lista deve ter:
- Container com layout flex/grid que limite o espaço das colunas
- Bloco de texto com `min-width: 0` (flex) ou `minmax(0, 1fr)` (grid) para permitir truncagem
- Textos secundários longos: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- Badge de status: `flex-shrink: 0; white-space: nowrap` — nunca encolhe, nunca vaza

---

## Resultados por tela

### GLOBAL — `.badge` (`styles.css` e `src/styles/base.css`)

| Propriedade ausente | Problema | Correção |
|---|---|---|
| `white-space: nowrap` | Texto do badge podia quebrar linha e distorcer o layout | Adicionado em ambos os arquivos |
| `flex-shrink: 0` | Badge podia ser comprimido em containers flex | Adicionado em ambos os arquivos |

**Arquivos alterados:** `styles.css` (linha ~1565), `src/styles/base.css` (linha ~870)

---

### ALUNOS (`src/styles/alunos.css`)

| Seletor | Problema | Correção |
|---|---|---|
| `.student-card-main > strong` (seção light) | Nome do aluno sem truncagem na seção base | Adicionado `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` |
| `.student-goal` (seção light) | Objetivo do aluno podia invadir o badge de status | Adicionado `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` |

**Observação:** A seção dark já tinha esses valores com `!important`. A seção base (light) estava sem proteção.

---

### AGENDA (`src/styles/agenda.css`)

| Seletor | Problema | Correção |
|---|---|---|
| `.agenda-status` | Container do badge sem `flex-shrink: 0` | Adicionado `flex-shrink: 0` |
| `.agenda-status .badge` | Badge sem limitação de largura máxima — "Contrato pendente pulando para fora" | Adicionado `max-width: 7.5rem; overflow: hidden; text-overflow: ellipsis` |

**Observação:** A seção dark já tinha `max-width: 96px` com overflow. A seção base estava sem proteção.

---

### CONTRATOS (`src/styles/contratos.css`)

| Seletor | Problema | Correção |
|---|---|---|
| `.contract-student-info span` | Nome do plano sem truncagem — texto podia expandir container | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.contract-student-info b` | Tier/categoria sem truncagem | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.contract-validity small` | Label "Válido até" sem truncagem | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.contract-validity strong` | Valor da data/prazo cortado — "Contrato value cortado" | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |

---

### DIETA (`src/styles/dieta.css`)

| Seletor | Problema | Correção |
|---|---|---|
| `.diet-plan-title strong` | Nome do aluno no card de dieta sem truncagem | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.diet-plan-title span` | Objetivo do plano (icon + texto) sem truncagem; ícone podia desaparecer | Adicionado `min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis` |
| `.diet-plan-title svg` | Ícone podia ser comprimido pelo flex | Adicionado `flex-shrink: 0` |
| `.diet-plan-grid span` | Labels do grid (protocolo, refeições, etc.) sem truncagem | Adicionado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.diet-plan-grid strong` | Valores do grid sem truncagem e sem `min-width: 0` | Adicionado `min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |

---

### PADRÕES DE TREINO (`src/styles/treinos.css`)

| Seletor | Status | Observação |
|---|---|---|
| `.pattern-card-head` | OK | Grid `minmax(0, 1fr) auto` — badge no `auto`, título no `minmax` |
| `.pattern-title-block` | OK | Tem `min-width: 0` |
| `.pattern-meta-item strong` | OK | Já tem `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `.pattern-preview b` | OK | Já tem overflow handling |

**Sem quebras identificadas.**

---

### ATUALIZAÇÕES (`src/styles/atualizacoes.css`)

| Seletor | Status | Observação |
|---|---|---|
| `.update-card-head` | OK | Grid `auto minmax(0, 1fr) auto` |
| `.update-title-block` | OK | `min-width: 0` presente |
| `.update-title-block strong` | OK | Já tem overflow handling completo |
| `.update-title-block span` | OK | `flex-wrap: wrap` intencional — status + horário podem quebrar linha |

**Sem quebras identificadas.**

---

### MENSAGENS — CHAT (`src/styles/chat.css`)

| Seletor | Status | Observação |
|---|---|---|
| `.conversation-card` | OK | Grid `auto minmax(0, 1fr) auto` |
| `.conversation-copy` | OK | `min-width: 0` presente |
| `.conversation-copy strong` | OK | Overflow handling completo |
| `.conversation-copy small` | OK | Overflow handling completo |
| `.conversation-meta` | OK | `min-width: 3.2rem` previne colapso |

**Sem quebras identificadas.**

---

## Resumo dos arquivos alterados

| Arquivo | Edições |
|---|---|
| `styles.css` | 1 — `.badge` recebe `white-space: nowrap; flex-shrink: 0` |
| `src/styles/base.css` | 1 — `.badge` recebe `white-space: nowrap; flex-shrink: 0` |
| `src/styles/alunos.css` | 2 — overflow em `.student-card-main > strong` e `.student-goal` (seção light) |
| `src/styles/agenda.css` | 2 — `flex-shrink: 0` em `.agenda-status`; `max-width + overflow` em `.agenda-status .badge` |
| `src/styles/contratos.css` | 4 — overflow em `span`, `b`, `small`, `strong` dentro de `.contract-student-info` e `.contract-validity` |
| `src/styles/dieta.css` | 5 — overflow em `.diet-plan-title strong/span/svg` e `.diet-plan-grid span/strong` |

**Total: 15 correções em 6 arquivos**
