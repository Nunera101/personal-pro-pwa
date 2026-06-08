# DIVERGÊNCIAS-GESTOR — Auditoria Visual do Painel do Gestor

**Data inicial:** 2026-06-08 | **Última revisão:** 2026-06-08  
**Branch:** main  
**Método:** Análise estática + revisão de código pós-correções das Levas 1–4.

---

## Legenda de severidade

| Nível | Significado |
|-------|-------------|
| 🔴 Crítico | Funcionalidade ou conceito errado; usuário não consegue usar a tela |
| 🟠 Alto | Divergência visual clara do mockup; elemento cortado, escondido ou quebrado |
| 🟡 Médio | Detalhe fora do padrão; não bloqueia uso mas diverge da referência |
| 🟢 Baixo | Micro-ajuste cosmético; baixíssimo impacto |

---

## Tokens do design system (referência)

| Token | Valor |
|-------|-------|
| Fundo | `#0D0D0D` |
| Card | `#1A1A1A` flat, sem glow |
| Borda card | `rgba(255,255,255,0.06)` |
| Dourado | `#F59E0B` |
| Texto secundário | `#9CA3AF` |
| OK / sucesso | `#10B981` |
| Erro | `#EF4444` |
| Radius | `16px` |
| Status Treino | `#10B981` (verde) |
| Status Avaliação | `#8B5CF6` (roxo) |
| Status Atualização | `#3B82F6` (azul) |
| Status Retorno | `#F97316` (laranja) |
| Status Contrato | `#F59E0B` (dourado) |

---

## Pendências em aberto

### 1. Dashboard

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| D-02 | 🟡 | Botão "Agendar atividade" | Não deve ser o único CTA do hero; referência mostra CTA primário dourado só em telas de lista |
| D-03 | 🟡 | Métricas — estado sem dados | Com banco vazio, KPIs exibem "0" sem hint de estado vazio/skeleton |

---

### 2. Alunos

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| A-04 | 🟢 | Estado vazio | Ícone genérico; referência usa silhueta humana |

---

### 3. Agenda

*(Sem pendências — todas as divergências resolvidas nas Levas 1 e 2.)*

---

### 4. Padrões de Treino

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| P-02 | 🟡 | Subtítulo do hero | Atual: "Modelos reutilizáveis para treinos" (`app.js:4720`). Referência: "Modelos base reutilizáveis" |
| P-06 | 🟢 | Ícone no card | Tamanho e alinhamento do ícone de haltere pode divergir do mockup (ícone maior à esquerda em fundo `#2A2A2A` arredondado) |
| P-07 | 🟢 | Eyebrow "Elite AS" | `app.js:4718` — eyebrow presente no hero de Padrões; referência não exibe |

---

### 5. Biblioteca de Exercícios

*(Sem pendências — B-01/B-02/B-03/B-04/B-05 todos resolvidos.)*

---

### 6. Atualizações (Check-ins)

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| U-03 | 🟡 | Strip de fotos | Fotos do card sem `alt` text; não indica número total de fotos |

---

### 7. Contratos

*(Sem pendências — C-01 a C-08 todos resolvidos.)*

---

### 8. Financeiro

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| F-06 | 🟢 | KPIs da visão mensal | "Faturamento / Ticket médio / Inadimplência" sem formatação de moeda BRL consistente em todos os breakpoints |

---

### 9. Dieta

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| DI-01 | 🟠 | Sheet "Plano alimentar" — rodapé | Rodapé Cancelar / Salvar pode desaparecer atrás da bottom nav em mobile |
| DI-02 | 🟠 | Inputs de busca no montador | `.mp-food-search-input` sem `aria-label` (label ausente em DOM dinâmico) |
| DI-04 | 🟡 | Card — truncagem de protocolo | `.diet-plan-grid strong` pode truncar protocolo longo sem tooltip |

---

### 10. Mensagens

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| M-03 | 🟠 | Compose bar em iOS com teclado | `env(keyboard-inset-height)` pode deslocar a compose bar quando teclado virtual sobe |
| M-07 | 🟡 | Contadores de não lidas | Badges de contagem não validados ao filtrar |

---

### 11. Perfil do Aluno

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| PA-01 | 🟠 | Menu "..." overflow | Em ancestral com `overflow:hidden`, menu contextual ainda pode ser cortado |
| PA-02 | 🟠 | Cards de métricas — labels longas | Em 320 px, "Última atualização" e "Próximo treino" colapsam o valor |
| PA-03 | 🟡 | Grade 3×2 em 320 px | `repeat(3, minmax(0,1fr))` pode produzir cards excessivamente estreitos |
| PA-04 | 🟡 | Aba "Histórico" — banco vazio | Estado vazio sem sessões mock para demonstrar layout da lista |
| PA-05 | 🟡 | Aba "Métricas" — gráficos | Gráficos de progresso peso/volume ainda não implementados |
| PA-06 | 🟢 | Avatar — cor fixa | Cor de fundo `#2d9d78` independente do aluno; referência usa cor por hash do nome |

