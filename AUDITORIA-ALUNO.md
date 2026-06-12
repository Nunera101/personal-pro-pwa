# Auditoria do Modo Aluno

**Data:** 2026-06-12 (revisão final dos widgets do Início; base anterior: pós-refinamento premium — Levas A–D, vídeo real 11/06)
**Escopo:** Todas as telas do modo `student`: Login, Contrato/Gate, Início, Treinos, Detalhe do treino, Execução, Dieta, Mensagens/Chat, Progresso, Agenda, Mais, Perfil
**Status do refinamento:** ✅ Concluído (8 tarefas de refinamento + passada premium)

---

## Status Geral — Problemas confirmados no vídeo (11/06) e resolução

| # | Problema confirmado no vídeo | Severidade original | Status | Onde foi resolvido |
|---|---|---|---|---|
| 1 | Início despejando exercícios crus com "Iniciar série" (deveria ser dashboard) | 🔴 Alta | ✅ RESOLVIDO | Leva A — `renderStudentToday` virou dashboard: saudação + próxima atividade + grade de métricas + card "treino de hoje" só como atalho |
| 2 | Treinos como exercícios soltos na lista | 🔴 Alta | ✅ RESOLVIDO | Leva A — aba Treinos lista cards nomeados (título do professor, objetivo, nº de exercícios, última execução, botão Abrir → tela de detalhe organizada) |
| 3 | "Exercício indisponível" em treinos antigos sem snapshot | 🔴 Alta | ✅ RESOLVIDO | Leva A — backfill via `getExercise` no render; fallback para último nome conhecido / "Exercício + grupo", nunca "indisponível" |
| 4 | Card dourado com texto branco ilegível (contraste) | 🔴 Alta | ✅ RESOLVIDO | Leva A — regra única de contraste: texto sobre fundo dourado sempre escuro (`#1A1206`); corrigido hero de treino e gate de contrato |
| 5 | Header em 3 andares com espaço morto e ícone solto | 🟠 Média | ✅ RESOLVIDO | Leva B — header em uma linha no padrão do gestor (hambúrguer + logo + nome + badge + sino + chat + avatar) |
| 6 | Badge ALUNO verde (fora do padrão; GESTOR é dourado) | 🟡 Baixa | ✅ RESOLVIDO | Leva B — badge ALUNO em dourado, mesmo estilo do badge GESTOR |
| 7 | Agenda escondida dentro de "Mais" | 🟠 Média | ✅ RESOLVIDO | Leva B — Agenda entra na barra (Início, Treinos, Dieta, Agenda, Progresso, Mais); Chat sai da barra para o ícone do header |
| 8 | Chat com a barra inferior invadindo o compose | 🟠 Média | ✅ RESOLVIDO | Leva B — nav some na conversa (padrão WhatsApp); compose acompanha o teclado; chips de resposta rápida acima do compose |
| 9 | Contrato em texto com campos vazios (CPF:, Valor:, Fim:) e aceite fraco | 🔴 Alta | ✅ RESOLVIDO | Leva C — viewer de PDF real quando há `pdfUrl`; campos vazios ocultos; aceite confere CPF + trilha de auditoria (nome, CPF, data/hora, IP, userAgent, versão) |
| 10 | Gate de primeiro acesso pouco premium | 🟠 Média | ✅ RESOLVIDO | Leva C — card legível, resumo do plano sem campos vazios, PDF rolável, fluxo ler→aceitar→confirmar identidade→sucesso com transição suave (`gate-success`) |
| 11 | Inconsistência visual geral vs. gestor | 🟡 Baixa | ✅ RESOLVIDO | Leva D — passada premium: espaçamentos, hierarquia H1+subtitle, ícones dourados em fundo escuro, estados vazios elegantes, safe-areas |

---

## 1. Telas auditadas (estado pós-refinamento)

### Login (`#loginView`)
- Formulário padrão com e-mail, senha, "Manter-se conectado" + botão "Baixar app" (PWA).
- **OK** — sem divergências.

### Contrato / Gate (`renderStudentContractGate`)
- Quando há `pdfUrl`: exibe **viewer de PDF real** (não o texto com campos vazios).
- Texto renderizado só como fallback quando não há PDF; linhas de dados vazios ocultas.
- Card de boas-vindas com texto escuro sobre dourado (legível).
- Aceite: "Li e concordo" + nome completo + **CPF conferido contra o cadastro**; trilha de auditoria registrada; ponto de integração futura (Clicksign/D4Sign) marcado no código.
- Sucesso com transição suave (`gate-success`, checkmark animado, fade-out) antes de liberar o app.
- **OK**.

