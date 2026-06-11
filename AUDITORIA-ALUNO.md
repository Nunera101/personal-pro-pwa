# Auditoria do Modo Aluno

**Data:** 2026-06-11 (revisão final premium — Leva 6)
**Escopo:** Todas as telas do modo `student`: Login, Contrato, Início, Treinos, Execução, Dieta, Mensagens, Progresso, Mais, Perfil, Agenda
**Versão:** 54 / app-version 54

---

## Status Geral — Paridade com Gestor

| Critério | Status | Observação |
|---|---|---|
| Badge de perfil no header | ✅ ALUNO (verde) | Adicionado em Leva 6 — `<span class="student-badge">ALUNO</span>` |
| Hambúrguer no header | ✅ Presente | Adicionado em Leva 6 — `data-student-menu-toggle` |
| Drawer lateral mobile | ✅ Funcionando | CSS drawer + backdrop + handlers em Leva 6 |
| Encoding (mojibake) | ✅ Corrigido | 29 correções em Leva 5; `scrubVisibleText` em `renderStudent()` |
| Textos cortados | ✅ OK | `overflow-wrap: anywhere` em `.profile-card strong`; `text-overflow: ellipsis` no h2 |
| Caixa preta | ✅ Sem | Cores definidasexplicitamente; sem `background: unset` quebrado |
| Botão escondido atrás da barra | ✅ OK | `padding-bottom: calc(80px + env(safe-area-inset-bottom))` no `.student-workspace` |
| Cards fora do padrão | ✅ OK | Todos usam `.panel`, `.entity-row`, `.metric-card` padrão |
| Encoding de cards | ✅ OK | `fixMojibake` + `scrubVisibleText` no render |
| Sem glow | ✅ OK | `base.css §Bug#5` remove todos box-shadow com `!important` |
| Barra inferior estável | ✅ OK | `position: fixed; bottom: 0` + safe-area; `display: none !important` quando `[hidden]` |
| Contador de descanso (execução) | ✅ Funcionando | `startRest()` → `setInterval` decrementa `state.rest.remaining`; DOM atualizado direto |
| Chat com compose | ✅ Funcionando | `#threadSheetFt` tem `<textarea>` + botão enviar; `data-open-my-chat` abre como aba |
| Skeleton loading | ✅ OK | `STUDENT_SKELETON_TABS` aplica skeleton em workouts, diet, progress, updates |

---

## 1. Telas auditadas

### Login (`#loginView`)
- Formulário padrão com e-mail, senha, "Manter-se conectado"
- Botão "Baixar app" presente (PWA install)
- **OK** — sem divergências visuais

### Contrato Gate (`renderStudentContractGate`)
- Renderizado quando `getRequiredContractForStudent()` retorna contrato
- Bloqueia a barra inferior (`studentBottomNav.hidden = true`)
- Mostra: dados do plano, corpo do contrato, campo de confirmação de nome, checkbox de aceite
- Botão "Sair" presente (contingência)
- **OK** — encoding via `fixMojibake`; sem glow; botões visíveis

### Início (`renderStudentToday`)
- Card "Próximo treino" + botão "Iniciar" (`data-start-workout`)
- Grid de métricas (semana, mês, séries, atualizações)
- Card "Último treino" (se houver sessão)
- Painel de atualização pendente (se houver)
- Agenda do dia (`renderAgendaList`)
- **OK** — layout completo; sem itens escondidos

### Treinos (`renderStudentWorkouts`)
- Lista filtrada com `renderStudentWorkoutCard`
- Campo de busca se > 3 treinos
- Empty state com ícone
- Redireciona para execução se `state.activeSession` ativo
- **OK**

### Execução de treino (`renderWorkoutExecution`)
- Barra de progresso (%) com `role="progressbar"`
- Banner de descanso (`renderRestBanner`) com countdown atualizado por `setInterval`
- Card do exercício atual (`renderFocusSetCard`)
- Inputs de carga e reps (aparecem quando série `status === "running"`)
- Fila dos próximos exercícios
- Botão "Finalizar treino" (desabilitado até tudo concluído)
- **OK** — contador funciona; botão não fica atrás da barra

### Dieta (`renderStudentDiet`)
- Tela própria (não mais inline no Perfil)
- Hero com protocolo atual (`renderStudentDietProtocolHero`)
- Cards de refeições com checkboxes (`renderStudentDietPlanCard`)
- Busca se > 1 plano
- Empty state se sem plano
- **OK**