---

### 12. Problemas Transversais

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| G-05 | 🟡 | Chaves VAPID não configuradas | Push notifications silenciosamente desativadas até configurar no Railway |

---

## Resumo das pendências (pós-Levas 1–4)

### Prioridade 1 — 🟠 Alto

- DI-01/DI-02: Sheet plano alimentar — rodapé e aria-label
- M-03: Compose bar iOS com teclado
- PA-01/PA-02: Perfil — menu "..." e labels longas

### Prioridade 2 — 🟡 Médio

- D-02/D-03: Dashboard — CTA hero e KPIs zerados
- U-03: Fotos sem alt text
- P-02: Subtítulo de Padrões
- DI-04: Truncagem de protocolo
- M-07: Contadores de não lidas
- PA-03/PA-04/PA-05: Perfil — grade 320px, histórico, gráficos
- G-05: VAPID

### Prioridade 3 — 🟢 Baixo

- A-04: Ícone estado vazio alunos
- F-06: Formatação de moeda
- P-06/P-07: Ícone e eyebrow em Padrões
- PA-06: Cor fixa do avatar

---

## Rastreamento de tarefas (tarefas.txt)

| Grupo | Descrição | Status |
|-------|-----------|--------|
| G0 | Auditoria visual (este documento) | ✅ Concluído |
| G1 | Busca de Mensagens sem auto-submit | ✅ Resolvido |
| G1 | Mensagens — lista estável e contadores | ✅ Resolvido |
| G2 | Padrões — refazer conforme mockup | ✅ Resolvido (P-01/P-03/P-04/P-05 ✅; P-02/P-07 pendentes) |
| G3 | Contratos — upload de PDF | ✅ Resolvido |
| G3 | Contratos — viewer de PDF | ✅ Resolvido |
| G3 | Contratos — aceite com validade | ✅ Resolvido |
| G3 | Contratos — valor e vigência obrigatórios | ✅ Resolvido |
| G4 | Biblioteca — player de vídeo | ✅ Resolvido |
| G4 | Biblioteca — upload funcional | ✅ Resolvido |
| G4 | Biblioteca — card e botões sem corte | ✅ Resolvido |
| G5 | Sheets secundárias — rodapés visíveis | ✅ Resolvido (Dieta pendente: DI-01) |
| G5 | Avaliar check-in — rolagem e botões | ✅ Resolvido |
| G5 | Financeiro — dados e layout | ✅ Resolvido |
| G6 | Agenda — badge sem corte | ✅ Resolvido |
| G7 | Revisão final + atualizar este doc | ✅ Concluído |

---

## Resolvidos (histórico completo)

