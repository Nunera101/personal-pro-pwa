# Auditoria do Modo Aluno

**Data:** 2026-06-08  
**Escopo:** Todas as telas do modo `student` em `app.js` + `index.html`  
**Objetivo:** Mapear telas existentes, funções de renderização e divergências do padrão gestor.  
**Observação:** Este documento é só de auditoria — sem alteração de código.

---

## 1. Função central de renderização

```
renderStudent()  —  app.js:2430
```

Fluxo:
1. Verifica contrato bloqueante → se existir, renderiza `renderStudentContractGate` e retorna (linha 2437)
2. Atualiza `studentTitle.textContent` com `fixMojibake(menu.label)` (linha 2445)
3. Renderiza sidebar via `renderSideNav(...)` — **sem fixMojibake** (linha 2446)
4. Renderiza bottom nav via `renderNav(...)` — **sem fixMojibake** (linha 2448)
5. Renderiza conteúdo: `elements.studentContent.innerHTML = fixMojibake(renderer())` (linha 2458)
6. Aplica animação de entrada

`scrubVisibleText` **NÃO é chamado** em `renderStudent()`. É chamado apenas em:
- `renderApp()` linha 2346 — carga inicial
- Modal (linha 6214)
- `switchProfileTab` linha 6342 — exclusivo do gestor ao ver perfil do aluno

---

## 2. Mapa de telas

| # | Nome da tela | Função renderizadora | Linha | Acesso |
|---|---|---|---|---|
| 1 | **Contrato Gate** | `renderStudentContractGate(contract)` | 5938 | Automático — bloqueia o app quando há contrato pendente |
| 2 | **Hoje** | `renderStudentToday()` | 4837 | `studentMenu = "today"` |
| 3 | **Execução de treino** | `renderWorkoutExecution()` | 6107 | Substituição de "Hoje" ou "Treinos" quando `state.activeSession` está ativo |
| 4 | **Treinos** | `renderStudentWorkouts()` | 4822 | `studentMenu = "workouts"` |
| 5 | **Agenda** | `renderAgendaScreen(studentId)` | 4935 | `studentMenu = "agenda"` — **função compartilhada** com gestor |
| 6 | **Evolução** | `renderStudentProgress()` | 5810 | `studentMenu = "progress"` |
| 7 | **Atualizações** | `renderStudentUpdates()` | 5253 | `studentMenu = "updates"` |
| 8 | **Mais / Perfil** | `renderStudentProfile()` | 5986 | `studentMenu = "profile"` |

### Telas internas ao "Mais/Perfil" (não têm menu próprio)

| Componente | Função | Linha | Como é acessado |
|---|---|---|---|
| Visão de dieta | `renderStudentDietOverview(plan)` | 6039 | Seção inline dentro de `renderStudentProfile` |
| Mensagens | `openThreadSheet(studentId)` | 8129 | Botão `data-open-messages` em `renderStudentProfile:6007` — abre sheet modal |

---

## 3. Navegação

### Sidebar (`#studentSideNav`)
```
today      → Hoje
workouts   → Treinos
agenda     → Agenda
progress   → Evolução
updates    → Atualizações
profile    → Perfil
```
Grupo "Aluno" aparece apenas no item `today` (linha 2446).

### Bottom nav (`#studentBottomNav`)
```
today      → Hoje
workouts   → Treinos
agenda     → Agenda
progress   → Evolução
profile    → Mais   (ícone: icons.more)
```
Quando o menu ativo não está na lista do bottom nav (ex: `updates`), o item `profile` fica ativo como fallback (linha 2447).

### Sem botão hambúrguer
O HTML do header do aluno (`index.html:137-157`) **não tem** `data-manager-menu-toggle`. A sidebar existe mas não há botão visível para abri-la no mobile. O gestor tem o botão (linha 110 do index.html).

---

## 4. Divergências confirmadas do padrão gestor

---

### (a) Encoding quebrado SOMENTE no aluno

**Strings com ausência de acento — hardcoded em `renderStudentDietOverview`**

