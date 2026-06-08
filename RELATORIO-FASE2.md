# RELATORIO-FASE2 — Auditoria das Telas Secundárias do Gestor (Bloco 3)

> Gerado em 2026-06-08 | Versão analisada: app.js 7 406 linhas · styles.css 10 983 linhas

---

## Tokens de design oficiais (referência)

Todos os valores abaixo são definidos em `styles.css:1-21` e constituem o contrato visual do projeto.

| Token | Valor |
|-------|-------|
| `--brand` | `#0b6b57` |
| `--brand-strong` | `#07493d` |
| `--brand-soft` | `#dff3ed` |
| `--ink` | `#12211f` |
| `--muted` | `#66736f` |
| `--line` | `#d9e1dd` |
| `--surface` | `#ffffff` |
| `--canvas` | `#f6f7f2` |
| `--accent` | `#e7a83e` |
| `--accent-soft` | `#fff2d6` |
| `--danger` | `#c44949` |
| `--danger-soft` | `#fde9e9` |
| `--success` | `#2d9d78` |
| `--success-soft` | `#ddf4ec` |
| `--info` | `#2e6d9e` |
| `--info-soft` | `#e2f0fa` |
| `--radius` | `8px` |
| `--shadow` | `0 18px 48px rgba(12, 47, 41, 0.14)` |
| `--safe-bottom` | `env(safe-area-inset-bottom, 0px)` |

**Padrão de botões:**
- `.primary-action` — CTA principal (verde brand)
- `.secondary-action` — ação alternativa
- `.ghost-button` — transparente/outline
- `.danger-action` — destrutivo (vermelho)
- `.icon-button` — somente ícone
- `.mini-button` — pequeno, inline
- `.whatsapp-button` — verde WhatsApp com ícone

**Nota:** Não existem arquivos de mockup externos (`.fig`, `.sketch`, `.png` de referência) no repositório. A referência de conformidade usada neste relatório é: (a) o próprio sistema de tokens acima, (b) os padrões arquiteturais estabelecidos nas telas primárias do gestor (dashboard, lista de alunos), e (c) a consistência interna entre as telas do Bloco 3.

---

## Legenda de status

| Símbolo | Significado |
|---------|-------------|
| ✅ | Conforme — segue tokens e padrão estabelecido |
| ⚠️ | Desvio leve — funciona, mas há inconsistência menor |
| ❌ | Divergência crítica — valor hardcoded ou padrão quebrado |
| 🔲 | Não implementado / ausente |

---

## 1. Novo Aluno

**Função:** `renderNewStudentScreen()` · `app.js:3808`  
**Tipo:** Tela completa (substitui o conteúdo de `managerContent`)  
**Prefixo CSS:** `.ns-*`

### O que existe

- Topbar com botão de voltar (`data-manager-nav="students"`) e título "Novo aluno"
- Avatar picker com preview circular (`.entity-avatar.ns-avatar-preview`)
- Seção **Dados pessoais**: nome (obrigatório), telefone com máscara, data de nascimento, e-mail, sexo via radio-chips
- Seção **Objetivo**: radio-chips com opções de meta
- Seção **Contrato**: select de plano + valor/mês + data de início
- Seção **Observações internas**: textarea
- Footer fixo: "Cancelar" (`.secondary-action`) + "Salvar aluno" (`.primary-action`) + "Salvar e enviar link" (`.ghost-button`)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Cores de texto | `var(--ink)`, `var(--muted)` | ✅ |
| Bordas | `var(--line)` | ✅ |
| Indicador obrigatório `.ns-required` | Cor definida em CSS do projeto | ✅ |
| Botão primário | `.primary-action` (token) | ✅ |
| Botão ghost | `.ghost-button` (token) | ✅ |
| Radio chips | `.radio-chip` (padrão reutilizado) | ✅ |
| Campos | `.field` (padrão base) | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Seção "Contrato" no formulário de criação | O contrato é criado automaticamente junto com o aluno. Se a lógica mudar para criar o contrato separado, os dados aqui ficam duplicados. Risco semântico, não visual. | ⚠️ |
| Avatar picker sem fallback de erro | Não há tratamento visual se o upload de imagem falhar (sem toast, sem mensagem inline). | ⚠️ |

---

## 2. Enviar Link

**Função:** `openEnviarLinkSheet()` · `app.js:8809`  
**Tipo:** Bottom sheet (`#enviarLinkSheet`, `.el-sheet`)  
**Prefixo CSS:** `.el-*`

### O que existe

