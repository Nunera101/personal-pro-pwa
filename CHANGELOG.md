# CHANGELOG

Todas as mudanças relevantes do projeto, agrupadas por bloco/feature em ordem cronológica.

---

## [2026-06-06] — Fundação e refatoração da arquitetura

### Backend
- Adicionado `DELETE /collections/:collection/:id` com `audit_logs` para PUT e DELETE
- Rate limiting nas rotas públicas de autenticação (10 req/15 min por IP)

### Estrutura de código
- Criada estrutura `src/` com esqueleto de domínios e utilitários
- Extraídas funções de string de `app.js` para `src/utils/strings.js`
- Extraídas funções numéricas/monetárias para `src/utils/numbers.js`
- `styles.css` dividido em 10 arquivos por domínio em `src/styles/`, linkados no `index.html`
- `bindEvents` dividido em subfunções por domínio
- Removido `renderManagerHome` (código morto); fallback atualizado para `renderManagerHomeV2`

### Correções
- Corrigido encoding, safe area no header, layout de botões, métricas e menu lateral

### Documentação
- Adicionado `DIAGNOSTICO.md` completo
- Adicionada regra de commit obrigatória no `CLAUDE.md`

---

## [2026-06-07] — Bloco 1: Design system e padronização visual

### Design system
- Eliminado todo glow dourado/blur em `styles.css` e `src/styles` (159 pontos)
- Padronizados estados vazios com `emptyState()` em todas as telas
- Tokens de design centralizados em variáveis CSS no `:root`
- Splash premium com pulse + skeleton screens shimmer
- Transições: fade+translateY em views/abas, fade+scale em modais, slide-up em sheets, `:active scale(0.98)` em clicáveis

### Dashboard e navegação
- Padronizados `metrics-row`, badges de prioridade e filtros de atualizações no Dashboard
- Corrigida barra inferior fixa: movida para fora do `.view` animado
- Corrigido card cortado no dashboard e divisórias de alunos

### Telas do gestor — adequações à referência
- **Dashboard:** cards de métrica alinhados, sem glow
- **Alunos:** flat sem glow, cards limpos sem reticências cortadas, sem menu `...`
- **Perfil do aluno:** 6 cards em 3×2, treinos lado a lado, ações pendentes e gráfico de evolução reestruturados
- **Agenda:** remove glow e eyebrow, itens limpos com estilo WhatsApp, blocos coloridos na semana, badge corrigido
- **Padrões:** subtitle curto, `small-text` no count, remove `patternMetricCard` morta
- **Contratos:** métricas premium 3×1, botão Filtrar compacto, valor /mês no card
- **Financeiro:** bugs visuais corrigidos e padronizado ao design system
- **Mensagens:** reformulada em layout WhatsApp-style

### PWA e performance
- Web Push notifications implementado via VAPID
- Microinterações com propósito: check série, progresso, overlay conclusão, success toast

### Correções diversas
- Menu lateral: `position fixed`, scroll, overlay, toque mínimo 44px no hambúrguer
- Cards em fileiras de 3: grid `repeat(3, 1fr)` sem overflow
- Quebra de texto e badge estourando em cards de lista
- Ícones finance (crédito→cifrão) e updates (documento→câmera) revisados

---

## [2026-06-07] — Bloco 2: Novas features do gestor (sheets e telas)

### Correções de base
- Encoding (mojibake) corrigido em `app.js` e `strings.js`
- Barra inferior: eliminado flash/bug ao entrar e trocar abas
- Splash: tela preta eliminada com CSS crítico inline e CSS externo não-bloqueante
- Busca de Mensagens: permite iniciar nova conversa com qualquer aluno

### Camada de serviços
- Adicionada camada mock com stubs para o Bloco 3

### Gestor — novas telas e fluxos
- **Tela Novo aluno:** formulário completo
- **Sheet Enviar link:** compartilhamento de acesso do aluno
- **Perfil do aluno:** cabeçalho fixo com abas sem recarregar página
- **Sheet Agendar atividade:** substitui modal
- **Sheet Detalhe do evento:** visualização de evento na agenda
- **Montador de treino (Novo/Editar):** sheet substituindo modal
- **Sheet Aplicar padrão:** seleção e aplicação de padrão de treino
- **Tela Novo/Editar exercício:** formulário completo
- **Modais de vídeo da biblioteca:** player inline
- **Tela Avaliar check-in:** revisão de envio do aluno com feedback
- **Montador e visualização de plano alimentar:** criação e publicação
- **Contratos:** novo contrato, visualizar e ações inline (Visualizar/Reenviar/Gerar PDF)
- **Financeiro:** registrar, detalhe, cobrar e recibo
- **Relatórios:** abas de período, KPI cards, gráficos e exportar CSV
- **Thread de chat:** conversa completa gestor↔aluno

---

## [2026-06-08] — Bloco 3: Lado do aluno + PWA offline + paridade

### Telas do aluno
- Barra inferior reestruturada com 5 itens fixos
- Tela Início: renomeada de "Hoje", com hero `dashboard-hero` e card de próximo treino
- **Dieta:** visualização completa do plano alimentar publicado
- **Progresso:** unifica envio de atualizações com evolução — seção "Enviar" como padrão
- **Mais → Agenda:** agenda movida para dentro de Mais, com visualização Dia/Semana/Mês
- **Mensagens:** chat WhatsApp-style — aluno à direita (dourado), personal à esquerda (escuro)
- **Thread (Chat):** aba Chat adicionada na navegação inferior do aluno

### Paridade e consistência
- Paridade total do aluno com as telas do gestor aplicada globalmente

### PWA e acesso
- Manifest e cache offline-first do app shell implementados
- Área pública do aluno via link com token de 7 dias
- Fila offline de rascunhos com indicador de pendente

### Correções
- Exercícios virando "Exercicio" corrigido: IDs estáveis nos seeds e `exerciseName` no workout exercise
- Barra fantasma duplicada eliminada: `[hidden]` sobrescreve `display:grid !important`

### Documentação
- README atualizado com visão geral, stack, como rodar local, estrutura de pastas e tokens de design
- Auditoria RELATORIO-FASE2: telas secundárias do gestor (Bloco 3)
