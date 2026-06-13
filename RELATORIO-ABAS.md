# RELATORIO-ABAS — Mapa de Lapidação UI

> Data: 2026-06-13  
> Escopo: todas as abas primárias e telas secundárias de ambos os perfis (personal/manager e aluno/student)  
> Objetivo: documentar estado visual atual, inconsistências, cortes/vazamentos e o que falta para o nível premium.  
> Referências de linha são do `app.js` (13 341 linhas).

---

## LEGENDA DE SEVERIDADE

| Símbolo | Significado |
|---------|-------------|
| 🔴 | Quebra visual / funcional imediata |
| 🟡 | Inconsistência ou roughness perceptível |
| 🟢 | Melhoria de polish que eleva para premium |

---

---

# PERFIL PERSONAL (MANAGER)

---

## 1. Dashboard (`renderManagerHomeV2` — linha 3061)

### Estado visual atual
- Hero section com título "Dashboard" + subtítulo + botão "Agendar atividade" (`btn-action-header`).
- Duas linhas de métricas: `metrics-row--3` (3 cards) + `metrics-row--2` (2 cards), usando `stdMetricCard`/`dashboardMetricCard`.
- Painel "Pendências" com lista de até 4 itens agregados por categoria (ícone + tone + link para aba).
- Grid `dashboard-main-grid` com "Agenda de hoje" (máx 3 itens) e "Ações rápidas" (4 quick-links).
- `renderWeeklySummary()` ao final (cards de semana por aluno).

### Inconsistências 🟡
- `metrics-row--2` com 2 cards usa classe diferente das demais rows, mas não há variante responsiva definida — em mobile os 2 cards ficam lado a lado sem wrap, podendo ficar estreitos demais.
- "Ações rápidas" usa ícone `icons.progress` no botão "Relatórios" (linha 3181) — icon semanticamente errado (deveria ser `icons.reports`).
- Botão "Ver todas ›" de Pendências navega para `updates`, mas pendências incluem pagamentos e contratos — rota enganosa.

### Itens cortados/vazando 🔴
- `dashboard-weekly-summary` (renderWeeklySummary) não tem `overflow:hidden` — se o nome do aluno for longo, o texto vaza do card em mobile.
- Em telas < 360 px, os 5 cards de métrica (`metrics-row--3` + `metrics-row--2`) podem stack de forma inconsistente sem `min-width` explícito.

### O que falta para premium 🟢
- Saudação personalizada com nome do personal (ex: "Bom dia, Paulo!") acima do hero.
- Gráfico sparkline de adesão semanal inline nos cards de métricas (igual ao que existe em Relatórios).
- Animação de entrada (fade + slide up) nos cards de métricas ao carregar o dashboard.
- Estado "vazio perfeito" quando não há alunos: onboarding guiado com 3 passos visuais.
- Cores de tone nos cards de pendência (`is-danger`, `is-warning`) — existem no JS mas precisam confirmar que os CSS custom properties estão definidos para todos os temas.

---

## 2. Alunos (`renderStudentsScreen` — linha 4246)

### Estado visual atual
- Hero section com "Alunos" + botão "Novo" (`btn-action-header`).
- Barra de busca (`student-search-field`) + 3 filtros por select (Status / Objetivo / Contrato), cada um com ícone SVG inline.
- Lista de cards (`student-card-list`) via `renderStudentRow` ou `emptyState`.

### Inconsistências 🟡
- `student-filter-grid` contém 3 `<label class="student-filter">` mas não há `flex-wrap` explícito — em telas médias os 3 filtros podem ficar lado a lado pressionados ou fazer wrap inesperado dependendo do CSS em `alunos.css`.
- Filtro "access_pending" e "contract_pending" usam underscore nos valores de option mas o label aparece com espaço — não afeta funcionalidade, mas é inconsistente com os outros valores.
- `renderStudentRow` (linha 4555): não lido aqui mas é o card de cada aluno — verificar se há truncamento de nome longo.

### Itens cortados/vazando 🟡
- Busca e filtros não têm `sticky` — scrollar a lista longa perde o campo de busca (sem recorrência ao topo).
- Nenhum controle de paginação ou virtualização para listas longas (> 50 alunos).

### O que falta para premium 🟢
- Sticky na seção de busca + filtros (`.student-search-panel { position: sticky; top: var(--header-h); z-index: 15; }`).
- Contador de resultados inline no campo de busca ("8 alunos").
- Avatar + status badge colorido nos cards da lista.
- Ordenação clicável (por nome / data de cadastro / status).
- Chip de filtro ativo removível acima da lista (igual ao padrão já existente em Padrões/Financeiro).

---

## 2a. Novo / Editar aluno (`renderNewStudentScreen` — linha 4321)

### Estado visual atual
- Tela full-page com topbar (botão fechar → volta para `students`).
- Form de cadastro com campos: nome, e-mail, telefone, objetivo, sexo, nível, data de nascimento.
- Campos de meta: peso atual, peso alvo, altura.
- Textarea de observações.

### Inconsistências 🟡
- Topbar usa classe `.ns-topbar` / `.ns-close` — pattern diferente de todas as outras telas que usam `.sp-topbar` ou `evaluate-topbar`.
- `levelOptions` usa valores sem acento ("Iniciante", "Intermediario", "Avancado") — o item "Intermediario" está sem acento (deveria ser "Intermediário").
- Não há preview de avatar/foto antes de salvar.

### Itens cortados/vazando 🔴
- Tela é renderizada como `content-stack` dentro de `managerContent` — se a lista de campos for longa, o padding-bottom pode não compensar o bottom-nav em mobile, cortando o botão Salvar.

### O que falta para premium 🟢
- Seção de dados dividida em steps/accordion: "Identificação" → "Objetivo" → "Dados físicos" → "Observações".
- Validação inline nos campos (email format, peso range razoável).
- Feedback visual de "Aluno criado com sucesso" com animação de confetti/check.
- Upload de foto de perfil diretamente no cadastro.

---

## 2b. Enviar link (`enviarLinkSheet`)

### Estado visual atual
- Bottom sheet com título `#elSheetTitle`, corpo com instruções de compartilhamento do link de acesso do aluno, botão copiar link + opção WhatsApp.

### Inconsistências 🟡
- Backdrop usa classe `.el-backdrop` enquanto a maioria usa `.ag-backdrop` — classes de backdrop inconsistentes entre sheets.
- Não há feedback visual de "Link copiado!" além do possível toast.

### O que falta para premium 🟢
- QR code gerado inline do link de acesso.
- Campo de preview do link com seleção automática ao focar.
- Botão WhatsApp com mensagem pré-preenchida usando o template de `state.data.settings.whatsappTemplate`.

---

## 3. Agenda (`renderAgendaScreen` — linha 5871)

### Estado visual atual
- Hero com título "Agenda" + botão "Agendar atividade" (apenas manager).
- `agenda-control-panel` com tabs Dia / Semana / Mês + controles de navegação prev/next + botão "Hoje".
- Visualização semana: `renderWeekCalendar` com grid de 7 colunas e slots de hora.
- Visualização mês: `renderMonthCalendar`.
- `agenda-day-panel` com `renderAgendaList` (itens do dia selecionado).
- Legenda de tipos de atividade `renderAgendaLegend`.