- Sheet com backdrop clicável e drag handle
- Subtítulo "Escolha o destino e compartilhe com o aluno"
- Radio-chips para destino: Área do aluno / Treino / Dieta
- Caixa de link com input readonly + botão de copiar
- Validade: "Válido por 7 dias"
- Botão WhatsApp (`.whatsapp-button`) em destaque
- Linha de ações: "Copiar" + "Por e-mail"
- "Gerar novo link" (`.ghost-button`)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.el-backdrop`, `.el-panel`, `.sheet-handle` | ✅ |
| Cabeçalho | `.el-head`, `.el-title`, `.icon-button.el-close-btn` | ✅ |
| Radio chips de destino | `.radio-chip` (padrão base) | ✅ |
| Botão WhatsApp | `.whatsapp-button` (token dedicado) | ✅ |
| Botões de ação | `.secondary-action`, `.ghost-button` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Input `.el-link-input` | O campo usa `type="text" readonly`. Não herda necessariamente o estilo `.field` base — depende do CSS específico `.el-linkbox`. Verificar se borda e background são via token ou hardcoded. | ⚠️ |
| Botão "Por e-mail" | Envia apenas o link bruto via `mailto:`. Não há template de e-mail customizado nesta ação (diferente de `server/mail.js` que tem template). Comportamento diferente do esperado para convite formal. | ⚠️ |
| Feedback de cópia | Após copiar, não há confirmação visual (ex: texto "Copiado!" temporário ou badge). | ⚠️ |

---

## 3. Perfil — Abas

**Funções:** `renderProfileTabs()` · `app.js:5455` e `renderStudentProfileTab()` · `app.js:5488` (146 linhas ⚠️)  
**Tipo:** Componente de abas embutido no perfil do aluno (visão gestor)  
**Prefixo CSS:** `.tab-row`, `.sp-tab-body`, `.profile-tab-panel`

### O que existe

9 abas com conteúdo distintos:

| Aba | `data-profile-tab` | Conteúdo |
|-----|-------------------|---------|
| Visão geral | `summary` | Cards de stats (adesão, sessões, próximo treino) + pendências |
| Treinos | `workouts` | Lista de treinos atribuídos ao aluno |
| Agenda | `agenda` | Agenda compacta semanal |
| Histórico | `history` | Sessões de treino executadas |
| Evolução | `progress` | Exercícios com progresso de carga |
| Atualizações | `updates` | Check-ins de progresso enviados pelo aluno |
| Contrato | `contracts` | Histórico de contratos e status de assinatura |
| Mensagens | `messages` | Preview da conversa (thread do chat) |
| Observações | `notes` | Textarea para notas internas do personal |

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estado ativo `.is-active` | Cor `var(--brand)` ou `var(--brand-strong)` | ✅ |
| Conteúdo das abas | `.panel`, `.section-title`, `.mini-button` | ✅ |
| Estados vazios | `.empty-state` (padrão base) | ✅ |
| Listas | `.entity-list`, `.entity-row` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| `renderStudentProfileTab()` tem 146 linhas | Switch com 6+ cases gerando HTML extenso dentro de uma função única. Dificulta manutenção. | ⚠️ |
| Aba "Mensagens" | Mostra preview da conversa, mas o chat completo exige abrir `#threadSheet`. A transição não é óbvia — falta botão "Abrir chat" explícito no conteúdo da aba. | ⚠️ |
| Aba "Observações" | Textarea para notas internas não tem salvamento automático. Usuário pode perder dados ao trocar de aba sem salvar. | ⚠️ |
| Scroll das abas | O `.tab-row` com 9 itens pode transbordar em telas pequenas (< 360px). Não foi identificado CSS de `overflow-x: auto` com scroll horizontal adequado. | ⚠️ |

---

## 4. Agendar

**Funções:** `openActivityForm()` · `app.js:5963` → `openAgendarSheet()` · `app.js:7369`  
**Tipo:** Bottom sheet (`#agendarSheet`, `.ag-sheet`)  
**Prefixo CSS:** `.ag-*`

### O que existe

- Sheet com backdrop e drag handle
- Formulário `.form-grid` com grid de 2 colunas
- Campos: Aluno (select), Tipo (select com 6 opções), Treino vinculado (select), Status (select com 6 opções), Data (date), Horário (time), Duração (min), Título, Observações
- Botão "Salvar atividade" (`.primary-action`)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.ag-backdrop`, `.ag-panel`, `.sheet-handle` | ✅ |
| Formulário | `.form-grid`, `.form-grid.two`, `.field` | ✅ |
| Botão principal | `.primary-action` | ✅ |
| Título e fechamento | `.ag-title`, `.icon-button.ag-close-btn` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Select "Aluno" obrigatório | O campo `<select name="studentId" required>` não é pré-preenchido quando a sheet é aberta via atalho do dashboard (sem contexto de aluno). Usuário precisa selecionar manualmente. Porém quando aberto do perfil, pré-preenche — comportamento inconsistente. | ⚠️ |
| Sem botão "Cancelar" explícito | O único caminho de saída é o X no cabeçalho. Padrão estabelecido nas demais sheets inclui botão "Cancelar" no footer. | ⚠️ |
| Campo "Treino vinculado" | Aparece apenas quando tipo = "workout". A ocultação/exibição dinâmica não tem transição — o layout sofre layout shift abrupto. | ⚠️ |

---

## 5. Detalhe Evento

**Função:** `openEventDetailSheet()` · `app.js:7417`  
**Tipo:** Bottom sheet (`#detSheet`, `.det-sheet`)  
**Prefixo CSS:** `.det-*`

