# DIVERGÊNCIAS-GESTOR — Auditoria Visual do Painel do Gestor

**Data:** 2026-06-08  
**Branch:** main  
**Método:** Análise estática do código-fonte (app.js, index.html, CSS), screenshots em `.tmp/`, tarefas pendentes em `tarefas.txt`, relatórios anteriores (RELATORIO-FINAL.md, AUDIT-A11Y.md, AUDITORIA-QUEBRAS.md).  
**Escopo:** Cada tela do gestor comparada com os tokens do design system e com os mockups de referência citados em `tarefas.txt`.

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

## 1. Dashboard

### Estado atual
Hero section com eyebrow "Elite AS", título "Dashboard", subtítulo e botão "Agendar atividade". Duas fileiras de métricas (3 cards + 2 cards). Painel de pendências com lista de itens clicáveis.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| D-01 | 🟡 | Hero eyebrow | Texto "Elite AS" no eyebrow é redundante com a marca no header; o mockup não exibe eyebrow aqui |
| D-02 | 🟡 | Botão "Agendar atividade" | Não deve ser o único CTA do Dashboard; referência mostra botão primário dourado full-width apenas em telas de lista, não no Dashboard hero |
| D-03 | 🟠 | Métricas row — estado sem dados | Com banco vazio, todos os KPIs mostram "0" sem nenhum hint de estado vazio/skeleton; usuário não sabe se é bug ou dado real |
| D-04 | 🟡 | Painel "Pendências" — link "Ver todas ›" | Link aponta para `data-manager-nav="updates"` mas pendências incluem itens de finanças, contratos e mensagens; deveria navegar para cada módulo individualmente |
| D-05 | 🟢 | Dashboard hero — descrição | Subtítulo "Visão geral da operação da sua assessoria." está correto mas verboso; referência usa 1 linha curta |

### Bugs conhecidos relacionados
- Nenhum bug crítico de layout; skeleton screens foram implementados (INN-1) mas dependem de dados reais do banco.

---

## 2. Alunos

### Estado atual
Hero com título "Alunos", busca + botão Filtrar compacto, métricas (Ativos / Inativos / Sem treino), lista de cards com avatar, nome, objetivo, badge de status, e botões Perfil / Enviar link.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| A-01 | 🟠 | Divisórias entre cards | Linha separadora aparece entre todos os cards incluindo o último, gerando borda dupla com o final da lista |
| A-02 | 🟡 | Badge de status | `.student-card-main > strong` na seção light ainda depende de correção de AUDITORIA-QUEBRAS aplicada — confirmar que nome trunca com ellipsis e não empurra o badge para fora |
| A-03 | 🟡 | Botão "Enviar link" | Em mobile (390 px), botão "Enviar link" pode sobrepor o badge se o nome do aluno for longo; verificar em viewport estreito |
| A-04 | 🟢 | Estado vazio | Tela de alunos com lista vazia exibe estado vazio adequado, mas ícone genérico; referência usa ícone de silhueta humana |