### Inconsistências 🟡
- Em modo "Dia" (`isDayView = true`) o calendário de semana/mês é ocultado (`${isDayView ? "" : ...}`), mas o `agenda-day-panel` sempre aparece — o usuário perde a âncora visual de "qual dia está selecionado" em modo Dia.
- `agenda-view-tabs` usa `<button>` simples sem `role="tab"` + `aria-selected` — diferente do padrão `role="tablist"` já usado em Relatórios.
- `renderAgendaLegend` fica dentro do `panel agenda-calendar-panel` mas fora do painel de dia — pode criar um bloco visual sem contexto em mobile.

### Itens cortados/vazando 🔴
- `renderWeekCalendar` (linha 5956): grid de 7 colunas em mobile (360 px) — sem `overflow-x: auto` no wrapper, as colunas vão comprimir ou vazar lateralmente.
- `renderMonthCalendar` (linha 6014): grade mensal com 7 colunas × 6 linhas tem mesmo problema em mobile.

### O que falta para premium 🟢
- Scroll horizontal com snap nos slots de hora do calendário semanal em mobile.
- Mini-dots de cor abaixo dos dias no calendário mensal indicando tipo de atividade.
- Animação de transição ao mudar de período (slide left/right).
- Filtro por aluno no topo da agenda do manager.
- Evento com "estado" visual diferente para atividades concluídas (risco + opacidade).

---

## 3a. Agendar atividade (`agendarSheet`)

### Estado visual atual
- Bottom sheet com título `#agSheetTitle`, corpo `#agSheetBody` (form dinâmico), footer `#agSheetFooter`.
- Campos: tipo de atividade, aluno, data, hora, treino (se tipo = workout), notas.

### Inconsistências 🟡
- Footer usa `.ag-sheet-footer` mas referenciado no HTML como `#agSheetFooter` — dupla referência.
- Sem validação visual inline no campo data (aceita datas passadas sem aviso).

### O que falta para premium 🟢
- Select de tipo com ícones coloridos (visual igual à legenda da agenda).
- Preview inline do slot de tempo no calendário ao digitar data/hora.
- Recorrência: "Repetir semanalmente" checkbox.

---

## 3b. Detalhe do evento (`detSheet`)

### Estado visual atual
- Bottom sheet com título `#detSheetTitle`, corpo `#detSheetBody`, footer `#detSheetFooter`.
- Exibe tipo, aluno, data/hora, status, notas. Ações: editar, excluir, marcar como concluído, enviar lembrete WhatsApp.

### Inconsistências 🟡
- Footer e backdrop seguem padrão `.ag-backdrop` / `.det-backdrop` — dois backdrops distintos para o mesmo padrão.
- Botão "Enviar lembrete" abre WhatsApp nativo — sem fallback se usuário estiver no desktop.

### O que falta para premium 🟢
- Timeline visual do evento (criado → confirmado → concluído) com ícones e datas.
- Foto/avatar do aluno no cabeçalho do sheet.
- Ação "Duplicar" para criar evento similar.

---

## 4. Padrões de treino (`renderManagerWorkouts` — linha 5197)

### Estado visual atual
- Hero com eyebrow "Elite AS", título "Padrões de treino", subtítulo, botão "Novo padrão".
- `metrics-row--3` com Total / Rascunhos / Publicados.
- Barra de busca + botão "Filtrar" com chevron animado; painel de filtros expansível (Status / Objetivo / Nível).
- `pattern-card-list` com `renderPatternCard`.

### Inconsistências 🟡
- Filtros de Padrões usam `data-toggle-workout-filter` (state `workoutFilterOpen`) + `details` nativo para Contratos e `<div>` expansível para Financeiro — 3 padrões diferentes para o mesmo componente de filtro.
- `patternGoalOptions` mescla objetivos fixos + objetivos livres dos workouts — se o personal digitar "hipertrofia" (minúsculo) em um workout, ele aparece duplicado como "Hipertrofia" e "hipertrofia".

### Itens cortados/vazando 🟡
- `renderPatternCard` (linha 5296): não lido, mas `renderPatternExercisePreview` (linha 5361) usa `.pattern-exercise-preview` — se não houver `overflow:hidden` no card, uma lista longa de exercícios pode vazar.

### O que falta para premium 🟢
- Drag-and-drop para reordenar exercícios dentro do montador.
- Contagem de alunos usando cada padrão no card.
- Preview expandível inline do card (lista de exercícios + séries) sem abrir o sheet.
- Badge "Em uso" / "Nunca usado" nos cards.

---

## 4a. Montador de treino (`workoutSheet`)

### Estado visual atual
- Bottom sheet full-height com título `#workoutSheetTitle`, corpo `#workoutSheetBody`, footer `#workoutSheetFooter`.
- Campos: título, descrição, objetivo/foco, nível, status.
- Lista de exercícios adicionados com carga/reps/descanso por série.
- Botão "Adicionar exercício" abre `usarTreinoSheet`.

### Inconsistências 🟡
- Sheet full-height usa backdrop `.workout-sheet-backdrop` — mesmo backdrop compartilhado com `exerciseSheet`, `mealPlanSheet` e `contractFormSheet`. Se dois desses sheets estiverem abertos (fluxo aninhado), fechar um fecha todos.
- Campo "nível" sem label visual de hint (Iniciante / Intermediário / Avançado) — precisa abrir o select para ver as opções.

### Itens cortados/vazando 🔴
- Em mobile com teclado aberto, o footer com botão Salvar pode ficar oculto atrás do teclado virtual se não houver `padding-bottom: env(keyboard-inset-height)` ou equivalente.

### O que falta para premium 🟢
- Reorder de exercícios por drag handle.
- Estimativa automática de duração total do treino (soma de séries × tempo por série + descanso).
- Preview de execução antes de publicar.

---

## 4b. Aplicar padrão (`apSheet`)

### Estado visual atual
- Bottom sheet com título `#apSheetTitle`, corpo `#apSheetBody`, footer `#apSheetFooter`.
- Seleciona aluno + data de início para aplicar o padrão como treino publicado.

### Inconsistências 🟡
- Backdrop usa `.ag-backdrop` — mesmo que `agendarSheet`, `paymentFormSheet`, etc.
- Sem validação se o aluno já tem treino com o mesmo título publicado.

### O que falta para premium 🟢
- Preview das diferenças entre o padrão e o treino atual do aluno (se houver).
- Opção de "Substituir treino atual" vs. "Adicionar como novo".

---

## 5. Biblioteca (`renderExerciseLibraryPremium` — linha 4666)

### Estado visual atual
- Hero com eyebrow "Elite AS", h2 "Biblioteca de exercícios", subtítulo, botão "Novo exercício".
- `library-stat-grid` com 3 stat cards: Total / Com vídeo / Categorias.
- Barra de busca + `<details class="library-filter-menu">` com 4 selects (Músculo / Equipamento / Status / Vídeo).
- `library-card-list` com `renderPremiumExerciseCard`.
- Há um `return` duplo na função `renderExerciseLibrary` (linha 4633) — o bloco HTML "legado" é código morto/nunca renderizado (atenção: dead code).