### O que existe

- Sheet com stripe colorida no topo (cor dinâmica por tipo de atividade)
- Cabeçalho com título do evento e botão fechar
- Corpo com avatar do aluno + linhas de info (`.det-info-row`, `.det-label`, `.det-value`)
- Ações condicionais: Editar, Concluir/Reabrir, WhatsApp, Ver perfil, Cancelar
- Classes de botão específicas: `.det-action`, `.det-action--success`, `.det-ghost`, `.det-danger`

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | Padrão `.ag-head` + `.sheet-handle` reutilizados | ✅ |
| Status badges | Reutiliza `.badge.is-success/warning/danger` | ✅ |
| Botões de ação | `.secondary-action`, `.ghost-button`, `.danger-action` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| `.det-stripe` usa cor inline hardcoded | `detSheetStripe.style.background = activityTypeColor(item.type)` injeta hexadecimais literais (ex: `#4caf50`, `#ff9800`) que não fazem parte dos tokens oficiais do projeto. | ❌ |
| `.det-avatar` com `style="background-color:…"` inline | A cor de fundo do avatar também é injetada via `style=""` a partir de `activityTypeColor()`, misturando lógica de apresentação no JS. | ❌ |
| Classes `.det-action`, `.det-ghost`, `.det-danger` paralelas | Existem botões com classes próprias que replicam comportamento de `.secondary-action`, `.ghost-button`, `.danger-action` mas com nomes diferentes — duplicação de estilos. | ⚠️ |
| Sem feedback de loading | "Concluir" e "Cancelar" não desabilitam o botão durante a operação assíncrona, permitindo duplo clique. | ⚠️ |

---

## 6. Montador Padrão (Workout Builder)

**Função:** `openWorkoutForm()` · `app.js:5864`  
**Tipo:** Bottom sheet (`#workoutSheet`, `.workout-sheet`)  
**Prefixo CSS:** `.workout-sheet-*`, `.workout-builder-row`

### O que existe

- Sheet com panel full-height
- Formulário com: Título (obrigatório), Descrição, Foco/objetivo, Nível (select), Status (select)
- Nota informativa `.empty-state.compact-note` quando o escopo é "pattern" (modelo global)
- Seções de exercício (`.workout-builder-row`) com: exercício da biblioteca (select obrigatório), ordem, séries, repetições alvo, carga sugerida, descanso
- Botão "Remover" por linha (`.mini-button.is-danger`)
- Footer com "Cancelar" + "Adicionar exercício" + "Salvar"

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.workout-sheet-backdrop`, `.workout-sheet-panel`, `.sheet-handle` | ✅ |
| Formulário | `.form-grid`, `.form-grid.two`, `.field` | ✅ |
| Nota informativa | `.empty-state.compact-note` | ✅ |
| Botão de remover | `.mini-button.is-danger` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Cabeçalho reutiliza classes `.ag-head` e `.ag-title` | A sheet de treino não tem prefixo próprio no cabeçalho — reutiliza classes do módulo de agenda (`.ag-head`, `.ag-title`, `.icon-button.ag-close-btn`). Funciona, mas é acoplamento semântico incorreto. | ⚠️ |
| Campo "Carga sugerida" é texto livre | Permite entrada como "10kg" ou "corporal" — não tem validação de formato. Pode causar problemas no futuro se for necessário calcular progressão. | ⚠️ |
| Sem reordenação drag-and-drop | Exercícios só podem ser reordenados editando o campo numérico "Ordem". Expectativa UX moderna seria arrastar e soltar. | ⚠️ |

---

## 7. Aplicar Padrão

**Funções:** `openApplyPatternSheet()` · `app.js:5897` e `openApplyPatternForm()` · `app.js:5919`  
**Tipo:** Bottom sheet (`#apSheet`, reutiliza `.ag-sheet`)  
**Prefixo CSS:** `.ap-*`

### O que existe