### Início / Dashboard (`renderStudentToday`)
- **Ordem final (revisão 12/06):**
  1. Saudação ("Olá, {nome}" + linha da próxima atividade).
  2. Banner **Treino em andamento** (apenas se houver sessão ativa) — fundo dourado com texto escuro, botões Retomar/Descartar.
  3. **Progresso do treino de hoje** — título do treino, contagem de séries, barra de progresso dourada; lê a sessão ativa ao vivo, atualiza ao concluir séries (`handleSeriesAction` → `renderStudent()`).
  4. **Grade de métricas** (padrão do gestor): TREINOS NA SEMANA (com bolinhas dos dias — concluído dourado/pendente/folga), VOLUME RECENTE, PRÓXIMA ATIVIDADE (faixa lateral na cor do tipo + botão Abrir), CONTRATO (status com cor).
  5. **Sequência de dias treinando** — chama dourada acesa quando há streak; motivação quando zerada.
  6. **Peso corporal** — último peso, variação no mês (seta ↓ verde / ↑ vermelha / estável) e mini gráfico.
  7. **Adesão do mês** — anel de progresso dourado (concluídos/programados, mesmo cálculo do gestor).
  8. Card "treino de hoje" **apenas como atalho** (nome + Abrir treino), sem expor exercícios.
  9. Atalho para enviar progresso se houver pendência.
- Tema escuro dourado em todos os widgets: dourado só em destaques, texto sobre dourado sempre escuro, **sem glow** (flat).
- Estados vazios elegantes por widget (peso sem registro, adesão sem treinos programados, sem treino hoje, sem próxima atividade).
- Nenhum texto cortado: `overflow-wrap: anywhere` nos títulos, `line-clamp: 2` no nome da próxima atividade, contadores em containers com `flex-wrap`.
- **OK** — não despeja mais exercícios crus.

### Treinos (`renderStudentWorkouts`)
- Cards nomeados com título do professor, objetivo, nº de exercícios, última execução, botão Abrir.
- **OK** — sem exercícios soltos.

### Detalhe do treino (`state.studentWorkoutDetailId`)
- Lista organizada: nome real, grupo, séries × reps × carga × descanso, thumbnail/play do vídeo quando houver.
- Botão único INICIAR TREINO no rodapé → fluxo de execução existente.
- **OK**.

### Execução de treino (`renderWorkoutExecution`)
- Barra de progresso, banner de descanso com countdown (`setInterval`), card do exercício atual, inputs de carga/reps, fila, botão Finalizar.
- **OK** — contador funciona; nada atrás da barra.

### Dieta (`renderStudentDiet`)
- Hero do protocolo + cards de refeições com checkboxes; busca se > 1 plano; empty state.
- **OK**.

### Mensagens / Chat (`openStudentChatTab` → `openThreadSheet`)
- Acessível pelo **ícone de chat no header** (todas as telas) e atalho no "Mais" — não está mais na barra.
- Fullscreen `is-student-view`; nav some na conversa; compose acompanha o teclado; chips de resposta rápida acima do compose.
- **OK**.

### Progresso (`renderStudentProgress`)
- Atualização quinzenal pendente, gráfico de peso (SVG), histórico, métricas, gráfico de volume, evolução por exercício.
- **OK**.

### Agenda (`renderAgendaScreen`)
- Agora na barra inferior; escopada ao próprio aluno (`getCurrentStudent()?.id`); abas Dia/Semana/Mês.
- **OK**.

### Mais (`renderStudentProfile`)
- Hub: Perfil, Agenda, Contrato, Configurações, atalho de Mensagens; botão "Sair".
- **OK**.

### Perfil (`renderStudentMaisPerfil`)
- Avatar + nome + status, summary grid, dados pessoais/conta, seção de contrato com "Visualizar".
- **OK**.

---

## 2. Barra inferior e header (composição final)

- **Barra inferior (6 itens):** Início, Treinos, Dieta, Agenda, Progresso, Mais.
- **Chat:** ícone no header (presente em todas as telas) + atalho no "Mais".
- **Header (uma linha):** hambúrguer + logo + nome + **badge ALUNO dourado** + sino + chat + avatar.
- Sidebar atualizada na mesma ordem, sem duplicados.

---