### Inconsistências 🔴
- Dead code: linha 4633 (`return \`...`) é inalcançável pois `return renderExerciseLibraryPremium(...)` na linha 4631 sempre retorna antes. Confunde leitura do código.

### Inconsistências 🟡
- `<details>` nativo para filtros da Biblioteca vs. `<button data-toggle-*>` em Padrões e Financeiro — 3 padrões diferentes de toggle de filtro no mesmo app.
- `library-filter-menu > summary` sem ícone de filtro consistente com os outros painéis (Padrões usa SVG de linhas, Biblioteca usa SVG de funil diferente).

### Itens cortados/vazando 🟡
- `renderPremiumExerciseCard` (linha 4736) inclui `renderExerciseVideoCallout` — se o exercício tiver URL longa de vídeo, o texto pode vazar do card sem `word-break: break-all`.

### O que falta para premium 🟢
- Thumbnails de vídeo (poster frame) nos cards com vídeo.
- Agrupamento por grupo muscular com cabeçalho sticky de seção.
- Contagem de uso do exercício (quantos treinos o usam).
- Import em lote via CSV/JSON.

---

## 5a. Novo / Editar exercício (`exerciseSheet`)

### Estado visual atual
- Bottom sheet full-height com `#exerciseSheetTitle`, `#exerciseSheetBody`, `.ex-sheet-footer`.
- Campos: nome, grupo muscular (multi), equipamento, descrição, notas técnicas, status, vídeo (URL YouTube ou upload).
- Player de vídeo inline `renderVideoPlayer` / `renderYouTubeEmbed`.

### Inconsistências 🟡
- Footer usa classe `.ex-sheet-footer` (diferente de `#exerciseSheetFooter`) — referência por class vs. ID inconsistente.
- Campo de vídeo aceita URL YouTube e upload local, mas sem validação de formato de URL.

### Itens cortados/vazando 🔴
- Player de vídeo embutido (`renderYouTubeEmbed`) usa `<iframe>` com `aspect-ratio: 16/9` — se o container não tiver `width: 100%` garantido, o iframe pode vazar horizontalmente no sheet.

### O que falta para premium 🟢
- Preview do vídeo diretamente no sheet após colar a URL (sem precisar salvar primeiro).
- Chips visuais de grupo muscular (não select múltiplo).
- Upload de thumbnail customizado.

---

## 5b. Player de vídeo (`videoModal`)

### Estado visual atual
- Modal genérico `#videoModal` com `#videoModalTitle` e `#videoModalBody`.
- Corpo renderizado por `renderVideoPlayer` (vídeo HTML5) ou `renderYouTubeEmbed` (iframe).

### Inconsistências 🟡
- Backdrop usa `.video-modal-backdrop` — terceiro padrão de backdrop além de `.modal-backdrop` e `.ag-backdrop`.
- Modal não tem `max-height` explícito — em mobile portrait, o vídeo pode ficar muito pequeno ou o modal muito alto.

### O que falta para premium 🟢
- Controles de velocidade de reprodução (0.5×, 1×, 1.5×).
- Modo landscape lock sugerido ao abrir vídeo em mobile.

---

## 6. Atualizações (`renderManagerUpdates` — linha 6230)

### Estado visual atual
- Hero com eyebrow "Elite AS", título "Atualizações", subtítulo.
- `metrics-row--3` com Recebidas / Pendentes / Atrasadas.
- `update-filter-grid` com 3 selects (Aluno / Status / Período).
- Campo de data customizado inline quando período = "custom".
- `updates-list-panel` com `section-title` + contador + lista `renderUpdateCard`.

### Inconsistências 🟡
- `updateFilterSelect` usa classe `.update-filter` / `.update-filter-icon` enquanto o campo de data custom usa `style=""` inline (linha 6273) — único uso de style inline em todo o template.
- O contador mostra "X registro(s) encontrado(s)" mas o plural "s" em parênteses é visualmente feio e diferente do padrão usado em Financeiro ("X registro(s) em Mês").

### Itens cortados/vazando 🟡
- `renderUpdateCard` (linha 6542): inclui `renderUpdatePhotoStrip` — strip de 3 fotos pode vazar se as fotos tiverem tamanho variável e `.update-photo-strip` não tiver `overflow: hidden`.

### O que falta para premium 🟢
- Timeline visual por aluno (linha do tempo de check-ins).
- Ação bulk: avaliar todas as pendentes de uma vez.
- Notificação push quando aluno envia atualização.
- Comparativo de foto lado a lado (anterior × atual) com slider.

---

## 6a. Avaliar check-in (`renderEvaluateUpdate` — linha 6287)

### Estado visual atual
- Tela full-page com topbar: botão voltar + badge de status.
- Card do aluno com avatar + nome + data.
- Se pendente: empty state + botão para abrir perfil.
- Se enviado: seção de peso atual + delta vs. anterior + strip de fotos (atual × anterior lado a lado) + chips de sugestão de resposta + textarea de feedback + campo de rating (estrelas) + botão "Salvar avaliação".

### Inconsistências 🟡
- `evaluate-topbar` usa classes próprias vs. `sp-topbar` do perfil do aluno — terceiro padrão de topbar.
- Chips de sugestão (linha 6310): são strings hardcoded em português — sem internacionalização e sem possibilidade de personalização pelo personal.
- Rating em estrelas: `currentRating` lido de `update.evaluationRating` (0 se não avaliado) — não há feedback visual claro se a nota é obrigatória para salvar.

### Itens cortados/vazando 🟡
- `renderUpdatePhotoStrip` (linha 6610) com fotos em `detail = true` renderiza comparativo — se o aluno não enviou uma das 3 poses (Frente/Lado/Costas), o slot fica vazio mas reserva o espaço, criando lacunas brancas.

### O que falta para premium 🟢
- Slider interativo de comparação (foto anterior × atual com divisor arrastável).
- Histórico de avaliações anteriores do mesmo aluno abaixo.
- Envio de feedback como mensagem automática no chat do aluno.

---

## 7. Contratos (`renderManagerContracts` — linha 3430)

### Estado visual atual
- Hero com eyebrow "Elite AS", título "Contratos", subtítulo.
- `metrics-row--3` com Pendentes / Assinados / Próx. vencimentos.
- `<details class="contracts-filter-details">` com filtros (Status / Aluno / Plano).
- `contracts-list-panel` com lista `renderContractCard` + `renderNewContractCard` fixo no final.

### Inconsistências 🟡
- Usa `<details>` nativo para filtros (igual a Biblioteca) vs. `<button data-toggle>` de Padrões/Financeiro/Dieta — inconsistência de padrão já mencionada.
- `renderNewContractCard` (linha 3546) é um `<button>` com estilo de card — fora da `.contract-card-list`, posicionado após a lista. Em empty state, ele aparece logo após o `emptyState`, criando dois CTAs na mesma tela.
- `contractMetricCard` (linha 3489) é definido mas **nunca chamado** — `stdMetricCard` é usado no lugar. Dead code.

