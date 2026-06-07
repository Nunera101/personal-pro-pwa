# Relatório de Correções — Rodada Visual + Funcional

Data: 2026-06-07

---

## PARTE A — Bug Funcional: Busca em Mensagens

**Problema:** Buscar o nome de um aluno sem conversa existente retornava "Nenhuma conversa ainda".

**Correção:**
- `renderManagerMessages()` agora busca em dois grupos: conversas existentes + todos os alunos cadastrados.
- Alunos sem conversa que correspondem ao termo são exibidos com indicador "Iniciar conversa" (borda lateral + badge).
- Nova função `renderNewConversationCard(student)` renderiza esses itens. Ao tocar, abre thread vazia pronta para envio.
- Sem duplicação: alunos com conversa existente não aparecem no segundo grupo.

---

## PARTE B — Barra Inferior: Instabilidade ao Navegar

**Problema:** A barra inferior piscava, sumia ou saltava durante entrada no app e troca de abas.

**Correção:**
- `renderNav()` agora verifica se os botões já existem no DOM (mesma quantidade). Se sim, apenas alterna `is-active` sem destruir/recriar elementos.
- Elimina o churn de DOM a cada `renderManager()`, mantendo a barra estável e sem reflow.
- A barra permanece como elemento fixo persistente fora do fluxo de animações de transição.

---

## PARTE C — Tela Preta Longa ao Abrir

**Problema:** Tela preta visível por vários segundos antes de qualquer conteúdo aparecer.

**Correção:**
- `manifest.json`: `background_color` e `theme_color` alterados de `#050505` para `#0b6b57` (verde da marca). O SO usa esse valor antes do HTML renderizar.
- `.startup-splash` nos CSS recebeu `background: #0b6b57` como fallback direto (sem depender de variáveis CSS).
- Resultado: o splash verde com a logo aparece imediatamente ao abrir, sem tela preta.

---

## PARTE D — Aba Padrões: Adaptação Completa

**Problema:** Adaptação anterior incompleta — 3 dropdowns soltos, cabeçalho redundante, cards gigantes com caixas separadas.

**Correção:**
- **Filtros:** Substituídos por `search-filter-row` (campo de busca + botão "Filtrar" compacto). As 3 opções (Status, Objetivo, Nível) ficam dentro do painel colapsável.
- **Cabeçalho redundante removido:** "Padrões cadastrados" + contador + descrição eliminados.
- **Card compacto:** Topo com ícone + nome truncado + badge. Grade 2×2 inline sem caixas (ícone pequeno + label + valor). Preview de exercícios em 1 linha truncada. Base com "Aplicar" + "...".

---

## PARTE E — Aba Contratos

**Problema:** Métricas em layout 2+1 (não 3 colunas iguais). Card com "..." solto no topo e layout quebrado.

**Correção:**
- **Métricas:** Removida a regra `@media (max-width: 28rem)` que colapsava `.contracts-summary-grid` para 1 coluna. Grade permanece `repeat(3, minmax(0, 1fr))` em todas as larguras.
- **Card reestruturado:**
  - `.contract-card-main` agora tem 3 colunas: `auto minmax(0,1fr) auto` (avatar + info + validade/badge).
  - `.contract-validity` exibe badge de status + "Válido até [data]" empilhados, alinhados à direita.
  - `.contract-card-base` (nova seção na base): botão de ação primária (flex: 1) + "..." ao lado.
  - "..." movido do topo para a base, junto com o botão contextual.

---

## PARTE F — Aba Agenda: Badge Cortado e "Ver dia"

**Problema:** Badge de status truncado ("Contrato pe..." em vez de "Contrato pendente"). Botão "Ver dia" inconsistente.

**Correção:**
- **Badge:** Removidos `max-width: 7.5rem`, `overflow: hidden` e `text-overflow: ellipsis` de `.agenda-status .badge`. Adicionado `flex-shrink: 0`. Badge agora exibe texto completo.
- **"Ver dia":** Botão removido do cabeçalho do painel de dia da agenda.

---

## PARTE G — Encoding de Setas e Correções Menores

**Problema 1:** Seta ↑ aparecia como `â†'` na Biblioteca de Exercícios (corrupção UTF-8/Windows-1252).

**Correção:**
- Adicionadas 3 entradas ao `mojibakeReplacements`:
  - `â†‘` → `↑`
  - `â†’` → `→`
  - `â†“` → `↓`
- Corrigida a string corrupta `â†'` na linha da stat card da Biblioteca, substituída por `↑` direto no código-fonte.

**Problema 2:** Botão "Registrar pagamento" levemente cortado na direita.

**Correção:** Reduzido padding de `.btn-action-header` de `12px 18px` para `10px 14px` e gap de 8px para 6px. Botão cabe inteiro no container.

**Problema 3:** Texto do objetivo do aluno invadia o badge de status.

**Correção:**
- `.student-goal` alterado de `display: inline-flex` para `display: flex` + `max-width: 100%`. Flex a nível de bloco respeita a largura da célula do grid.
- Texto do objetivo envolvido em `<span>` filho com `overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0` para truncagem limpa.
- Badge (`flex-shrink: 0`) permanece intacto na coluna `auto` do grid.

---

## O que não foi alterado

- Estrutura de dados, lógica de negócio e fluxos de autenticação — sem impacto.
- Todas as outras abas (Alunos, Mensagens, Financeiro, etc.) mantidas sem regressões intencionais.