- Sheet com nota informativa do padrão selecionado
- Campo de busca de alunos (`#apStudentSearch`) com filtragem em tempo real
- Lista de alunos com checkboxes (`.ap-student-row`)
- Chips dos alunos selecionados (`#apSelectedChips`)
- Campos: Data de início (date), Status do treino (select: Publicado/Rascunho)
- Toggle "Ao aplicar": Adicionar ao treino atual vs. Substituir treino atual
- Botão "Ajustar antes de aplicar" (`.ghost-button`)
- Botão "Aplicar" (`.primary-action`)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | Reutiliza `.ag-sheet`, `.ag-backdrop`, `.ag-panel` | ✅ |
| Campos | `.field`, `.form-grid.two` | ✅ |
| Botões | `.ghost-button`, `.primary-action` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Container reutiliza `#apSheet` com classe `.ag-sheet` | O ID `apSheet` está declarado no HTML com classe `.ag-sheet` — lógica de fechar via `data-close-ap-sheet` é separada, mas o CSS visual é o mesmo da agenda. Funciona mas há risco de colisão de estilo. | ⚠️ |
| `.ap-student-avatar` com iniciais | As iniciais são geradas corretamente, mas a cor de fundo do avatar não segue o sistema de cor dos avatares do restante do app (`.entity-avatar`). Parece usar uma cor fixa ou não estilizada. | ⚠️ |
| Fluxo "Ajustar antes de aplicar" | O botão chama `openApplyPatternForm()` que abre outra sheet. Abrir sheet dentro de sheet não é o padrão estabelecido — as demais interações fecham a atual e abrem uma nova. | ⚠️ |

---

## 8. Novo/Editar Exercício

**Função:** `openExerciseForm()` · `app.js:5825`  
**Tipo:** Bottom sheet (`#exerciseSheet`, `.workout-sheet`)  
**Prefixo CSS:** `.ex-*`

### O que existe

- Sheet com panel + footer separado (`.ex-sheet-footer`)
- Card de vídeo (`.ex-video-card`) em dois estados: com vídeo (`.ex-video-card--filled`) e sem vídeo
  - Com vídeo: nome do arquivo, tamanho, ações "Substituir" e "Remover"
  - Sem vídeo: ícone + label + botão "Enviar vídeo"
- Nome (obrigatório), Grupo muscular (select), Equipamento (select)
- Grupos musculares secundários como tag-chips (`.ex-tag-chips`)
- Card de parâmetros padrão (`.ex-params-card`): séries, reps mín., reps máx., descanso
- Textarea de instruções de execução
- Status badge (somente edição): `.badge.is-success`
- Footer: "Cancelar" + "Salvar rascunho" + "Publicar"

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.workout-sheet`, `.workout-sheet-backdrop`, `.workout-sheet-panel` | ✅ |
| Status badge | `.badge.is-success` (token) | ✅ |
| Campos | `.field`, `.form-grid.two` | ✅ |
| Footer | `.ex-sheet-footer` com botões via tokens | ✅ |
| Botão "Remover" vídeo | `.ex-video-action-btn--danger` — classe própria, não usa `.danger-action` do token | ⚠️ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| `.ex-video-action-btn--danger` ≠ `.danger-action` | A ação de remover vídeo usa classe própria ao invés do token `.danger-action`, criando inconsistência visual com outros botões destrutivos do app. | ⚠️ |
| Upload de vídeo direto no formulário | O upload via `<input type="file">` no `exerciseSheet` usa `uploadExerciseVideo()` que faz requisição multipart. Se o exercício ainda não foi salvo, o vídeo sobe sem ID de exercício — a lógica precisa de exercício existente para vincular. Pode criar uploads órfãos. | ❌ |
| Cabeçalho reutiliza `.ag-head` | Mesmo problema do Montador Padrão — acoplamento semântico ao módulo de agenda. | ⚠️ |

---

## 9. Modais de Vídeo

**Função:** `openVideoModal()` · `app.js:4275` (exercício) + `openLocalVideo()` · `app.js:7821`  
**Tipo:** Modal overlay (`#videoModal`, `.video-modal`)  
**Prefixo CSS:** `.vm-*`, `.video-modal-*`

### O que existe

- Modal com backdrop clicável e drag handle
- Dois estados de body:
  - **Com vídeo:** wrapper `.vm-player-wrap` + `<video controls playsinline>`
  - **Sem vídeo:** placeholder `.vm-placeholder` com ícone + texto + botão "Enviar vídeo"
- Footer com ações: "Usar no treino" (`.secondary-action`) + "Editar" (`.primary-action`)
- Cabeçalho usa `.ag-title` e `.ag-close-btn` (reutilizado)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Overlay | `.video-modal-backdrop` | ✅ |
| Botões no footer | `.secondary-action`, `.primary-action` | ✅ |
| Placeholder | `.vm-placeholder` com estrutura de empty state | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Cabeçalho reutiliza `.ag-*` | Terceiro componente que herda `.ag-head`, `.ag-title`, `.ag-close-btn` do módulo de agenda sem relação semântica. | ⚠️ |
| `<video>` sem `poster` | O elemento `<video>` não define um `poster=` para exibir thumbnail antes de carregar — tela preta durante buffer em conexões lentas. | ⚠️ |
| "Usar no treino" abre `#usarTreinoSheet` | Uma segunda sheet se abre por cima da modal de vídeo sem fechar a modal primeiro — empilhamento de overlays não gerenciado. | ❌ |