### Itens cortados/vazando 🟡
- `renderContractCard` (linha 3512): `.contract-card-actions` com até 3 botões (Visualizar + Reenviar + Gerar PDF) em linha — em mobile podem não caber, dependendo de `flex-wrap` no CSS de contratos.

### O que falta para premium 🟢
- Linha do tempo de status por contrato (Criado → Enviado → Visualizado → Assinado).
- Filtro rápido por "Vencendo nos próximos X dias" com destaque visual.
- Exportar lista de contratos em CSV.

---

## 7a. Novo contrato (`contractFormSheet`)

### Estado visual atual
- Bottom sheet full-height com `#contractFormTitle`, `#contractFormSheetBody`, `#contractFormSheetFooter`.
- Campos: aluno, plano, valor, data início, data fim, modelo de contrato (select), texto do contrato (textarea), opção de enviar e-mail imediatamente.

### Inconsistências 🟡
- Compartilha backdrop `.workout-sheet-backdrop` com workoutSheet, exerciseSheet e mealPlanSheet.
- Sem preview do contrato renderizado antes de salvar.

### O que falta para premium 🟢
- Preview live do contrato com variáveis substituídas enquanto o personal digita.
- Geração automática de PDF ao salvar (atualmente é manual via botão "Gerar PDF").
- Assinatura digital do personal no rodapé do contrato.

---

## 7b. Visualizar contrato (`contractViewSheet`)

### Estado visual atual
- Bottom sheet full-height com `#contractViewTitle`, `#contractViewSheetBody`, `#contractViewSheetFooter`.
- Exibe texto do contrato + status + dados do aluno.
- Botão para gerar PDF e reenviar.

### Inconsistências 🟡
- `renderContractPdfViewer` (linha 7100): usa `<iframe>` para PDF — em mobile Safari/Chrome, iframes com PDF têm comportamento imprevisível (pode abrir externamente ou não renderizar).

### O que falta para premium 🟢
- Renderização do texto do contrato com formatação (negrito, parágrafos) — atualmente pode ser plain text.
- Assinatura manuscrita digital (canvas touch).

---

## 8. Financeiro (`renderManagerFinance` — linha 3556)

### Estado visual atual
- Hero com título "Financeiro" + botão "Registrar pagamento".
- Banner demo (quando sem dados reais): aviso em destaque.
- `metrics-row` com 4 cards: Recebido / A receber / Em atraso / Alunos pagantes.
- Barra de busca + toggle de filtro (Status). Filtro expansível.
- `finance-month-panel` com navegação de mês prev/next, gráfico de barras SVG 6 meses (`renderFinanceChart`) + 3 KPIs (Faturamento / Ticket médio / Inadimplência).
- `finance-list-panel` com lista de mensalidades + "Ver todas".
- `finance-insights-panel` com 2 insight cards (Melhor semana / Próximos vencimentos).

### Inconsistências 🟡
- `metrics-row` (sem `--3` ou `--2`) — usa a classe base sem variante. A quantidade de 4 cards pode ficar diferente visualmente das outras seções com 3 cards.
- Campo de busca + filtro usa `search-filter-row` (mesmo padrão de Padrões e Dieta) — ok, porém o filtro de Financeiro só tem 1 select (Status) enquanto os outros têm 2-3, criando gap visual no `finance-filter-grid`.
- Gráfico SVG (`renderFinanceChart`): largura hardcoded (`viewBox` não lido aqui mas tipicamente fixo) — em mobile o gráfico pode não escalar corretamente se não houver `width: 100%; height: auto` no SVG.

### Itens cortados/vazando 🟡
- `finance-insights-panel > finance-insights-grid`: 2 cards em grid. Se a tela for muito estreita e os textos dos cards longos, pode vazar.

### O que falta para premium 🟢
- Gráfico de linhas de faturamento com área preenchida (premium feel).
- Exportar relatório financeiro do mês em PDF/CSV.
- Previsão de receita do próximo mês baseada nos contratos ativos.
- Ação "Cobrar" inline no card de mensalidade atrasada (abre WhatsApp com mensagem pré-formatada).

---

## 8a. Registrar pagamento (`paymentFormSheet`)

### Estado visual atual
- Bottom sheet com `#pfSheetTitle`, `#pfSheetBody`, `#pfSheetFooter`.
- Campos: aluno, valor, data de vencimento, data de pagamento, método, notas.

### Inconsistências 🟡
- Sem seletor de mês de referência — o personal pode registrar pagamento sem indicar a qual competência pertence.

### O que falta para premium 🟢
- Seletor de mês de referência.
- Autocomplete de valor a partir do contrato ativo do aluno.
- Opção de recorrência ("Criar para os próximos 12 meses").

---

## 8b. Detalhes de pagamento mensal / Cobrar

### Estado visual atual
- `paymentDetailSheet` com histórico de pagamentos do mês do aluno.
- `cobrarSheet` com resumo da dívida + link WhatsApp pré-formatado de cobrança.

### Inconsistências 🟡
- `cobrarSheet` usa `.ag-backdrop` — mesmo backdrop de agendarSheet. Conflito potencial se cobrar for aberto enquanto detalhes mensais estiver aberto.

### O que falta para premium 🟢
- Histórico completo de pagamentos do aluno no `paymentDetailSheet`.
- Comprovante de pagamento (upload de imagem) no registro.

---

## 9. Dieta (`renderManagerDiet` — linha 4049)

### Estado visual atual
- Hero com eyebrow "Elite AS", título "Dieta", subtítulo, botão "Novo plano alimentar".
- `metrics-row--3` com Planos ativos / Revisões pendentes / Próximas entregas.
- Barra de busca + toggle de filtro (Status / Objetivo). Filtro expansível.
- `diet-list-panel` com lista `renderDietPlanCard` + "Ver todos".
- `diet-insights-panel` com 2 insight cards (Próxima revisão / Sem plano ativo).

### Inconsistências 🟡
- `dietInsightCard` e `financeInsightCard` são funções distintas mas renderizam layout idêntico — poderiam ser um único `insightCard` genérico.
- Botão "Ver todos" (`data-diet-show-all`) não tem implementação de "ver menos" — uma vez expandido, não há como contrair.

### Itens cortados/vazando 🟡
- `renderDietPlanCard` (linha 4164): não lido em detalhe, mas card com nome do aluno + nome do plano + status + próxima revisão — se o nome do plano for muito longo pode vazar sem `text-overflow: ellipsis`.

### O que falta para premium 🟢
- Alerta inline para planos com revisão vencida (badge vermelho no card).
- Duplicar plano alimentar para outro aluno.
- Histórico de versões do plano.

---

## 9a. Plano alimentar (`mealPlanSheet`)

### Estado visual atual
- Bottom sheet full-height com `#mealPlanSheetTitle`, `#mealPlanSheetBody`, `#mpSheetFooter`.
- Campos de cabeçalho: título, objetivo, calorias totais, data de início, data de revisão, protocolo, instruções gerais.
- Lista de refeições com hora, nome e lista de alimentos (nome + qtd + kcal).
- Botão "Adicionar refeição".