| ID | Tela | Descrição | Commit |
|----|------|-----------|--------|
| — | Global | Barra inferior fixa (bottom nav fora da view animada) | `88617d7`, `a158cf0` |
| — | Global | Remoção total de glow/blur dourado (159 pontos) | `1c12ea3` |
| — | Global | 3º card cortado em fileiras de 3 | `9edb3d6` |
| — | Global | Encoding mojibake em runtime | `d3df6af` |
| — | Global | Quebra de texto e badge estourando (15 correções) | `e1099b7` |
| — | Global | Botões com sticky/fixed indevido acompanhando scroll | `b463be2` |
| — | Global | Flicker ao navegar entre telas e abrir sheets | `7051683` |
| — | Menu "Mais" | Itens visíveis, overlay e áreas seguras | `1ca571e` |
| — | Alunos | Eyebrow "Elite AS" removido, cards limpos | `e214cec` |
| — | Perfil | 6 cards em 3×2, treinos lado a lado, menu "..." overlay | `bf67d56` |
| — | Agenda | Glow removido, layout limpo | `9c82b52` |
| — | Padrões | Parcialmente adequado ao design system | `245f14f` |
| — | Contratos | Métricas 3×1, filtrar compacto, valor /mês | `e778bc8` |
| — | Financeiro | Bugs visuais corrigidos, padronizado | `bceb855` |
| — | Mensagens | Layout WhatsApp-style implementado | `395a0a5` |
| — | Ícones | finance → cifrão, updates → câmera | `d377cca` |
| M-01 | Mensagens | Busca sem auto-submit — filtro incremental sem trocar de tela | `4284af8` |
| M-02 | Mensagens | "Iniciar nova conversa" só ao tocar explicitamente | `4284af8` |
| C-01 | Contratos | Upload de PDF (conceito correto) | `d6c8440` |
| C-02 | Contratos | Viewer de PDF embutido | `d6c8440`, `11e5476` |
| C-03 | Contratos | Aceite com validade jurídica (checkbox + consentAt) | `bfe94a5` |
| B-01 | Biblioteca | Player de vídeo real (onerror, poster, YouTube embed) | `2457068` |
| B-02 | Biblioteca | Upload vincula arquivo ao exercício | `d895136` |
| B-03 | Biblioteca | Botões de ação sem corte pelo bloco de vídeo | `f859016` |
| U-01 | Check-in | Rodapé "Enviar feedback / Salvar" visível acima da bottom nav | `0b63535` |
| U-02 | Check-in | Seletor de estrelas não sobrepõe textarea | `0b63535` |
| U-04 | Check-in | Atalhos "Ajustar treino/dieta" não cobrem textarea | `0b63535` |
| F-01 | Financeiro | Dados de exemplo coerentes (demo banner) | `3099d5c` |
| F-02 | Financeiro | Botão "Registrar pagamento" sem corte em 360 px | `3099d5c` |
| F-03 | Financeiro | Estado vazio "Nenhum pagamento no período" | `3099d5c` |
| AG-01 | Agenda | Badge de tipo inteiro, sem truncamento | `aca5190` |
| AG-02 | Agenda | Cores por tipo (verde/roxo/azul/laranja/dourado) aplicadas | `aca5190` |
| AG-03 | Agenda | Célula do dia atual destacada na visão Semana | `f1512df` |
| AG-04 | Agenda | Mini-preview por tipo na visão Mês | `f1512df` |
| G-02 | Global | Rodapés de sheets secundárias sempre visíveis | `e8b00b2`, `0e04b1e` |
| P-01 | Padrões | Botão "Novo padrão" full-width dourado com ícones | CSS `treinos.css:28` |
| P-03 | Padrões | Card com informações em linhas limpas (pml-label / pml-value) | `app.js:4798` |
| P-04 | Padrões | Botão "Aplicar" outline dourado sem ícone de alunos | `treinos.css:425` |
| P-05 | Padrões | Botão "..." (`details/summary`) visível e funcional em mobile | `app.js:4808` |
| A-01 | Alunos | Divisória não aparece após o último card | `10da46d` |
| A-02 | Alunos | Nome longo trunca com ellipsis sem empurrar badge | `10da46d` |
| A-03 | Alunos | "Enviar link" não sobrepõe badge em 390 px | `10da46d` |
| C-04 | Contratos | Placeholder discreto "—" quando valor não informado | `d03a466` |
| C-05 | Contratos | "Sem vencimento" exibido sozinho (sem concatenação estranha) | `d03a466` |
| C-06 | Contratos | Orb dourado residual `::after` removido | `8c65cb9` |
| C-07 | Contratos | Sheen branco `rgba(255,255,255,0.075)` removido | `8c65cb9` |
| C-08 | Contratos | Validação inline de valor e vigência | `d03a466` |
| F-04 | Financeiro | Sheen branco removido dos cards de resumo | `8c65cb9` |
| F-05 | Financeiro | Foco em inputs via `:focus-visible` + ring dourado | `85af7f0` |
| G-01 | Global | Mojibake corrigido direto no source (strings.js) | `4acd36d` |
| G-03 | Global | ~9 ocorrências de `outline:none` substituídas por ring dourado | `85af7f0` |
| G-04 | Global | `:focus` trocado por `:focus-visible` onde cabível | `85af7f0` |
| G-06 | Global | Sheen/glow residual removido de Finanças e Contratos | `8c65cb9` |
| M-04 | Mensagens | `aria-label="Mensagem"` no textarea da compose | `a1fb8e9` |
| M-05 | Mensagens | Botões `.thread-attach-btn` e `.thread-send-btn` ≥ 44 px | `a1fb8e9` |
| M-06 | Mensagens | Foco na busca de chat via `:focus-visible` | `85af7f0` |
| DI-03 | Dieta | Foco nos inputs do montador (`:focus-visible` + ring) | `85af7f0` |
| B-04 | Biblioteca | Badge correto: Publicado / Rascunho / Arquivado | `8a6bab7` |
| B-05 | Biblioteca | Thumbnail com avatar colorido por grupo muscular | `8a6bab7` |
| D-01 | Dashboard | Eyebrow "Elite AS" removido do hero | `a798d4e` |
| D-04 | Dashboard | Link "Ver todas" navega para módulo correto por tipo | `a798d4e` |
| D-05 | Dashboard | Subtítulo encurtado para 1 linha | `a798d4e` |
| — | Alunos A11Y | `.el-close-btn` no sheet "Enviar link" elevado para ≥ 44 px | `0229749` |