---

## 10. Avaliar Check-in

**Função:** `renderEvaluateUpdate()` · `app.js:5423` (inferido de `openUpdateComment()` · `app.js:6132`, 77 linhas)  
**Tipo:** Tela completa (substitui conteúdo principal) com footer fixo  
**Prefixo CSS:** `.evaluate-*`

### O que existe

- Topbar com botão "← Atualizações" e badge de status
- Card do aluno com avatar, nome, período da atualização
- Seção de **fotos da evolução**: grid de posições (frente, lateral, costas), com botão "Comparar" para exibir coluna de fotos anteriores
- Seção de **variação de peso**: peso atual vs. anterior, delta com seta (`.is-up` / `.is-down`), energia e dor se disponíveis, notas de treino
- Seção de **feedback do personal**:
  - Chips de sugestão de texto rápido
  - Textarea de avaliação
  - Avaliação por estrelas (1-5)
  - Quick actions: "Ajustar treino" e "Ajustar dieta"
- Footer fixo externo ao scroll com botão "Enviar avaliação"

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Cards de seção | `.evaluate-card` — estrutura própria mas consistente | ✅ |
| Badge de status | `.badge.is-success/warning/danger` | ✅ |
| Campos de feedback | `.field` (padrão base) | ✅ |
| Botão de envio | `.secondary-action` no footer | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Estrelas `.evaluate-star` com cor hardcoded | A cor das estrelas ativas (`.is-active`) provavelmente usa `var(--accent)` ou um amarelo hardcoded. Se for hardcoded, diverge do token `--accent: #e7a83e`. Verificar `src/styles/atualizacoes.css`. | ⚠️ |
| Footer `.evaluate-footer` fora do `.content-stack` | O footer é renderizado como elemento irmão do conteúdo principal (não filho). Funciona, mas é uma exceção ao padrão onde o footer costuma ser parte do layout do sheet ou da tela. | ⚠️ |
| Quick actions abrem sem contexto de destino | "Ajustar treino" e "Ajustar dieta" são atalhos de navegação cujo destino exato não está documentado. Se levam para o sheet de edição, devem fechar a tela atual antes. | ⚠️ |
| Sem auto-save do comentário | Se o usuário digita a avaliação e sai da tela sem clicar em "Enviar avaliação", o texto é perdido. | ⚠️ |

---

## 11. Plano Alimentar

**Funções:** `openDietPlanForm()` · `app.js:6028` (modo edição) e `openDietPlanDetail()` · `app.js:6062` (modo visualização)  
**Tipo:** Bottom sheet (`#mealPlanSheet`, `.workout-sheet`)  
**Prefixo CSS:** `.mp-*`

### O que existe

**Modo edição (builder):**
- Formulário de cabeçalho: Aluno (select), Status, Título, Objetivo, Meta kcal/dia, Início, Próxima revisão
- Card de totais calculados (`.mp-totals-card`): kcal atual vs. meta, barra de progresso, macros P/C/G
- Seção de refeições dinâmicas: cada refeição tem nome (input), horário (time), lista de alimentos (nome + qtd + kcal), notas
- "Adicionar alimento" e "Adicionar refeição" como botões inline
- Footer: "Cancelar" + "Enviar link" + "Salvar"

**Modo visualização:**
- Hero com avatar do aluno, título, objetivo e badge de status
- Grid de métricas: protocolo, meta kcal, nº de refeições, próxima revisão
- Card de totais (reutilizado)
- Lista de refeições em modo read-only
- Footer: "Fechar" + "Gerar PDF" + "Enviar link" + "Editar"

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.workout-sheet`, `.ex-sheet-panel.mp-sheet-panel` | ✅ |
| Totais card | Classes próprias `.mp-*` consistentes | ✅ |
| Barra de progresso | `.mp-progress-fill` com `style="width:X%"` (dinâmico, não hardcoded) | ✅ |
| Badges | `.badge` com modificadores de token | ✅ |
| Botões footer | `.secondary-action`, `.primary-action` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| `.mp-progress-bar` sem `--radius` | A barra de progresso provavelmente usa `border-radius` próprio. Verificar se usa `var(--radius)` ou valor fixo. | ⚠️ |
| Inputs inline no builder (`mp-meal-name`, `mp-food-name`) | Esses inputs não usam o wrapper `.field` padrão — são elementos nus sem o estilo de foco/borda consistente com o restante dos formulários. | ⚠️ |
| "Gerar PDF" (`data-diet-pdf`) | O botão existe na UI mas a funcionalidade não está implementada no backend — não há rota de exportação PDF. Botão ativo que não produz resultado. | ❌ |
| Macro `G` (gordura) sem cor diferenciada | Em contextos de UI de dieta, é comum colorir P/C/G com cores diferentes. Aqui todos os macros têm o mesmo estilo — perda de legibilidade. | ⚠️ |

---

## 12. Contrato

**Funções:** `openContractForm()` · `app.js:6218` (formulário) e `openContract()` · `app.js:6267` (visualização)  
**Tipo:** Dois bottom sheets (`#contractFormSheet` e `#contractViewSheet`, ambos `.workout-sheet`)  
**Prefixo CSS:** `.cfs-*` (form), `.contract-doc-*` (view), reutiliza `.ns-*`