### Inconsistências 🟡
- Footer ID `#mpSheetFooter` vs. título `#mealPlanSheetBody` — nomenclatura mista (mp vs. mealPlan).
- Compartilha backdrop `.workout-sheet-backdrop`.
- Campo de calorias totais é manual — não há soma automática das kcal dos alimentos.

### Itens cortados/vazando 🔴
- Lista de refeições longa (5+ refeições com 10+ alimentos cada) pode ultrapassar `100dvh` — precisa de `overflow-y: auto` dentro do sheet body com altura limitada a `calc(100dvh - header - footer)`.

### O que falta para premium 🟢
- Soma automática de macros (proteína / carbo / gordura) por refeição e total do dia.
- Biblioteca de alimentos com busca rápida e valores nutricionais TACO/IBGE.
- Preview de como o aluno vai ver o plano antes de publicar.

---

## 10. Mensagens (`renderManagerMessages` — linha 3279)

### Estado visual atual
- Header `.wa-inbox-header` com "Mensagens" + badge de não lidos.
- Campo de busca `.wa-inbox-search` (style WhatsApp).
- Se busca com resultado de novos alunos: seção "Iniciar nova conversa" com `renderNewConversationCard`.
- Lista de conversas `.wa-conv-list` com `renderConversationCard` (avatar + nome + último msg + time + badge não lidas).
- Thread abre via `threadSheet` (bottom sheet full-height).

### Inconsistências 🟡
- Não há `metrics-row` de resumo no topo (total de conversas / não lidas / aguardando) — único módulo operacional sem KPIs.
- `renderManagerMessages` não tem hero section com eyebrow "Elite AS" — único sem esse padrão entre os módulos principais.
- `renderConversationCard` trunca `last?.body` sem ellipsis explícito — depende do CSS `.wa-conv-bottom small`.

### Itens cortados/vazando 🟡
- `.wa-inbox` não tem `content-stack` wrapper — pode se comportar diferente dos outros módulos em relação ao padding e max-width.

### O que falta para premium 🟢
- Status de leitura no balão (✓✓ azul para lida, ✓✓ cinza para entregue).
- Filtros de conversa: Não lidas / Aguardando resposta / Recentes.
- Busca dentro de uma conversa.
- Mensagens por voz (áudio).
- Templates de resposta rápida.

---

## 11. Configurações (`renderSettings` — linha 7523)

### Estado visual atual
- `pageHeader("Configurações", ...)`.
- Seção 1 "Personal e WhatsApp": form com nome, telefone, email do personal + textarea do template WhatsApp + preview da mensagem.
- Seção "Dados do profissional": 6 campos (nome, CPF/CNPJ, telefone, email, endereço, CREF).
- Seção "Contrato e e-mail": assunto, mensagem, assinatura, template do contrato + preview.
- Botão "Salvar configurações".
- Seção 2 "Modelos de contrato": lista `renderContractModelCard` + botão "Novo modelo".
- Seção 3 "Sistema local" (`.demo-only`): dados de debug + botão "Limpar dados demo".

### Inconsistências 🔴
- Seção "Sistema local" com credenciais (`Admin@2026`) está em produção — a classe `.demo-only` precisa garantir que é removida/oculta em deploy real.

### Inconsistências 🟡
- Tudo num único `<form id="settingsForm">` com 3 seções distintas — salvar um campo de WhatsApp também submete todos os dados do profissional. Sem `<fieldset>` por seção.
- Preview do contrato usa `renderTemplate` + `contractVariables` com dados hardcoded (João, joao@email.com, (34) 99999-0000) — preview não reflete dados reais do personal.
- `preview-box` tem conteúdo em `<span>` — quebras de linha da mensagem WhatsApp podem não renderizar corretamente.

### Itens cortados/vazando 🟡
- Textareas longas (template de contrato) podem crescer muito e empurrar o botão Salvar para muito abaixo em mobile.

### O que falta para premium 🟢
- Divisão em cards/seções com save individual por bloco (não um único submit).
- Upload de logo/foto de perfil do personal.
- Notificações push: toggle de tipos de notificação (novos check-ins, pagamentos, mensagens).
- Aparência: seletor de tema (Gold / Ocean / Graphite) inline — já existe no CSS (`data-theme`), mas não há UI de seleção nas configurações.

---

---

# PERFIL ALUNO (STUDENT)

---

## 12. Início / Hoje (`renderStudentToday` — linha 5616)

### Estado visual atual
- Sem hero section própria — conteúdo começa direto.
- `streak-card` com ícone de chama + número de dias seguidos (ou motivação se 0).
- Card "Próxima atividade" (`next-activity-card`) com faixa colorida lateral (`--activity-color`), nome, data/hora, botão "Abrir".
- Se há treino hoje: `today-workout-row` com nome do treino + contagem de exercícios + botão "Abrir treino".
- Se sessão ativa: `active-session-banner--with-progress` com barra de progresso.
- `weight-widget`: exibe último peso + sparkline de evolução + tendência (↑ ↓ → ).
- Semana atual: cards de dias com status (feito / agendado / off) via `renderWeekCard`.
- KPIs do aluno: `metrics-row--2` com treinos na semana, treinos no mês, volume.

### Inconsistências 🟡
- Tela começa sem header/title identificador — diferente de todas as outras abas do aluno que usam `pageHeader(...)`.
- `today-workout-row` e `active-session-banner` podem coexistir — o banner é renderizado quando `hasActiveSession`, e o `todayWorkoutCard` quando `todayWorkoutItem` — se ambos estiverem presentes, dois CTAs conflitantes aparecem.
- `renderWeekCard` (linha 2884): componente separado mas chamado de dentro da função — não está documentado onde exatamente é inserido na hierarquia do DOM da home.
- O streak usa SVG de chama mas sem animação quando `is-lit` — o CSS de `microinteractions.css` pode ter a animação, mas precisa confirmar.

### Itens cortados/vazando 🟡
- `weight-widget-chart` (sparkline SVG): se o aluno tiver muitos registros de peso, o SVG com largura fixa comprime os pontos.
- `next-activity-card` com `style="--activity-color: ..."` custom property: se o tipo de atividade não tiver cor mapeada em `activityTypeColor`, a faixa fica sem cor (fallback não documentado).

### O que falta para premium 🟢
- Animação da chama de streak pulsando quando `is-lit`.
- Círculo de progresso da semana (7 arcos SVG) em vez de cards lineares.
- Mensagem motivacional dinâmica baseada no streak e horário do dia.
- Preview do próximo exercício do treino de hoje no card.

---

## 13. Treinos — Lista (`renderStudentWorkouts` — linha 5585)

### Estado visual atual
- Se sessão ativa: renderiza `renderWorkoutExecution()` diretamente.
- `pageHeader("Treinos", ...)`.
- Campo de busca (`diet-search-field` — **classe errada**) se houver treinos.
- Lista `sw-workout-list` com `renderStudentWorkoutCard`.

### Inconsistências 🔴
- Campo de busca usa a classe `.diet-search-field` (linha 5603) — classe de outro módulo. Inconsistência de namespace clara.

