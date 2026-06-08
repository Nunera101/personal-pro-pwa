# RELATORIO-ALUNO.md — Consistência Final do Aluno

**Data:** 2026-06-08  
**Versão:** 54

---

## Paridade com o Gestor — Status Geral

| Critério | Status | Observação |
|---|---|---|
| Mojibake / strings sem acento | ✅ Corrigido | 29 ocorrências corrigidas em app.js |
| Setas ↑ ↓ | ✅ OK | fixMojibake cobre E2 86 91/93 |
| Bullet • | ✅ OK | fixMojibake cobre E2 80 A2 |
| Traço – | ✅ OK | fixMojibake cobre E2 80 93 |
| Glow / halos dourados | ✅ Sem glow | base.css §Bug#5 remove todos com !important |
| Cards cortados | ✅ OK | overflow-wrap: anywhere em .profile-card strong |
| Badge estourando | ✅ OK | white-space: nowrap + flex-shrink: 0 em .badge |
| Barra inferior fixa | ✅ Corrigido | classe student-workspace adicionada ao HTML |
| Áreas seguras | ✅ Corrigido | classe student-header adicionada ao HTML |
| Splash | ✅ OK | .startup-splash presente e funcional |
| Skeleton | ✅ Corrigido | STUDENT_SKELETON_TABS aplicado em renderStudent() |
| Microinterações (treino) | ✅ OK | microinteractions.css compartilhado; animações funcionam |

---

## Correções Aplicadas

### index.html

1. **`student-workspace` adicionado** ao `<section id="studentView">`:  
   Sem essa classe, as regras `.student-workspace { padding-bottom: calc(6.7rem + ...) }` não se aplicavam, fazendo o conteúdo ficar sob a barra inferior.

2. **`student-header` adicionado** ao `<header>` dentro de `#studentView`:  
   Sem essa classe, as regras de `min-height`, `padding-top` (safe-area) e estilo visual do header não se aplicavam ao lado do aluno.

### app.js — Strings sem acento (renderStudentProfile e globais)

| Local | Antes | Depois |
|---|---|---|
| renderStudentProfile - pageHeader | `configuracoes` | `configurações` |
| profileSummaryCard - treinos | `Concluidos esta semana` | `Concluídos esta semana` |
| profileSummaryCard - treinos | `Sem treino concluido` | `Sem treino concluído` |
| profileSummaryCard - volume | `Ultimos 4 treinos` | `Últimos 4 treinos` |
| profileSummaryCard - agenda | `Proxima atividade` | `Próxima atividade` |
| profileSummaryCard - agenda sep | ` - ` | ` · ` |
| profileSummaryCard - contrato | `Ate ${date}` | `Até ${date}` |
| agenda-view-tabs aria-label | `Visualizacao da agenda` | `Visualização da agenda` |
| botão mês | `Mes` | `Mês` |
| agenda-shift -1 aria-label | `Periodo anterior` | `Período anterior` |
| agenda-shift +1 aria-label | `Proximo periodo` | `Próximo período` |
| agenda-calendar-panel aria-label | `Calendario da agenda` | `Calendário da agenda` |
| contratos emptyState | `aparecerao aqui` | `aparecerão aqui` |
| getStudentAccessState | `Aguardando ativacao` | `Aguardando ativação` |
| getStudentAccessState | `nao criou a senha` | `não criou a senha` |
| showToast reset password | `redefinicao` | `redefinição` |
| showToast 404 | `ainda nao tem` | `ainda não tem` |
| showToast 503 | `ainda nao configurado` | `ainda não configurado` |
| showToast fallback | `Nao foi possivel` | `Não foi possível` |
| form create password | `nao visualiza essa senha` | `não visualiza essa senha` |
| showToast link reset | `Link invalido` | `Link inválido` |
| showToast link contract | `Link de contrato invalido` | `Link de contrato inválido` |
| propria senha (form + label) | `propria senha` | `própria senha` |
| email config msg (2x) | `nao esta configurado` | `não está configurado` |
| invite link label | `criacao de senha` | `criação de senha` |
| email config msg | `criacao de senha agora` | `criação de senha agora` |
| goalLabels | `Forca` | `Força` |
| goalLabels | `Reabilitacao` | `Reabilitação` |
| option goalList form | `Forca` / `Reabilitacao` | `Força` / `Reabilitação` |
| newStudentScreen h4 | `Observacoes internas` | `Observações internas` |
| newStudentScreen textarea | `Anotacoes privadas...` | `Anotações privadas...` |

### app.js — Skeleton loading para o aluno

- Adicionada constante `STUDENT_SKELETON_TABS = new Set(["workouts", "diet", "progress", "updates"])`
- `renderStudent()` agora exibe skeleton antes de renderizar conteúdo nessas abas (mesmo padrão do gestor com `SKELETON_TABS`)

---

## Divergências Remanescentes

| Item | Situação | Motivo |
|---|---|---|
| Aluno não tem Dashboard hero com métricas coloridas | Divergência intencional | O "Início" do aluno é simplificado vs. dashboard do gestor |
| Aluno não tem filtros avançados em Atualizações | Divergência intencional | Aluno vê apenas as próprias atualizações |
| Aluno não tem side-nav expandido como gestor | Divergência intencional | Side-nav do aluno é mais enxuto por design |
| console.warn "Sincronizacao remota..." | Não corrigido | Mensagem interna de console, não visível ao usuário |

---

## Verificação de Arquitetura

- **Splash:** `startup-splash` em index.html + `body.app-ready .startup-splash { opacity:0 }` — funcional  
- **Safe area header:** `.student-header { padding-top: calc(env(safe-area-inset-top, 20px) + 8px) }` — agora ativado  
- **Barra inferior:** `#studentBottomNav { position: fixed; bottom: calc(0.58rem + var(--safe-bottom)) }` — funcional; conteúdo tem `padding-bottom` via `.student-workspace`  
- **Microinterações:** `microinteractions.css` carregado globalmente; animações de set-check, workout-complete e progress-bar ativas para o aluno  
- **scrubVisibleText:** chamado após cada render do aluno via `renderApp()` — cobre todos os text nodes  
- **fixMojibake:** aplicado em todos os `innerHTML` do aluno (renderStudent, switchProfileTab)