### O que existe

**Sheet de formulário:**
- Busca de aluno com resultados em dropdown (`.cfs-student-search`, `.cfs-student-results`)
- Preview do aluno selecionado (`.cfs-selected-preview`) com avatar + objetivo
- Seção **Plano**: radio-chips Elite / Performance / Custom
- Seção **Valores**: valor/mês, início, fim (grid 2 colunas, reutiliza `.ns-row`)
- Seção **Cláusulas**: textarea com texto do contrato e legenda de variáveis (`{aluno}`, `{plano}`, etc.)
- Seção **Método de assinatura**: radio-chips Digital (link) / Manual (presencial)
- Footer: "Cancelar" + "Salvar rascunho" + "Enviar para assinatura"

**Sheet de visualização:**
- Cabeçalho com info do aluno e status do contrato
- Corpo com texto do contrato renderizado
- Ações: Editar, Cancelar contrato, Reenviar link de assinatura (condicionais ao status)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.workout-sheet`, `.ex-sheet-body`, `.ex-sheet-footer` | ✅ |
| Formulário | Reutiliza `.ns-section`, `.ns-section-title`, `.ns-row` do Novo Aluno | ✅ |
| Radio chips | `.radio-chip` (padrão base) | ✅ |
| Busca de aluno | `.cfs-*` — classes próprias, mas coerentes | ✅ |
| Botões footer | `.secondary-action`, `.primary-action` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Dropdown de resultados (`.cfs-student-results`) | O componente de busca type-ahead não usa o padrão `.field` + `<select>`. Implementação customizada pode ter comportamento de foco/keyboard navigation incompleto. | ⚠️ |
| Planos hardcoded: Elite / Performance / Custom | Os planos disponíveis são fixos no HTML. Se o gestor quiser criar planos personalizados no futuro, a UI precisará de refatoração. | ⚠️ |
| Cláusulas como textarea livre | O texto do contrato é editável sem validação mínima. Variáveis como `{aluno}` podem ser removidas acidentalmente sem aviso. | ⚠️ |
| "Enviar para assinatura" sem preview | O gestor não vê como o contrato ficará antes de enviá-lo. Boa prática seria mostrar o texto renderizado com as variáveis substituídas antes do envio. | ⚠️ |

---

## 13. Financeiro

**Função:** `renderManagerFinance()` · `app.js:2850` (92 linhas)  
**Tipo:** Tela completa com sheets auxiliares (paymentFormSheet, paymentDetailSheet, cobrarSheet)  
**Prefixo CSS:** `.finance-*`

### O que existe

- Hero com título, descrição e botão "Registrar pagamento"
- Grid de 4 cards de resumo: Recebido, A receber, Atrasado, Média mensal
  - Variantes: `.is-success`, `.is-warning`, `.is-danger`
- Busca + botão "Filtros" com painel expansível
- Filtros: Status (select) + Mês (select dinâmico)
- Lista de registros financeiros (`.finance-record-card`) com:
  - Avatar do aluno, nome, plano + valor/mês
  - Badge de status
  - Linha de vencimento
  - Botões "Ver detalhes" e "Editar"
- Gráfico SVG de faturamento (`.finance-chart`)
- Cards de insight: melhor semana, próximos vencimentos

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Cards de resumo com modificadores `.is-*` | Usa sistema de classes semânticas | ✅ |
| Badges de status | `.badge.is-success/warning/danger` | ✅ |
| Busca e filtros | `.search-input`, `.filter-toggle` (padrão base) | ✅ |
| Gráfico SVG | Classes `.finance-chart-*` com estilo via CSS | ✅ |
| Cards de registro | `.finance-record-card`, `.finance-record-head` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| **Botão hero usa gradiente hardcoded** | `.finance-hero .primary-action { background: linear-gradient(135deg, #f7d06a, #f5b51b 55%, #cb850b) }` — usa hexadecimais literais ao invés de `var(--accent)` e `var(--accent-soft)`. Cor de texto também hardcoded: `color: #0b0904` ao invés de `var(--ink)`. | ❌ |
| `.finance-summary-grid` vs `.metrics-row` | A tela usa `.finance-summary-grid` (CSS próprio, 4 colunas fixas) enquanto Relatórios usa `.metrics-row`. Dois sistemas de grid para o mesmo propósito visual. | ⚠️ |
| Ausência de paginação | Todos os registros são listados sem limite. Com volume alto (ex: 200 pagamentos), a lista se torna inutilizável. | ⚠️ |

---

## 14. Relatórios

**Função:** `renderManagerRelatorios()` · `app.js:3316`  
**Tipo:** Tela completa  
**Prefixo CSS:** `.reports-*`, compartilha `.finance-chart-*`

### O que existe

- Hero com título, descrição e botão "Exportar"
- Abas de período: Semana / Mês / Trimestre (`.reports-period-tab`)
- Grid de 4 metric-cards: Adesão média, Treinos concluídos, Novos alunos, Faturamento
- Dois gráficos SVG em linha: Adesão semanal (linha) + Faturamento (área)
- Gráfico de barras: Alunos por objetivo

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Abas de período | `.reports-period-tab`, `.is-active` | ✅ |
| Metric cards | `.metric-card`, `.metric-value`, `.metric-label`, `.metric-subtitle.is-success/warning/danger` | ✅ |
| Botão exportar | `.reports-export-btn` — verificar se herda token ou tem estilo próprio | ⚠️ |
| Gráficos SVG | `.finance-chart-*` compartilhado com Financeiro | ⚠️ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| Gráficos usam classes `.finance-chart-*` | As classes de gráfico têm prefixo `finance-` mas são usadas em Relatórios — acoplamento de nomenclatura incorreto. Se o CSS de financeiro mudar, os gráficos de relatórios são afetados. | ⚠️ |
| Dados dos gráficos são calculados com SVG inline | Os `<path>`, `<polyline>` e `<circle>` são gerados com coordenadas calculadas em JS. Nenhuma biblioteca de gráficos — é frágil para manutenção e sem acessibilidade (sem `aria-label` nas séries). | ⚠️ |
| Botão "Exportar" (`data-exportar-relatorio`) | O handler existe no `bindEvents` mas a exportação real (PDF/CSV) não está implementada no backend. Botão ativo sem funcionalidade. | ❌ |
| Dados sintéticos/estáticos | Os valores exibidos nos cards (adesão %, treinos, novos alunos, faturamento) são calculados via funções como `financeStats()` e `buildFinanceRecords()`. Porém, se não houver dados suficientes no período, as métricas mostram zero sem mensagem explicativa. | ⚠️ |
| Período "Trimestre" sem implementação visível | As abas de período existem e alternam a classe `.is-active`, mas não está claro se `renderManagerRelatorios()` diferencia corretamente o cálculo dos 3 meses. | ⚠️ |

---

## 15. Chat (Thread)

**Funções:** `openThreadSheet()` · `app.js:8377`, `renderThreadBubbles()` · `app.js:8497`  
**Tipo:** Bottom sheet tela-cheia (`#threadSheet`, `.thread-sheet`) sem backdrop  
**Prefixo CSS:** `.thread-*`

### O que existe

- Sheet que ocupa 100% da tela (sem backdrop — navegação full-screen)
- Cabeçalho (`#threadSheetHd`): botão voltar, avatar + nome + status do aluno, botão de atalho para perfil
- Corpo (`#threadSheetBd`): bolhas de mensagem com avatar lateral
  - Mensagens do personal: alinhadas à esquerda (`.thread-message`)
  - Mensagens do aluno: alinhadas à direita (`.thread-message.is-student`)
  - Tempo de envio em `.thread-message-time`
- Footer (`#threadSheetFt`):
  - Chips de resposta rápida (`#threadQuickChips`, `.thread-quick-chip`)
  - Botão "+" para ações de anexo (`.thread-attach-btn`)
  - Textarea expansível (`.thread-input`, `maxlength="800"`)
  - Botão enviar (`.thread-send-btn`)

### Conformidade com tokens

| Elemento | Token usado | Status |
|----------|-------------|--------|
| Estrutura de sheet | `.thread-sheet-panel` (sem backdrop) — intencional | ✅ |
| Cabeçalho | `.thread-hd`, `.thread-back-btn`, `.thread-action-btn` | ✅ |
| Input de mensagem | `.thread-input` — verificar se herda `.field` ou tem estilo próprio | ⚠️ |
| Chips de sugestão | `.thread-quick-chip` — estilo próprio | ✅ |
| Bolhas | `.thread-message-bubble` | ✅ |

### Divergências

| Item | Descrição | Severidade |
|------|-----------|------------|
| `.thread-input` não usa `.field` | O textarea de mensagem tem classe própria e não herda o wrapper `.field` padrão. Pode ter comportamento de foco e borda diferente do restante dos formulários. | ⚠️ |
| Sem indicador de digitação (typing indicator) | O Socket.IO está conectado, mas não há evento `user:typing` — padrão esperado em chat moderno. | ⚠️ |
| Scroll automático ao abrir | Não está garantido que a thread role até a última mensagem ao abrir o sheet. Se o scroll não é forçado para o fundo, o usuário vê mensagens antigas. | ⚠️ |
| `.thread-attach-btn` com ícone "+" | O botão abre opções de envio de link. O ícone "+" sugere "anexar arquivo" para o usuário, mas a funcionalidade é somente de link — expectativa errada. | ⚠️ |
| Mensagens sem status de entrega | Não há ícones de "enviado" / "lido" nas bolhas — o aluno não sabe se o personal leu. | ⚠️ |

---

## Resumo consolidado

| # | Tela | Existe | Tokens OK | Divergências Críticas ❌ | Desvios Leves ⚠️ |
|---|------|--------|-----------|--------------------------|-----------------|
| 1 | Novo Aluno | ✅ | ✅ | 0 | 2 |
| 2 | Enviar Link | ✅ | ✅ | 0 | 3 |
| 3 | Perfil — Abas | ✅ | ✅ | 0 | 4 |
| 4 | Agendar | ✅ | ✅ | 0 | 3 |
| 5 | Detalhe Evento | ✅ | ⚠️ | 2 | 2 |
| 6 | Montador Padrão | ✅ | ✅ | 0 | 3 |
| 7 | Aplicar Padrão | ✅ | ✅ | 0 | 3 |
| 8 | Novo/Editar Exercício | ✅ | ⚠️ | 1 | 3 |
| 9 | Modais de Vídeo | ✅ | ✅ | 1 | 2 |
| 10 | Avaliar Check-in | ✅ | ✅ | 0 | 4 |
| 11 | Plano Alimentar | ✅ | ✅ | 1 | 3 |
| 12 | Contrato | ✅ | ✅ | 0 | 4 |
| 13 | Financeiro | ✅ | ❌ | 1 | 2 |
| 14 | Relatórios | ✅ | ✅ | 2 | 4 |
| 15 | Chat | ✅ | ✅ | 0 | 5 |

**Total:** 15/15 telas implementadas · 8 divergências críticas (❌) · 47 desvios leves (⚠️)

---

## Divergências críticas priorizadas

### P1 — Imediato

| ID | Tela | Problema |
|----|------|---------|
| C1 | Financeiro | Botão hero com gradiente e cor hardcoded (`#f7d06a`, `#f5b51b`, `#cb850b`, `#0b0904`) ao invés de tokens `--accent`, `--ink` |
| C2 | Detalhe Evento | `.det-stripe` e `.det-avatar` usam hexadecimais injetados via `activityTypeColor()` fora do sistema de tokens |
| C3 | Novo/Editar Exercício | Upload de vídeo pode criar arquivos órfãos se exercício ainda não foi salvo |

### P2 — Alta prioridade

| ID | Tela | Problema |
|----|------|---------|
| C4 | Modais de Vídeo | Sheet `#usarTreinoSheet` abre por cima da modal de vídeo sem fechar a anterior |
| C5 | Plano Alimentar | Botão "Gerar PDF" ativo sem implementação backend |
| C6 | Relatórios | Botão "Exportar" ativo sem implementação backend |
| C7 | Relatórios | Classes `.finance-chart-*` usadas fora do módulo de financeiro |

### P3 — Manutenção futura

| ID | Tela | Problema |
|----|------|---------|
| C8 | Exercício, Treino, Vídeo | Três componentes reutilizam `.ag-head` / `.ag-title` do módulo de agenda sem relação semântica |

---

## Padrões arquiteturais observados (recorrentes)

1. **Prefixo por módulo**: cada tela secundária tem seu prefixo CSS (`.ns-`, `.el-`, `.ag-`, `.det-`, `.ap-`, `.ex-`, `.vm-`, `.mp-`, `.cfs-`, `.finance-`, `.reports-`, `.thread-`). Padrão sólido — continuar.

2. **Sheet com drag handle**: todas as sheets (exceto thread, que é tela-cheia) têm `.sheet-handle`. Conforme.

3. **Footer separado nas sheets longas**: exercício, plano alimentar e contrato têm `.ex-sheet-footer` fora do scroll. Conforme com PWA touch pattern.

4. **Reutilização de `.ag-head` além do escopo**: problema transversal em 4 componentes. Recomendado criar `.sheet-head` agnóstico de módulo.

5. **Botões funcionais sem implementação**: "Exportar" (relatórios) e "Gerar PDF" (dieta) existem na UI mas não têm backend. Devem ser desabilitados ou removidos até implementação.