### Inconsistências 🟡
- `renderStudentWorkoutCard` (linha 5471): não lido mas inclui `renderWorkoutExercisePreview` — preview de exercícios em cards pode vazar se não houver truncamento.
- Sem feedback visual de "última vez que treinou com este workout" no card.

### O que falta para premium 🟢
- Indicador "Treinou X dias atrás" por card.
- Card com thumbnail/cor por objetivo de treino.
- Ordenação por recência / por ordem do personal.

---

## 13a. Detalhe do treino (`renderStudentWorkoutDetail` — linha 5542)

### Estado visual atual
- `pageHeader` com título do treino.
- Lista de exercícios com `renderStudentWorkoutDetailExercise` — nome, grupo muscular, sets × reps × carga sugerida, notas do coach.
- Botão "Iniciar treino" sticky no footer.

### Inconsistências 🟡
- `renderStudentWorkoutDetailExercise` (linha 5505): sem informação de equipamento — aluno não sabe o que vai precisar antes de ir para a academia.
- Botão "Iniciar treino" pode não ter sticky garantido se a lista for muito longa.

### O que falta para premium 🟢
- Lista de equipamentos necessários no topo.
- Histórico da última sessão com este treino (carga usada por exercício).
- Botão para assistir vídeo de cada exercício direto no detalhe.

---

## 13b. Execução do treino (`renderWorkoutExecution` — linha 7606)

### Estado visual atual
- `hero-panel` com "Treino em execução" + título + X séries / Y kg volume + botão Cancelar.
- Barra de progresso animada com `execution-progress-fill` (width dinâmico em %).
- Se em descanso: `renderRestBanner` com countdown + "Pular".
- `renderFocusSetCard` com: nome do exercício + músculo + badge Série N/M + dots de progresso + player de vídeo (se não em execução) + notas + meta chips (alvo / sugestão / descanso) + inputs de carga/reps + botão "Iniciar série" / "Finalizar série".
- `renderExecutionQueue` com fila de próximas séries.
- Botão "Finalizar treino" (desabilitado até completar tudo).

### Inconsistências 🟡
- `renderWorkoutCompleteCard` só exibe "Treino concluído!" + volume — sem CTA de "Ver resultado" ou "Compartilhar".
- `renderRestBanner`: countdown atualizado por `setInterval` — não lido aqui, mas se o intervalo não for limpo ao cancelar treino, pode causar memory leak.
- `just-done` class em `renderFocusSetCard` depende de `state.lastDoneKey` — animação CSS precisa de `@keyframes` confirmados em `microinteractions.css`.

### Itens cortados/vazando 🔴
- `execVideoPlayerHtml` embutido no focus card: iframe YouTube dentro do card de execução pode ser muito pequeno em mobile (< 250 px de altura) e o card inteiro pode ficar muito alto, empurrando os inputs de carga para fora da viewport sem scroll.

### O que falta para premium 🟢
- Tela de celebração pós-treino: confetti + tempo total + carga total + record pessoal quebrado.
- Gráfico de séries completadas em tempo real durante execução.
- Modo tela sempre ligada (Wake Lock API) durante o treino.
- Vibração ao finalizar série (Vibration API).

---

## 14. Dieta (`renderStudentDiet` — linha 7207)

### Estado visual atual
- `pageHeader("Dieta", ...)` com título do plano ativo.
- `renderStudentDietProtocolHero(currentPlan)`: hero panel com nome do plano + status badge + chips de info (kcal / refeições / próxima revisão).
- Se múltiplos planos: campo de busca entre planos.
- Lista de planos: `renderStudentDietPlanCard` por plano.
- Dentro de cada plano: lista de refeições `renderStudentMealCard` com checkbox de check diário.

### Inconsistências 🟡
- `renderStudentDietProtocolHero` (linha 7399): `sdp-head` sem conteúdo visível no trecho lido — precisa verificar restante da função.
- Checkbox de refeição completada é estado local (não persiste entre sessões se não salvo no backend).
- Campo de busca entre planos usa `.diet-search-field.search-input-wrap` (linha 7237) — consistente com Manager Dieta mas diferente do `.diet-search-field` sem wrapper usado em renderStudentDiet na busca de alimentos.

### O que falta para premium 🟢
- Persistência do estado de refeição completada (local storage ou backend).
- Contagem de macros consumidos vs. meta do dia.
- Foto das refeições pelo aluno (log alimentar visual).
- Alarme de horário de refeição (Notification API).

---

## 15. Agenda (`renderAgendaScreen` com studentId — linha 5871)

### Estado visual atual
- Mesma função que o Manager Agenda, mas sem botão "Agendar atividade" (isManager = false).
- Tabs Dia/Semana/Mês + navegação + agenda do dia.

### Inconsistências 🟡
- Aluno vê a mesma grade de calendário semanal/mensal que o manager — layout pode ser excessivamente denso para o caso de uso do aluno (que só precisa ver suas atividades).
- Sem diferenciação visual das atividades próprias vs. todas (o aluno sempre vê só as suas, mas o layout não reforça isso).

### O que falta para premium 🟢
- Modo padrão da agenda do aluno = Semana (mais intuitivo).
- Highlight do dia atual com cor de destaque no calendário.
- Atividade concluída com check mark visual no calendário.

---

## 16. Progresso (`renderStudentProgress` — linha 6771)

### Estado visual atual
- `pageHeader("Progresso", ...)`.
- Seção "Atualização quinzenal": botão para enviar peso+fotos+observações (se pendente) ou empty state (se em dia).
- Gráfico de peso corporal (`renderProgressWeightChart`) se ≥ 2 registros.
- Histórico de atualizações (`renderStudentUpdateHistoryRow`): data + badge de status + fotos em strip.
- `metrics-row--2` expandida (4 cards): Treinos na semana / no mês / total / Volume total.
- Gráfico de volume (`renderProgressVolumeChart`) se ≥ 2 sessões.
- Lista de últimos treinos (`renderSessionRow`).
- Evolução por exercício (`renderExerciseProgress`).

### Inconsistências 🟡
- `metrics-row--2` sendo usado com 4 cards (linha 6834-6838) — vai renderizar 4 cards em 2 colunas, mas com `--2` que pode definir max 2 colunas, o 3º e 4º podem quebrar em linha diferente sem alinhamento.
- Gráfico de peso e gráfico de volume são SVG com largura fixa — sem responsividade garantida.
- `renderStudentUpdateHistoryRow` (linha 6860): fotos com labels (Frente/Lado/Costas) sem `lazy-loading` — carrega todas as imagens ao abrir a aba.

### Itens cortados/vazando 🟡
- `evol-update-row` com strip de 3 fotos pode vazar horizontalmente se as fotos não tiverem `width: 100%; height: auto; object-fit: cover`.

### O que falta para premium 🟢
- Gráfico de peso interativo com tooltip no ponto ao tocar.
- Comparativo visual de foto (carrossel com swipe entre atualizações).
- Metas com barra de progresso (peso alvo, nível de treino).
- Export de progresso em PDF.

---

## 17. Chat / Mensagens (aluno)