### Mensagens / Chat (`openStudentChatTab` → `openThreadSheet`)
- Aba `"chat"` na bottom nav e sidebar
- Abre `#threadSheet` fullscreen com classe `is-student-view`
- Header com avatar do personal + status de conexão
- Bolhas de mensagem: aluno à direita (dourado), personal à esquerda
- Footer com `<textarea>` + botão enviar + botão de link
- `fixMojibake` + `scrubVisibleText` aplicados
- **OK** — compose presente; nav visível durante o chat

### Progresso (`renderStudentProgress` → `renderProgressForStudent`)
- Seção de atualização quinzenal pendente (botão "Enviar peso...")
- Gráfico de peso corporal (SVG, se ≥ 2 atualizações)
- Histórico de atualizações enviadas
- Grid de métricas (semana, mês, total, volume)
- Gráfico de volume de treino (SVG, se ≥ 2 sessões)
- Histórico de sessões
- Evolução por exercício (maior carga)
- **OK**

### Mais (`renderStudentProfile`)
- Hub com: Perfil, Agenda, Contrato, Configurações
- Avatar + nome + badge de status
- Botão "Sair" visível (sem duplicidade no header)
- **OK** — itens sem duplicatas da barra

### Perfil (`renderStudentMaisPerfil`)
- Avatar + nome + status
- Summary grid: treinos/semana, volume, próxima atividade, contrato
- Dados pessoais (nome, objetivo, telefone)
- Dados da conta (e-mail)
- Seção de contrato com botão "Visualizar"
- **OK**

### Agenda (`renderAgendaScreen` — compartilhada com gestor)
- Abas Dia / Semana / Mês
- Calendário com filtro por `studentId`
- **OK** — função compartilhada; sem divergências

---

## 2. Correções aplicadas em Leva 6 (2026-06-11)

### index.html
- Adicionado `<button class="icon-button menu-trigger" data-student-menu-toggle>` no header do aluno
- Adicionado `<span class="student-badge">ALUNO</span>` abaixo do `<h2 id="studentTitle">`
- Removidos `<button class="pill-button" data-install-trigger>Baixar app</button>` e `<button class="ghost-button" data-logout>Sair</button>` do header (ambos acessíveis via "Mais" ou app info)
- Adicionado `<div class="drawer-backdrop" data-student-drawer-backdrop></div>` dentro da `student-workspace`

### styles.css
- Adicionado `.student-badge` (verde: `#10B981`, `rgba(16,185,129,0.15)`)
- `.manager-header, .student-header` agora compartilham `display: grid; grid-template-columns: auto minmax(0, 1fr) auto`

### src/styles/nav.css
- Adicionado CSS drawer para `.student-workspace .side-nav` em `@media (max-width: 57.99rem)`:
  - `position: fixed; left: 0; top: 0; width: min(88vw, 300px); transform: translateX(-100%); transition: transform 0.28s ease`
  - `.student-workspace .side-nav.open { transform: translateX(0) }`

### app.js
- `elements.studentDrawerBackdrop` adicionado ao mapa de elementos
- `openStudentDrawer()` / `closeStudentDrawer()` implementadas
- `showView()` chama `closeStudentDrawer()` em toda troca de view
- `renderStudent()` insere header com botão X (`data-student-drawer-backdrop`) na sidebar via `insertAdjacentHTML("afterbegin")`
- `bindStudentEvents()`: seletor do `closest()` inclui `[data-student-drawer-backdrop]`; handlers para `data-student-menu-toggle` e `data-student-drawer-backdrop`; `closeStudentDrawer()` chamado ao navegar por item de menu; `Escape` fecha ambos os drawers

---

## 3. Divergências remanescentes (intencionais)

| Item | Situação | Motivo |
|---|---|---|
| Dashboard hero com métricas coloridas | Não replicado | "Início" do aluno é simplificado por design |
| Filtros avançados em Atualizações | Não replicado | Aluno vê apenas as próprias atualizações |
| Notificações (sininho) | Não replicado | Aluno não precisa de notificações push no header |
| Relatórios, Financeiro, Biblioteca | Não replicado | Módulos exclusivos do gestor — intencional |
| Drop-shadow sutil no gráfico SVG | Mantido | `filter: drop-shadow(0 0.28rem 0.55rem rgba(245,184,46,0.18))` em `.profile-volume-chart polyline` — < 20% opacidade, não é glow |

---

## 4. Arquivos modificados (Leva 6)

| Arquivo | Mudança |
|---|---|
| `index.html` | Header aluno: hamburguer + badge ALUNO + drawer backdrop |
| `styles.css` | `.student-badge` + grid no student-header |
| `src/styles/nav.css` | Drawer mobile do aluno |
| `app.js` | Funções drawer + handlers + sidebar header |
| `AUDITORIA-ALUNO.md` | Este documento — revisão final |