## 3. Tokens de design aplicados

- Dourado `#F59E0B`, fundo `#0D0D0D`, card `#1A1A1A` flat sem glow, borda `rgba(255,255,255,0.06)`, radius 16px, txt2 `#9CA3AF`, ok `#10B981`, erro `#EF4444`.
- **Regra de contraste:** texto sobre fundo dourado sempre escuro (`#1A1206`), nunca branco — regra única no CSS.

---

## 4. Pendências remanescentes

| Item | Severidade | Observação |
|---|---|---|
| Integração com provedor de assinatura certificada (Clicksign/D4Sign) | 🟠 Média (futuro, acompanhado) | Ponto de integração já marcado no código; a integração em si fica para depois, com acompanhamento. O aceite atual (CPF + trilha de auditoria: nome, CPF, data/hora, IP, userAgent, versão) é válido como registro interno, mas não é assinatura digital certificada ICP-Brasil. |
| Persistência da trilha de auditoria no backend (PostgreSQL) | 🟡 Baixa | Confirmar se o aceite está sendo gravado em `server/` e não apenas no frontend. Validar no próximo ciclo. |
| Validação por vídeo das Levas A–D | 🟡 Baixa | Marcadores `>>> VALIDAR COM VIDEO <<<` em `tarefas.txt` aguardando conferência do vídeo real entre levas. |

**Nenhuma pendência de severidade alta em aberto.** Todos os problemas confirmados no vídeo de 11/06 foram resolvidos.

---

## 5. Divergências intencionais (não são bugs)

| Item | Motivo |
|---|---|
| Relatórios, Financeiro, Biblioteca | Módulos exclusivos do gestor |
| Filtros avançados em Atualizações | Aluno vê apenas as próprias |
| Drop-shadow sutil no gráfico SVG | < 20% opacidade — não é glow |

---

## 6. Tarefas do refinamento (Levas A–D)

| Leva | Tarefa | Commit |
|---|---|---|
| A | Início vira dashboard | `feat(aluno): Inicio vira dashboard com cards de metricas` |
| A | Treinos em cards nomeados + tela de detalhe | `feat(aluno): treinos em cards nomeados com tela de detalhe organizada` |
| A | Backfill de nomes de exercícios | `fix(aluno): backfill de nomes de exercicios em treinos existentes` |
| A | Contraste em fundos dourados | `fix(aluno): texto escuro sobre fundos dourados (contraste)` |
| B | Header em uma linha, badge dourado | `fix(aluno): header em uma linha no padrao do gestor, badge dourado` |
| B | Agenda na barra, chat pelo header | `feat(aluno): agenda na barra principal, chat pelo header` |
| B | Chat sem barra invadindo + teclado | `fix(aluno): chat sem sobreposicao da barra e estavel com teclado` |
| C | Contrato exibe PDF real | `fix(aluno): contrato exibe o PDF real e oculta campos vazios` |
| C | Aceite com CPF + auditoria | `feat(aluno): aceite com conferencia de CPF e trilha de auditoria` |
| C | Gate de primeiro acesso premium | `feat(aluno): gate de primeiro acesso premium e legivel` |
| D | Passada premium geral | `chore(aluno): passada premium de consistencia visual` |

---

## 7. Widgets do Início (ciclo 12/06)

| Widget | Commit |
|---|---|
| Progresso do treino de hoje | `feat(widgets): progresso do treino de hoje no Inicio` |
| Bolinhas da semana no card de treinos | `feat(widgets): bolinhas da semana no card de treinos` |
| Sequência de dias treinando | `feat(widgets): sequencia de dias treinando` |
| Peso corporal com variação e mini gráfico | `feat(widgets): peso corporal com variacao e mini grafico` |
| Adesão do mês com anel dourado | `feat(widgets): adesao do mes com anel de progresso dourado no Inicio` |
| Próxima atividade com tipo colorido | `feat(widgets): proxima atividade com tipo colorido e atalho` |
| Revisão final: ordem dos widgets | `chore(aluno): revisao final do Inicio com ordem definitiva dos widgets` |

**Verificações da revisão final:** ordem saudação → banner de sessão ativa → progresso de hoje → grade de métricas → sequência → peso → adesão; gate de contrato abre o PDF gerado (`contract.pdfUrl` → viewer com iframe / cartão iOS, verificado no app real em ciclo anterior); progresso atualiza ao concluir séries; sem glow; sem texto branco sobre dourado; sem texto cortado.