### Estado visual atual
- Acessado via `data-open-my-chat` na aba Mais.
- Abre `threadSheet` com `#threadSheetHd`, `#threadSheetBd`, `#threadSheetFt`.
- `renderThreadHeader(student)` (linha 10260): avatar + nome do aluno + status.
- `renderThreadBubbles(studentId)` (linha 10287): lista de balões de mensagem com separadores de data.
- `renderQuickChips()` (linha 10332): chips de resposta rápida.
- Footer com textarea de composição + botão enviar.

### Inconsistências 🟡
- Thread sheet abre sobre o contexto atual — não há botão "Voltar" explícito dentro do thread (fecha pelo backdrop ou botão X do sheet).
- `renderQuickChips` usa strings hardcoded — não personalizado por personal.
- Aluno não tem aba "Mensagens" direta no bottom nav — acesso apenas via Mais → Mensagens, aumentando a fricção.

### Itens cortados/vazando 🔴
- Com teclado virtual aberto em mobile, o footer do thread (textarea + enviar) pode ficar atrás do teclado se `threadSheet` não usar `padding-bottom: env(keyboard-inset-height)`.

### O que falta para premium 🟢
- Indicador de digitando ("personal está digitando...").
- Status de entrega das mensagens (enviada / lida).
- Anexo de foto/arquivo na conversa.
- Badge de não lidas no ícone de Mais do bottom nav.

---

## 18. Mais (`renderStudentProfile` — linha 7250)

### Estado visual atual
- `pageHeader("Mais", ...)` com botão "Baixar app" (pill-button) no slot extra.
- `mais-identity-panel` com avatar + nome + objetivo + badge de status.
- `mais-hub-list` com 4 itens: Perfil / Mensagens / Contrato / Configurações — cada um com ícone + texto + chevron.
- Badge de contratos pendentes no item Contrato.
- Botão "Sair" isolado abaixo.

### Inconsistências 🟡
- Botão "Baixar app" em `pageHeader` é o único uso de botão extra no header do aluno — visualmente pode parecer deslocado ao lado do subtítulo.
- Função `renderStudentProfile` nomeia a aba "Mais", mas o ID de estado é `mais-perfil`, `mais-contrato`, `mais-config` — a aba raiz não tem um ID limpo como as outras.
- `mais-identity-panel` duplica o avatar e nome que já aparecem em `renderStudentMaisPerfil` — usuário vê as mesmas informações em dois contextos.

### O que falta para premium 🟢
- Avatar com botão de editar foto direto na tela Mais (não apenas em Perfil).
- Stats resumidos (streak, treinos na semana) visíveis na tela Mais sem precisar entrar em Perfil.
- Atalho de "Últimas mensagens" no hub de Mais.

---

## 18a. Perfil do aluno — visão aluno (`renderStudentMaisPerfil` — linha 7298)

### Estado visual atual
- `pageHeader("Perfil", nome do aluno)`.
- `mais-identity-panel` com avatar (editável via file input) + nome + objetivo + badge.
- `student-summary-grid` com 4 cards: Treinos na semana / Volume recente / Próxima atividade / Contrato.
- Seção "Dados pessoais": 3 profile-cards (Nome / Objetivo / E-mail) — readonly.
- Seção "Editar contato": form com campo telefone + salvar.
- Seção "Contrato": info do contrato ativo + botão Visualizar ou empty state.

### Inconsistências 🟡
- `profile-photo-label` com `<input type="file">` oculto + `.profile-photo-badge` — ao tocar no avatar, abre seletor de arquivo. Sem feedback visual de "foto sendo processada" ou "foto salva".
- Dados pessoais (Nome / Objetivo / E-mail) são readonly, mas o aluno não tem como editar o objetivo — só o telefone é editável. Interface pode ser confusa (parece que todos são editáveis).
- "Dados pessoais" e "Editar contato" são seções separadas sem razão óbvia — poderia ser uma seção unificada.

### O que falta para premium 🟢
- Galeria de fotos de progresso diretamente no perfil.
- Edição do objetivo pelo aluno (com aprovação do personal ou direto).
- QR code de "meu perfil" para compartilhar com o personal.

---

## 18b. Contrato — visão aluno (`renderStudentMaisContrato` — linha 7368)

### Estado visual atual
- `pageHeader("Contrato", "X pendente(s)")`.
- Seção com `renderContractRow` por contrato (status + plano + ações).

### Inconsistências 🟡
- Título do `pageHeader` tem o subtítulo "X pendente(s)" dinâmico, mas o subtítulo padrão deveria ser descritivo ("Plano e vigência") — quando não há pendências, fica "0 pendente(s)" que é redundante.
- `renderContractRow` (linha 7063): não lido em detalhe, mas é o mesmo componente usado no Manager para contratos — layout pode não ser ideal para a visão do aluno.

### O que falta para premium 🟢
- Timeline visual do contrato (Enviado → Visualizado → Assinado).
- Countdown de vencimento com cor progressiva (verde → amarelo → vermelho).

---

## 18c. Configurações — visão aluno (`renderStudentMaisConfig` — linha 7383)

### Estado visual atual
- `pageHeader("Configurações", "Conta e preferências")`.
- Seção "Conta": 2 profile-cards (E-mail / Telefone) — **readonly, sem ação de editar**.

### Inconsistências 🔴
- Tela de "Configurações" só exibe dados de conta (email/telefone) mas não tem botão de editar — o e-mail especialmente não pode ser alterado aqui. Isso cria uma dead-end experience: usuário entra esperando configurar algo mas não há ação disponível.

### Inconsistências 🟡
- Sem toggle de notificações push.
- Sem opção de trocar senha.
- Sem seletor de tema.

### O que falta para premium 🟢
- Toggle de notificações (alertas de treino / mensagens / atualizações).
- Link para "Esqueci minha senha" / trocar senha.
- Seletor de tema (Gold / Ocean / Graphite) herdado dos settings globais.
- Botão "Reportar problema".

---

## 19. Progresso — Enviar atualização (modal `formModal` com context update)

### Estado visual atual
- Abre via `data-open-update-form="[updateId]"` em `renderStudentProgress`.
- Modal genérico `#formModal` com campos: peso atual, observações, upload de 3 fotos (Frente / Lado / Costas).

### Inconsistências 🟡
- Usa modal genérico (`#formModal`) em vez de um sheet dedicado — experiência menos imersiva para upload de fotos.
- Preview das fotos selecionadas dentro do `#modalBody` depende de JS que não está no trecho lido — confirmar se há preview antes de enviar.
- Limite de tamanho de foto não documentado no UI.

### O que falta para premium 🟢
- Sheet dedicado full-height para upload de atualização (mais espaço para as 3 fotos).
- Preview das fotos com zoom ao tocar.
- Comparativo automático com a última atualização lado a lado.
- Câmera direta (sem precisar ir à galeria).

---

## 20. Perfil do aluno — visão manager (`renderManagerStudentProfile` — linha 7871)