| Linha | Texto no código | Deveria ser |
|---|---|---|
| 6046 | `Refeicoes` | Refeições |
| 6047 | `Proxima revisao` | Próxima revisão |
| 6053 | `Refeicao` | Refeição |
| 6054 | `Orientacao registrada` | Orientação registrada |
| 6058 | `As orientacoes do plano aparecerao aqui.` | As orientações do plano aparecerão aqui. |

Estas strings são hardcoded no template literal — `fixMojibake` não as corrige pois não contêm bytes mojibake, falta acento na escrita.

**Strings que podem aparecer como "Ãšltimos/Ãšltima" no browser**

| Linha | Texto no código | Função |
|---|---|---|
| 4777 | `Última execução:` | `renderWorkoutCard` (compartilhada) |
| 4784 | `Última vez:` | `renderWorkoutCard` (compartilhada) |
| 5831 | `Últimos treinos` | `renderStudentProgress` |
| 6383 | `Últimos 4 treinos` | `renderStudentSummaryCards` |
| 6552 | `Últimos treinos` | `renderStudentEvolutionPanel` |
| 6743 | `Últimos 6 treinos` | botão no profile tab |

**Por que aparece SÓ no aluno:**  
O gestor chama `scrubVisibleText(tabBody)` na linha 6342 (ao trocar aba no perfil do aluno), funcionando como segunda passagem de correção. O `renderStudent()` só aplica `fixMojibake` uma vez (linha 2458) e nunca chama `scrubVisibleText`. Se houver falha na primeira passagem (cache do SW com versão antiga do `app.js`, data-attr ou algum path de re-render secundário), o aluno não tem o fallback de scrub.

---

### (b) Exercícios aparecem como "Exercício removido"

**Localização:** `renderWorkoutExercisePreview` — linhas 4752–4754  
**Localização:** `renderPatternPreview` — linha 4726–4728

```javascript
const exercise = getExercise(row.exerciseId);  // retorna undefined se o exercício foi deletado
return `${escapeHtml(exercise?.name || "Exercício removido")} · ...`
```

**Causa:** Um treino armazena `exerciseId` referenciando a biblioteca de exercícios. Se o exercício for deletado da biblioteca, `getExercise(id)` retorna `undefined` e o fallback "Exercício removido" é exibido.

**Na tela do aluno (`renderStudentWorkouts`):** Os treinos publicados usam `renderWorkoutCard(workout, false)` que chama `renderWorkoutExercisePreview`. Se o gestor apagou um exercício que estava em um treino publicado para o aluno, o aluno vê "Exercício removido" na lista de exercícios.

**No gestor:** o mesmo fallback aparece, mas o gestor não fica preso à tela de treinos — pode editar o treino. O aluno não tem esse recurso.

---

### (c) Eyebrow "Área do aluno" acima de cada título

**Localização:** `index.html:142`

```html
<section class="workspace view" id="studentView">
  <header class="workspace-header">
    <div class="brand-inline">
      <img .../>
      <div>
        <span>Área do aluno</span>    ← eyebrow fixo no HTML
        <h2 id="studentTitle">Hoje</h2>
      </div>
    </div>
```

O CSS aplica `text-transform: uppercase` à classe `.eyebrow`, tornando "Área do aluno" visível como "ÁREA DO ALUNO" acima do título dinâmico em todas as telas do aluno.

**No gestor:** O header usa `<h2>Elite AS</h2>` + badge `GESTOR`, sem eyebrow de rótulo de perfil acima do título.

**Impacto:** Toda tela do aluno tem "ÁREA DO ALUNO" fixo em cima do título, o que é redundante e diverge do layout do gestor.

---

### (d) Botão "Ver dia" na Agenda

**Status: NÃO encontrado no código atual.**

A Agenda compartilhada (`renderAgendaScreen`) possui apenas as abas de visualização "Dia / Semana / Mês" (linhas 4958–4960) e um botão "Hoje" (linha 4973). Nenhum botão "Ver dia" encontrado. A tarefa [OK] na linha 46 do tarefas.txt removeu este botão previamente — **divergência já corrigida.**

---

### (e) Tela "Mais" repete itens já presentes na barra