### Bugs conhecidos relacionados
- Sheet "Enviar link" (#enviarLinkSheet): botão fechar (`.el-close-btn`) com `2.1rem` = 33,6 px, abaixo dos 44 px (AUDIT-A11Y P-1).
- `.el-close-btn` — área de toque insuficiente (A11Y alta).

---

## 3. Agenda

### Estado atual
Abas Dia / Semana / Mês. Visão "Dia" mostra lista de atividades com horário, avatar, nome do aluno, tipo e badge de status.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| AG-01 | 🔴 | Badge de tipo na lista do dia | Badge ainda cortando (ex: "Contrato pe..." em vez de "Contrato pendente"). Correção anterior adicionou `max-width: 7.5rem` mas o texto longo estoura — precisa de largura maior ou quebra de linha permitida |
| AG-02 | 🟠 | Cores dos badges por tipo | Verdes/azul/roxo/laranja/dourado definidos nos tokens mas não confirmados visualmente em todos os tipos (Treino / Avaliação / Atualização / Retorno / Contrato); possível que todos usem a mesma cor padrão |
| AG-03 | 🟡 | Visão semana | Grade semanal sem indicação de "hoje" destacada (célula do dia atual deveria ter borda ou fundo diferente) |
| AG-04 | 🟡 | Visão mês | Dias com atividades apenas marcados com ponto; referência mostra número de atividades ou mini-preview |
| AG-05 | 🟢 | Botão "+ Agendar" flutuante | Em algumas viewports o botão pode acompanhar o scroll (bug global BUG-01 já corrigido, mas confirmar) |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 6: badge de tipo "AINDA aparece cortado" — pendent.

---

## 4. Padrões de Treino

### Estado atual
Hero com eyebrow + título + subtítulo "Modelos" + botão "Novo padrão" (não full-width). Métricas 3 colunas. Busca + botão Filtrar + painel colapsável. Lista de cards com ícone haltere, nome, badge, 4 metadados inline, preview de exercícios, botões Aplicar + "...".

### Divergências (tela COMPLETAMENTE diferente do mockup segundo tarefas.txt)

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| P-01 | 🔴 | Botão "Novo padrão" | **Não é full-width dourado**. O mockup exige botão grande dourado ocupando a linha inteira, com ícone "+" e texto "Novo padrão →". Atualmente é um botão primário pequeno alinhado ao canto do hero |
| P-02 | 🔴 | Subtítulo no hero | Atual: "Modelos" (string truncada — mojibake corrigida mas string ainda incompleta). Referência: "Modelos base reutilizáveis" |
| P-03 | 🟠 | Card — informações em grade | O card atual usa `pattern-meta-inline` (4 itens em linha horizontal). O mockup de referência mostra **linhas limpas separadas** (Objetivo / Nível / Exercícios / Última edição), cada uma com label + valor em linha própria, sem caixas/cards individuais |
| P-04 | 🟠 | Botão "Aplicar" no card | Atual: botão outline com ícone de alunos (ícone errado). Referência: botão "Aplicar" com outline **dourado** (`#F59E0B`), sem ícone de alunos |
| P-05 | 🟠 | Botão "..." no card | Presente no código mas renderizado de forma que pode não estar visível em mobile (overflow do card) |
| P-06 | 🟡 | Ícone no card | Ícone de haltere (`icons.workouts`) correto, mas tamanho e alinhamento podem divergir do mockup (ícone maior à esquerda em fundo #2A2A2A arredondado) |
| P-07 | 🟢 | Eyebrow "Elite AS" | Presente no hero; referência não tem eyebrow aqui |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 2: requer refazer a aba conforme mockup de referência.
- `app.js:4648`: subtítulo literal é `"Modelos"` — string incompleta (deveria ser "Modelos base reutilizáveis").

---

## 5. Biblioteca de Exercícios

### Estado atual
Hero com título "Biblioteca de exercícios". Métricas (Total / Grupos musculares / Exercícios publicados). Busca + Filtrar. Lista de cards com thumbnail/ícone, nome, grupo muscular, equipamento, badge, botões "Ver vídeo / Editar / Usar no treino".

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| B-01 | 🔴 | Player de vídeo | Ao abrir "Ver vídeo", o player aparece vazio (tela preta / ícone quebrado). O `<video>` não carrega a URL do vídeo ou a URL não é válida |
| B-02 | 🔴 | Upload de vídeo | Fluxo "Enviar vídeo" abre sheet mas o upload não vincula o arquivo ao exercício de forma reproduzível depois |
| B-03 | 🟠 | Bloco "Envie seu vídeo" | O bloco de CTA de vídeo dentro do card pode empurrar/cobrir os botões de ação em mobile, deixando "Usar no treino" inacessível |
| B-04 | 🟡 | Badge status | Exercícios sem status explícito aparecem sem badge ou com badge errado ("Publicado" vs "Ativo") |
| B-05 | 🟢 | Thumbnail | Exercícios sem vídeo mostram ícone genérico de haltere; referência usa avatar colorido com inicial do grupo muscular |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 4: player vazio e upload não funcional — pendente.

---

## 6. Atualizações (Check-ins)

### Estado atual
Hero com título "Atualizações". Filtros por status/período. Lista de cards com avatar, nome, data, tipo, badge, fotos em strip horizontal, botões Avaliar / Ver fotos.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| U-01 | 🟠 | Sheet "Avaliar check-in" | Rodapé com botões "Enviar feedback / Salvar avaliação" some atrás da bottom nav; botões ficam inacessíveis sem scroll além do fim |
| U-02 | 🟠 | Seletor de nota (estrelas) | Em viewports estreitas o seletor de estrelas pode sobrepor o textarea de feedback |
| U-03 | 🟡 | Strip de fotos | Fotos em mini-strip horizontal dentro do card não têm alt text (acessibilidade) e não indicam número total de fotos |
| U-04 | 🟡 | Atalhos "Ajustar treino / Ajustar dieta" | Dentro do sheet de avaliação, os atalhos podem cobrir o campo de texto se o teclado virtual estiver ativo |
| U-05 | 🟢 | Estado vazio | Ícone de câmera no estado vazio correto; texto "Nenhuma atualização" está correto |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 5: rodapé do sheet de avaliação escondido — pendente.

---

## 7. Contratos

### Estado atual
Hero com título "Contratos". 3 métricas (Ativos / Vencendo em breve / Vencidos). Busca + Filtrar. Lista de cards com avatar, nome, plano, valor, validade, badge, botão contextual. Card "Novo contrato" tracejado dourado.

### Divergências (mudança conceitual confirmada em tarefas.txt)

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| C-01 | 🔴 | Conceito de contrato | Conceito atual: **texto escrito no app** com variáveis `{aluno}`, `{cpf}`. Conceito correto: **upload de PDF** enviado pelo gestor. Todo o fluxo de criação precisa ser refatorado |
| C-02 | 🔴 | Visualização do contrato | Exibe texto/cláusulas formatadas. Deveria ser um **viewer de PDF embutido** (iframe/embed/pdf.js) |
| C-03 | 🔴 | Assinatura | Sem fluxo de aceite com validade jurídica (timestamp + nome + confirmação de leitura) |
| C-04 | 🟠 | Card — valor exibido | Card mostra "Valor não informado" quando valor não foi definido — texto quebrado; deveria mostrar placeholder discreto em cinza |
| C-05 | 🟠 | Card — validade exibida | Card mostra "Válido até Sem vencimento" — string concatenada de forma estranha; deveria mostrar "Sem vencimento" sozinho ou ser obrigatório |
| C-06 | 🟡 | Orb dourado residual | `.contract-summary-card::after` tem `radial-gradient` dourado com opacidade 4,5% sem blur (backlog §1 do RELATORIO-FINAL); visualmente quase imperceptível mas remanescente da remoção de glow |
| C-07 | 🟡 | `linear-gradient` sutil | `src/styles/contratos.css:47–48`: sheen branco `rgba(255,255,255,0.075→0.026)` nos cards de resumo; mantido como "dentro do design system" mas pode violar uniformidade com outros cards |
| C-08 | 🟢 | Validação de campos | Valor e vigência não são obrigatórios ao criar; validação inline ausente |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 3: mudança de conceito PDF — pendente.
- RELATORIO-FINAL Backlog §1: orb dourado.

---

## 8. Financeiro

### Estado atual
Hero com título "Financeiro" + botão "Registrar pagamento" compacto no canto. 4 métricas em grade 2×2 em mobile. Busca + Filtrar. Seção "Visão do mês" com seletor de mês, gráfico de linha e KPIs. Lista de mensalidades.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| F-01 | 🟠 | Dados zerados em demo | Com banco sem dados reais, tudo exibe R$ 0 / "0 cobranças" / gráfico vazio. Não há dados de exemplo pré-populados para demonstrar o layout; gestor não consegue avaliar se a tela funciona |
| F-02 | 🟠 | Botão "Registrar pagamento" | Em viewports muito estreitas (360 px) o botão `.btn-action-header` pode ser cortado pelo padding do hero |
| F-03 | 🟡 | Gráfico de linha da "Visão do mês" | Sem dados, o gráfico renderiza apenas os eixos ou nada; referência mostra estado vazio com mensagem "Nenhum pagamento no período" |
| F-04 | 🟡 | `linear-gradient` sutil | `src/styles/financeiro.css:62–63`: sheen branco nos cards de resumo (backlog §3 do RELATORIO-FINAL) |
| F-05 | 🟡 | Foco nos inputs de valor | `financeiro.css:896`: `outline: none` sem box-shadow substituto (AUDIT-A11Y) |
| F-06 | 🟢 | KPIs da visão mensal | "Faturamento / Ticket médio / Inadimplência" — labels corretas, mas sem formatação de moeda BRL em todos os breakpoints |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 5: botão "Registrar pagamento" pode cortar.
- AUDIT-A11Y Tela 7: foco removido em inputs.

---

## 9. Dieta

### Estado atual
Hero com título "Dieta" + botão "+ Novo plano alimentar" full-width com ícone. 3 métricas em grade 3 colunas. Busca + Filtrar. Lista de cards com avatar, nome, objetivo, badge, protocolo/kcal, refeições/dia, datas, botões "Abrir plano / Enviar link".

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| DI-01 | 🟠 | Sheet "Plano alimentar" — rodapé | Rodapé de ação (Cancelar / Salvar) pode desaparecer atrás da bottom nav em mobile |
| DI-02 | 🟠 | Inputs de busca no montador | `.mp-food-search-input` usa apenas placeholder sem `aria-label` — label ausente em DOM dinâmico (AUDIT-A11Y P-2) |
| DI-03 | 🟡 | Foco em inputs do montador | `dieta.css:920, 969, 1035`: `:focus` só muda `border-color` sem `box-shadow` de foco visível (AUDIT-A11Y P-2) |
| DI-04 | 🟡 | Card — truncagem de protocolo | `.diet-plan-grid strong` pode truncar protocolo longo sem mostrar valor completo em tooltip |
| DI-05 | 🟢 | Ícone de maçã no botão CTA | Ícone atual é SVG de maçã estilizado; correto segundo a referência. OK |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 5: rodapé de plano alimentar — pendente.
- AUDIT-A11Y Tela 6: foco removido em 4 inputs.

---

## 10. Mensagens

### Estado atual
Lista de conversas (WhatsApp-style) com avatar, nome, prévia truncada, horário, badge de não lidas. Campo de busca no topo. Tela de conversa aberta: header com seta voltar + avatar + nome; bolhas de chat; compose bar fixa.

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| M-01 | 🔴 | Busca dispara auto-submit | **Bug funcional confirmado em vídeo**: ao digitar 1 caractere (ex: "G"), a tela muda automaticamente para "Iniciar nova conversa" sem o usuário pedir. A busca deve filtrar de forma incremental sem trocar de tela |
| M-02 | 🔴 | Seção "Iniciar nova conversa" | Aparece automaticamente em vez de como sugestão abaixo dos resultados; só deveria abrir conversa ao usuário **tocar em "Iniciar conversa"** explicitamente |
| M-03 | 🟠 | Compose bar em iOS com teclado | `env(keyboard-inset-height)` pode deslocar a compose bar quando o teclado virtual sobe (backlog §4 do RELATORIO-FINAL) |
| M-04 | 🟠 | Textarea sem label acessível | `index.html:435`: `<textarea placeholder="Mensagem...">` sem `aria-label` (AUDIT-A11Y P-1) |
| M-05 | 🟠 | Botões da compose bar subdimensionados | `.thread-attach-btn` e `.thread-send-btn`: `2.65rem` = 42,4 px (< 44 px mínimo WCAG) |
| M-06 | 🟡 | Campo de busca — foco removido | `chat.css:765`: `outline: none` sem box-shadow (AUDIT-A11Y P-1) |
| M-07 | 🟡 | Contadores de não lidas | Badges de contagem precisam estar corretos ao filtrar; não validado em todos os estados |
| M-08 | 🟢 | Estado vazio | "Nenhuma conversa ainda / Abra o perfil de um aluno para iniciar" — correto segundo referência |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 1: busca auto-submit — pendente.
- AUDIT-A11Y Tela 3: textarea sem label, botões < 44 px, foco removido.

---

## 11. Perfil do Aluno

### Estado atual
Hero card com avatar à esquerda + nome + objetivo + badge + botão "..." no canto. 6 cards de métricas em grade 3×2. Seção "Visão geral" com próximo treino + último treino concluído lado a lado. Abas (Treinos / Dieta / Histórico / Métricas).

### Divergências

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| PA-01 | 🟠 | Menu "..." overflow | O menu contextual do "..." é renderizado como overlay com z-index alto, mas em dispositivos onde o ancestral tem `overflow:hidden`, o menu ainda pode ser cortado |
| PA-02 | 🟠 | Cards de métricas — labels longas | Labels como "Última atualização" e "Próximo treino" têm `white-space: normal` (quebra em 2 linhas), mas em 320 px o card colapsa e o valor fica ilegível |
| PA-03 | 🟡 | Grade de métricas 3×2 em mobile | Em mobile muito estreito (320 px), grade `repeat(3, minmax(0, 1fr))` pode produzir cards excessivamente estreitos |
| PA-04 | 🟡 | Aba "Histórico" — dados de exemplo | Com banco vazio, aba exibe apenas estado vazio; sem sessões mock para demonstrar o layout da lista |
| PA-05 | 🟡 | Aba "Métricas" — gráficos | Gráficos de progresso de peso/volume ao longo do tempo ainda não implementados (backlog do RELATORIO-FINAL §P4-7) |
| PA-06 | 🟢 | Avatar — iniciais | Avatar gerado com iniciais do nome; correto. Mas cor de fundo fixa (#2d9d78) independente do aluno; referência sugere cor por hash do nome |

### Bugs conhecidos relacionados
- `tarefas.txt` GRUPO 5: sheets secundárias com rodapés escondidos — inclui sheets acessados do perfil.

---

## 12. Problemas Transversais (todos os módulos)

| ID | Severidade | Elemento | Problema |
|----|-----------|----------|----------|
| G-01 | 🟠 | Strings mojibake no source | `app.js:4656, 4658, 4665, 4689`: 4 literais `"â€"` ainda no código-fonte (corrigidos em runtime por `fixMojibake` mas sujos no source) |
| G-02 | 🟠 | Sheets secundárias — rodapés de ação | Em todas as sheets com formulário (Novo aluno, Agendar atividade, Montador de padrão, Aplicar padrão, Novo exercício, Plano alimentar, Novo contrato, Registrar pagamento, Avaliar check-in): rodapé de ação pode sumir atrás da bottom nav |
| G-03 | 🟡 | Foco visível global — `outline: none` sem substituto | `src/styles/base.css:373` + múltiplos arquivos CSS: 9 ocorrências de `outline: none` sem `box-shadow` de foco (AUDIT-A11Y) |
| G-04 | 🟡 | Foco com `:focus` em vez de `:focus-visible` | Anel de foco aparece ao clicar com mouse, levando a remoções do foco para "parecer mais limpo" |
| G-05 | 🟡 | Chaves VAPID não configuradas | Push notifications silenciosamente desativadas até configurar no Railway (backlog §5 RELATORIO-FINAL) |
| G-06 | 🟢 | `linear-gradient` sutil em Finanças e Contratos | Sheen branco muito sutil nos cards de resumo (`rgba(255,255,255,0.075→0.026)`); desvia minimamente do design system de cards chapados |

---

## Resumo por prioridade de ação

### Prioridade 1 — Funcionalidade quebrada / conceito errado (🔴)

1. **Mensagens** M-01, M-02 — busca auto-submit, "Iniciar conversa" automático
2. **Contratos** C-01, C-02, C-03 — upload de PDF, viewer, fluxo de aceite
3. **Biblioteca** B-01, B-02 — player vazio, upload sem vínculo

### Prioridade 2 — Divergência visual clara / elemento escondido (🟠)

4. **Padrões** P-01, P-02, P-03, P-04 — botão full-width ausente, subtítulo incompleto, layout do card divergente
5. **Agenda** AG-01 — badge de tipo ainda cortado
6. **Global** G-02 — rodapés de sheets escondidos atrás da bottom nav
7. **Financeiro** F-01 — dados zerados sem estado vazio adequado
8. **Contratos** C-04, C-05 — "Valor não informado", "Válido até Sem vencimento"

### Prioridade 3 — Detalhe fora do padrão (🟡)

9. **Agenda** AG-02, AG-03, AG-04 — cores de badge, hoje sem destaque, visão mês sem preview
10. **Mensagens** M-03, M-04, M-05, M-06 — compose bar iOS, aria-label, botões < 44 px
11. **Financeiro** F-03, F-04, F-05 — gráfico vazio, gradient sutil, foco
12. **Contratos** C-06, C-07 — orb dourado residual, gradient sutil
13. **Global** G-01 — strings mojibake no source
14. **Dieta** DI-01, DI-02, DI-03 — rodapé, labels, foco

### Prioridade 4 — Micro-ajustes (🟢)

15. **Alunos** A-04 — ícone no estado vazio
16. **Dashboard** D-01, D-02, D-05 — eyebrow redundante, CTA hero
17. **Perfil** PA-06 — cor fixa do avatar
18. **Global** G-06 — gradient sutil

---

## Rastreamento de tarefas (tarefas.txt)

| Grupo | Descrição | Tarefa | Status |
|-------|-----------|--------|--------|
| G0 | Auditoria visual (este documento) | GRUPO 0 últ. item | ✅ Concluído |
| G1 | Busca de Mensagens sem auto-submit | tarefas.txt L34 | ⬜ Pendente |
| G1 | Mensagens — lista estável e contadores | tarefas.txt L35 | ⬜ Pendente |
| G2 | Padrões — refazer conforme mockup | tarefas.txt L38 | ⬜ Pendente |
| G3 | Contratos — upload de PDF | tarefas.txt L41 | ⬜ Pendente |
| G3 | Contratos — viewer de PDF | tarefas.txt L42 | ⬜ Pendente |
| G3 | Contratos — aceite com validade | tarefas.txt L43 | ⬜ Pendente |
| G3 | Contratos — valor e vigência obrigatórios | tarefas.txt L44 | ⬜ Pendente |
| G4 | Biblioteca — player de vídeo | tarefas.txt L47 | ⬜ Pendente |
| G4 | Biblioteca — upload funcional | tarefas.txt L48 | ⬜ Pendente |
| G4 | Biblioteca — card e botões sem corte | tarefas.txt L49 | ⬜ Pendente |
| G5 | Sheets secundárias — rodapés visíveis | tarefas.txt L52 | ⬜ Pendente |
| G5 | Avaliar check-in — rolagem e botões | tarefas.txt L53 | ⬜ Pendente |
| G5 | Financeiro — dados e layout | tarefas.txt L54 | ⬜ Pendente |
| G6 | Agenda — badge sem corte | tarefas.txt L57 | ⬜ Pendente |
| G7 | Revisão final + atualizar este doc | tarefas.txt L60 | ⬜ Pendente |

---

*Gerado por análise estática. Após cada rodada de correções, marcar itens resolvidos na coluna "Status" acima e mover para seção "Resolvidos" abaixo.*

---

## Resolvidos (histórico)

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