### Estado visual atual
- Layout especial `sp-wrapper` com sticky head (`#profileStickyHead`):
  - Topbar: botão voltar + nome do aluno + botões "Enviar link" / "Reenviar" + ícone editar.
  - `renderStudentProfileHero`: avatar + nome + objetivo + badge operacional + menu "..." (`data-hero-menu-trigger`).
  - `renderStudentSummaryCards`: cards de métricas do aluno (linha 7998).
  - `renderProfileTabs`: tabs de navegação do perfil.
- Body scrollável `#profileTabBody` com conteúdo da aba ativa.

### Tabs disponíveis (linha 7915):
`summary` / `workouts` / `agenda` / `history` / `progress` / `updates` / `contracts` / `messages`

### Inconsistências 🟡
- `sp-sticky-head` com 4 camadas (topbar + hero + summary cards + tabs) ocupa muito espaço vertical — em mobile, o sticky head pode consumir 40-50% da viewport antes do conteúdo real.
- `state.profileTab` padrão é `"summary"`, mas `renderProfileTabs` (linha 8026) não lido em detalhe — verificar se há `aria-selected` nos botões de tab.
- Botão "Enviar link" / "Reenviar" no topbar: texto muda dinamicamente com base no `access.value` — pode criar layout shift se os dois textos tiverem larguras muito diferentes.

### Itens cortados/vazando 🔴
- `renderStudentSummaryCards` (linha 7998) + `renderProfileTabs` dentro do sticky head — se o sticky head cresce com muitos cards, o tab body pode ter altura insuficiente em mobile para rolar confortavelmente.

### O que falta para premium 🟢
- Sticky head colapsável: ao scrollar, o hero e os summary cards somem, ficando apenas topbar + tabs.
- Ação de "anotações privadas" do personal sobre o aluno.
- Compartilhamento de relatório de progresso com o aluno.
- Tab "Medidas" com gráfico de evolução de medidas corporais.

---

## 21. Contrato / Gate (`renderStudentContractGate` — linha 7126)

### Estado visual atual
- Renderizado como content-stack `contract-gate` (tela inteira, sem navigation).
- `hero-panel` com "Primeiro acesso" + nome do aluno + instrução + badge de status.
- `student-summary-grid` com cards de Plano / Valor / Vigência (apenas se dados preenchidos).
- Seção `panel` com:
  - Título do contrato + versão.
  - PDF viewer (`renderContractPdfViewer` via iframe) ou spinner de "Preparando documento...".
  - Bloco de consentimento: checkbox "Li e aceito" + campo nome completo + campo CPF + botão "Confirmar aceite" (desabilitado até consentimento).
  - Botão "Sair" isolado.

### Inconsistências 🟡
- `contract-doc-loading` com spinner e texto — se o PDF nunca carregar (URL inválida), o spinner fica infinito sem mensagem de erro.
- Campo CPF sem máscara automática (000.000.000-00) — `maxlength="14"` e `inputmode="numeric"` mas sem formatação visual.
- Botão "Confirmar aceite" desabilitado até marcar checkbox — mas o disabled state pode ser visualmente sutil dependendo do CSS.
- Spinner `.contract-doc-loading-spinner` — sem definição encontrada no CSS visto — pode ser elemento sem estilo.

### Itens cortados/vazando 🔴
- `<iframe>` para PDF no gate: em dispositivos mobile, iframes com PDF não renderizam nativamente no Safari iOS — o aluno pode ver o gate mas não conseguir ler o contrato, ficando impossibilitado de assinar.

### O que falta para premium 🟢
- Fallback de renderização do contrato: se iframe falhar, renderizar texto HTML do contrato com scrollview.
- Máscara de CPF automática.
- Contador de tempo de leitura ("Leia por pelo menos X segundos antes de assinar").
- Confirmação visual animada após aceite (check mark + mensagem de boas-vindas → redirect para app completo).

---

---

# SHEETS E MODAIS — RESUMO TRANSVERSAL

## Inconsistências globais de sheets 🔴

| Problema | Impacto |
|----------|---------|
| 4 padrões de backdrop diferentes (`.modal-backdrop`, `.ag-backdrop`, `.el-backdrop`, `.workout-sheet-backdrop`) | Fechar um backdrop pode não fechar o sheet correto |
| `workout-sheet-backdrop` compartilhado por 4 sheets diferentes | Sheet aninhado pode fechar o pai |
| Footer com teclado virtual não compensado | Botão de ação cortado ao digitar em mobile |
| `overflow-y: auto` não garantido no body de todos os sheets | Conteúdo longo não scroll dentro do sheet |

## Inconsistências de topbar 🟡

Existem 3 padrões distintos de cabeçalho de tela de detalhe:
1. `.ns-topbar` + `.ns-close` (Novo aluno)
2. `.sp-topbar` (Perfil do aluno — manager)
3. `.evaluate-topbar` (Avaliar check-in)

Nenhum deles é o mesmo componente.

## Inconsistências de filtro 🟡

Existem 3 padrões distintos de toggle de filtros:
1. `<details>` nativo (Biblioteca de exercícios, Contratos)
2. `<button data-toggle-*>` com chevron animado (Padrões, Financeiro, Dieta)
3. `.student-filter-grid` sempre visível (Alunos)

---

---

# ACESSO PÚBLICO (`acesso.html`)

### Estado visual atual
- Header `.pa-header` sticky com logo/nome.
- Tabs bar `.pa-tabs` sticky abaixo do header: Treino / Dieta / Progresso.
- Seções com `.pa-section.active` alternando visibilidade.
- Conteúdo readonly — aluno não autenticado vê apenas dados publicados.

### Inconsistências 🟡
- Z-index do header `z-index: 10` e tabs `z-index: 9` — sem garantia de que dropdowns ou conteúdo flutuante não sobrepõe as tabs.
- Sem feedback visual de "sessão expirada" ou "link inválido".

### O que falta para premium 🟢
- Branding customizável por personal (logo, cores).
- Link de "Fazer login" ou "Instalar app" no header.

---

---

# PRIORIDADES DE LAPIDAÇÃO (TOP 10)

| # | Problema | Tela | Severidade |
|---|----------|------|-----------|
| 1 | iframe PDF não funciona no Safari iOS — gate inacessível | Contrato/Gate | 🔴 |
| 2 | Backdrop compartilhado fecha sheet errado em fluxo aninhado | Todos os sheets | 🔴 |
| 3 | Footer de sheet não compensa teclado virtual | workoutSheet, exerciseSheet, threadSheet | 🔴 |
| 4 | Calendário semanal/mensal vaza lateralmente em mobile (sem overflow-x:auto) | Agenda | 🔴 |
| 5 | Campo de busca de Treinos (aluno) usa `.diet-search-field` — classe errada | Treinos (aluno) | 🔴 |
| 6 | Configurações do aluno é dead-end sem ações | Mais → Configurações | 🔴 |
| 7 | Dead code na `renderExerciseLibrary` (segundo return inacessível) | Biblioteca | 🟡 |
| 8 | 3 padrões distintos de toggle de filtros no mesmo app | Vários | 🟡 |
| 9 | 3 padrões distintos de topbar de tela de detalhe | Vários | 🟡 |
| 10 | Ícone errado em Ações rápidas do Dashboard ("Relatórios" usa `icons.progress`) | Dashboard | 🟡 |