**Localização:** `renderStudentProfile` — linha 5993–6010

A tela "Mais" (`studentMenu = "profile"`) tem uma grade de atalhos rápidos:

```
Atualizações  → data-student-nav="updates"
Mensagens     → data-open-messages
Evolução      → data-student-nav="progress"    ← já está na barra E no sidebar
Agenda        → data-student-nav="agenda"       ← já está na barra E no sidebar
```

**Bottom nav:** Hoje · Treinos · Agenda · Evolução · Mais  
**Sidebar:** Hoje · Treinos · Agenda · Evolução · Atualizações · Perfil

Conclusão: "Evolução" e "Agenda" aparecem em TRÊS lugares (barra, sidebar e dentro de "Mais"). "Atualizações" aparece no sidebar E dentro de "Mais".

---

### (f) Dieta e Mensagens: não renderizam como tela independente

**Dieta:**
- Não há `studentMenu = "diet"` mapeado em `renderStudent()` (linha 2450–2457)
- A dieta aparece **somente** como seção inline em `renderStudentProfile` (linha 6012–6022) via `renderStudentDietOverview(diet)`
- Se não houver plano ativo, exibe emptyState "Plano alimentar não disponível"
- **Conclusão:** Dieta RENDERIZA (no perfil), mas não tem tela própria. Inacessível diretamente pela navegação.

**Mensagens:**
- Não há `studentMenu = "messages"` mapeado
- Acessível SOMENTE via botão `data-open-messages` dentro de `renderStudentProfile` (linha 6007)
- Abre `openThreadSheet(studentId)` que injeta o thread em um sheet modal (linha 8129 sem fixMojibake, sem scrubVisibleText)
- **Conclusão:** Mensagens RENDERIZAM (modal), mas não têm tela própria. Sem atalho direto na navegação.

---

## 5. Diferenças estruturais resumidas: aluno vs gestor

| Aspecto | Gestor | Aluno | Observação |
|---|---|---|---|
| Header — botão hambúrguer | ✅ `data-manager-menu-toggle` | ❌ ausente | Sidebar do aluno sem toggle visível |
| Header — eyebrow de perfil | ❌ (usa badge "GESTOR") | ✅ "Área do aluno" hardcoded | Divergência (c) |
| Header — título dinâmico | `#managerTitle` (oculto) | `#studentTitle` (visível) | Comportamento diferente |
| Notification button | ✅ | ❌ | Aluno não recebe notificações via sininho |
| Botão de configurações | ✅ `data-manager-nav="settings"` | ❌ | Aluno não tem acesso a configurações |
| scrubVisibleText pós-render | ✅ em switchProfileTab | ❌ nunca | Raiz da divergência (a) |
| Telas exclusivas do gestor | Relatórios, Financeiro, Biblioteca, Novos alunos, Config | — | Intencionais |
| Tela exclusiva do aluno | Execução de treino, Contrato Gate | — | Intencionais |
| Dieta como tela standalone | ✅ tela própria | ❌ seção no Perfil | Divergência (f) |
| Mensagens como tela standalone | ✅ tela própria | ❌ sheet modal | Divergência (f) |
| Agenda | Compartilhada | Compartilhada | ✅ igual |

---

## 6. Arquivos envolvidos

| Arquivo | Uso |
|---|---|
| `app.js:2430` | `renderStudent()` — orquestrador central |
| `app.js:2244` | `renderNav()` — bottom nav (sem fixMojibake) |
| `app.js:2263` | `renderSideNav()` — sidebar (sem fixMojibake) |
| `app.js:4822` | `renderStudentWorkouts()` |
| `app.js:4837` | `renderStudentToday()` |
| `app.js:5253` | `renderStudentUpdates()` |
| `app.js:5810` | `renderStudentProgress()` |
| `app.js:5938` | `renderStudentContractGate()` |
| `app.js:5986` | `renderStudentProfile()` |
| `app.js:6039` | `renderStudentDietOverview()` — 5 strings sem acento |
| `app.js:6107` | `renderWorkoutExecution()` |
| `index.html:137` | `#studentView` — header com eyebrow "Área do aluno" |
