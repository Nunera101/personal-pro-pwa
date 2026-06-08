# AUDIT-A11Y — Auditoria de Acessibilidade

**Data:** 2026-06-08  
**Escopo:** Auditoria estática do código-fonte (HTML + CSS). Sem execução de ferramenta automática.  
**Critério de referência:** WCAG 2.1 nível AA.  
**Status:** Somente relatório — nenhum código alterado.

---

## Legenda de severidade

| Nível | Critério |
|-------|----------|
| 🔴 Alta | Impede uso por teclado ou leitor de tela |
| 🟡 Média | Dificulta uso; falha WCAG AA mas existe alternativa parcial |
| 🟢 Baixa | Melhoria de qualidade; não bloqueia uso |

---

## Resumo executivo

| Categoria | Ocorrências |
|-----------|-------------|
| Labels ausentes | 2 |
| Contraste de texto insuficiente | 3 |
| Foco visível removido sem substituto | 9 |
| Área de toque < 44 px | 3 |
| ARIA incompleto em padrão de tabs | 1 |
| SVG decorativo sem aria-hidden | 1 |

---

## Tela 1 — Login (`index.html` › `#loginView`)

### 🟢 Botão de preenchimento de demo sem contexto (label ambígua)

- **Elemento:** `<button type="button" id="fillAdminDemo">Preencher</button>`
- **Arquivo:** `index.html:82`
- **Problema:** O texto "Preencher" não descreve o que será preenchido. Um leitor de tela anuncia apenas "Preencher" sem contexto de qual formulário ou ação.
- **Recomendação:** Adicionar `aria-label="Preencher credenciais de administrador demo"` ou adicionar texto descritivo acessível com `<span class="sr-only">`.

### ✅ Campos do formulário de login

Os três inputs (`email`, `password`, `rememberMe`) estão dentro de `<label>` envolventes — padrão correto, sem problema.

---

## Tela 2 — Shell do app / Dialogs compartilhados (`index.html`)

### ✅ Botões de ícone no header

Todos os botões de ícone do header principal possuem `aria-label` e os SVGs têm `aria-hidden="true"`. Exemplos:
- `aria-label="Abrir menu do gestor"` (linha 110)
- `aria-label="Notificações"` (linha 122)
- `aria-label="Configurações"` (linha 125)

### ✅ Modais e sheets

Todos os dialogs usam `role="dialog"`, `aria-modal="true"` e `aria-labelledby`. Correto.

---

## Tela 3 — Chat / Thread Sheet (`index.html` › `#threadSheet`)

### 🔴 Textarea sem label acessível

- **Elemento:** `<textarea class="thread-input" name="body" ... placeholder="Mensagem..." rows="1">`
- **Arquivo:** `index.html:435`
- **Problema:** O campo depende exclusivamente do `placeholder` como rótulo. Placeholders somem ao digitar e não são anunciados como label por todos os leitores de tela.
- **Recomendação:** Adicionar `aria-label="Mensagem"` ao elemento ou um `<label>` associado via `for`/`id`.

### 🔴 Foco visível removido na textarea

- **Arquivo:** `src/styles/chat.css:765`
- **Trecho:** `.message-search-field:focus { outline: none; }` (sem `box-shadow` ou borda de substituição)
- **Problema:** Usuários de teclado perdem o indicador de foco ao navegar até o campo.
- **Recomendação:** Substituir por `outline: none; box-shadow: 0 0 0 3px var(--brand);` ou equivalente.

### 🟡 Botões "Enviar link" e "Enviar" abaixo de 44 px

- **Arquivo:** `src/styles/chat.css:720-724` e `chat.css:772-776`
- **Elementos:** `.thread-attach-btn` e `.thread-send-btn`
- **Tamanho declarado:** `width: 2.65rem; height: 2.65rem` → **42,4 px** (base 16 px)
- **Problema:** Abaixo do mínimo WCAG de 44 × 44 px (critério 2.5.5, nível AA).
- **Recomendação:** Aumentar para `2.75rem` (44 px) ou adicionar `padding` que expanda a área clicável sem alterar o visual.

---

## Tela 4 — Sheet "Enviar Link" (`index.html` › `#enviarLinkSheet`)

### 🔴 Botão fechar com área de toque de 33,6 px

- **Arquivo:** `src/styles/alunos.css:2396-2399`
- **Trecho:**
  ```css
  .el-close-btn {
    width: 2.1rem;
    height: 2.1rem;
    min-height: 2.1rem;
  }
  ```
- **Tamanho efetivo:** **33,6 px** — falha clara (< 44 px).
- **Recomendação:** Aumentar para `2.75rem` (44 px) e ajustar `padding` para compensar visualmente se necessário.

### 🟡 Foco removido no contexto do sheet

- **Arquivo:** `src/styles/alunos.css:2444`
- **Trecho:** `outline: none;` sem substituto visual
- **Recomendação:** Adicionar `box-shadow: 0 0 0 3px var(--brand);` no `:focus-visible`.

---

## Tela 5 — Treinos (estilos em `src/styles/treinos.css`)

### 🔴 Foco removido em inputs de treino

- **Arquivo:** `src/styles/treinos.css:159` e `treinos.css:217`
- **Problema:** `outline: none` em inputs de séries/carga sem indicador de foco substituto.
- **Recomendação:** Adicionar `:focus-visible { box-shadow: 0 0 0 2px var(--brand); border-radius: 4px; }`.

### 🔴 Foco removido com `!important`

- **Arquivo:** `src/styles/treinos.css:635`
- **Trecho:** `outline: 0 !important;`
- **Problema:** O `!important` impede qualquer override via folha do usuário ou extensão de acessibilidade.
- **Recomendação:** Remover o `!important` e definir o estado de foco explicitamente.

### 🟡 Input inline com altura mínima de 27,5 px

- **Arquivo:** `src/styles/treinos.css:210`
- **Trecho:** `.wk-input-inline { min-height: 1.72rem; }` → **27,5 px**
- **Problema:** Inputs de séries/carga/reps são muito pequenos para uso em touch.
- **Recomendação:** Aumentar para `min-height: 2.75rem` (44 px) ou adicionar padding adequado.

---

## Tela 6 — Dieta (estilos em `src/styles/dieta.css`)

### 🔴 Foco removido em múltiplos inputs sem substituto

Quatro ocorrências de `outline: none` sem `box-shadow` de substituição:

| Linha | Seletor | Problema |
|-------|---------|----------|
| `dieta.css:901` | (seletor de input de refeição) | `outline: none` simples, sem `:focus` |
| `dieta.css:920` | `.mp-meal-time-input:focus` | Só muda `border-color`, sem anel de foco |
| `dieta.css:969` | `.mp-food-kcal-input:focus` | Só muda `border-color`, sem anel de foco |
| `dieta.css:1035` | `.mp-food-search-input:focus` | Só muda `border-color`, sem anel de foco |

- **Recomendação:** Complementar cada `:focus` com `box-shadow: 0 0 0 3px rgba(11,107,87,0.35);` além da mudança de `border-color`.

### 🟡 Inputs de busca sem label

- Inputs de busca de alimentos (`.mp-food-search-input`) provavelmente dependem de `placeholder`. Verificar se existe `aria-label` no HTML gerado dinamicamente.

---

## Tela 7 — Financeiro (estilos em `src/styles/financeiro.css`)

### 🟡 Foco removido em input de valor

- **Arquivo:** `src/styles/financeiro.css:896`
- **Trecho:** `outline: none;` sem substituto
- **Recomendação:** Adicionar `box-shadow: 0 0 0 3px var(--brand);` no estado `:focus-visible`.

### 🟡 Foco removido em select/input

- **Arquivo:** `src/styles/financeiro.css:181`
- **Trecho:** `outline: 0;`
- **Recomendação:** Verificar se o elemento tem estilo `:focus` definido abaixo; se não, adicionar.

---

## Tela 8 — Contratos (estilos em `src/styles/contratos.css`)

### 🟡 Dois pontos com foco removido

- **Arquivo:** `src/styles/contratos.css:241` e `contratos.css:624`
- **Trechos:** `outline: 0;` e `outline: none;`
- **Recomendação:** Verificar contexto de cada regra; se for um input ou botão interativo, adicionar `:focus-visible` com box-shadow.

---

## Tela 9 — Atualizações (estilos em `src/styles/atualizacoes.css`)

### 🟢 Foco removido em elemento

- **Arquivo:** `src/styles/atualizacoes.css:183`
- **Trecho:** `outline: 0;`
- **Recomendação:** Confirmar se o elemento afetado é interativo; se sim, garantir substituto visual.

---

## Tela 10 — Área do Aluno (`acesso.html`)

### 🔴 Padrão de tabs incompleto (ARIA ausente)

- **Arquivo:** `acesso.html:498-521`
- **Problema:** Os botões de tab usam `role="tab"` e os painéis usam `role="tabpanel"`, mas faltam os atributos que conectam tab ao painel e indicam estado selecionado:

  | Atributo ausente | Onde adicionar | Impacto |
  |-----------------|---------------|---------|
  | `aria-selected="true/false"` | Cada `<button role="tab">` | Leitor de tela não sabe qual aba está ativa |
  | `aria-controls="sec-treino"` | Cada `<button role="tab">` | Não vincula tab ao painel correspondente |
  | `aria-labelledby` | Cada `<section role="tabpanel">` | Painel não tem nome acessível |
  | `tabindex="-1"` | Tabs não selecionadas | Navegação por teclado em tabs deve seguir padrão roving tabindex |

- **Recomendação:** Implementar o padrão WAI-ARIA Tabs completo. Tabs não ativas devem ter `tabindex="-1"` e o foco deve mover-se com as teclas de seta.

### 🟡 SVGs nos botões de tab sem `aria-hidden`

- **Arquivo:** `acesso.html:500-514`
- **Problema:** Os ícones SVG dentro dos botões de tab não têm `aria-hidden="true"`. Leitores de tela tentarão ler o conteúdo do SVG (vazio neste caso, mas poluição de anúncio).
- **Recomendação:** Adicionar `aria-hidden="true"` a cada `<svg>` dentro das tabs.

### 🟡 SVG do logo no header sem label nem `aria-hidden`

- **Arquivo:** `acesso.html:484-486`
- **Problema:** O SVG no header funciona como decorativo, mas não tem `aria-hidden="true"`. O texto "Personal Pro" ao lado já descreve a marca.
- **Recomendação:** Adicionar `aria-hidden="true"` ao SVG.

### 🟡 Contraste — texto do footer em tamanho muito pequeno

- **Arquivo:** `acesso.html` (inline CSS, linha ~452-458)
- **Trecho:** `.pa-footer { font-size: 0.72rem; color: var(--muted); }` → ~11,5 px
- **Problema:** Texto de 11,5 px com `--muted: #738d84` sobre `--bg: #0b1210` tem relação de contraste calculada em ~5,5:1 — tecnicamente passa AA, mas em tamanho tão pequeno o texto é de difícil leitura prática.
- **Recomendação:** Aumentar para no mínimo `0.8rem` (12,8 px) ou `0.85rem`.

### 🟢 Texto de carregamento com `style` inline usando cor `muted`

- **Arquivo:** `acesso.html:472`
- **Trecho:** `<p style="color:var(--muted);font-size:.9rem;">Carregando sua área…</p>`
- **Problema:** Usa estilo inline; dificulta manutenção e overrides de tema.
- **Recomendação:** Mover para classe CSS e verificar contraste em todas as variações de tema.

---

## Problemas transversais (todos os módulos)

### 🔴 Remoção global de `outline` no base sem cobertura completa

- **Arquivo:** `src/styles/base.css:373`
- **Trecho:** `.field input { outline: none; }`
- **Situação:** Existe substituto parcial em `base.css:383-388`:
  ```css
  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 4px rgba(11, 107, 87, 0.13);
  }
  ```
- **Problema residual:** O `box-shadow` com opacidade `0.13` (~13%) pode ser insuficiente para usuários com baixa visão. Outros seletores que herdam `.field input` mas não têm o override de `:focus` ficam sem indicador.
- **Recomendação:** Aumentar opacidade do box-shadow de foco para `0.35` ou `0.4` e garantir que todos os inputs interativos estejam cobertos.

### 🟢 Ausência de `focus-visible` polyfill / estratégia

- Em toda a base CSS, o uso de `:focus` em vez de `:focus-visible` significa que o anel de foco aparece também ao clicar com mouse. Isso pode levar a times tirarem o foco para "parecer mais limpo". Usar `:focus-visible` evita esse trade-off.
- **Recomendação:** Migrar gradualmente de `:focus` para `:focus-visible` nos módulos CSS.

---

## Checklist de correções recomendadas (por prioridade)

### Prioridade 1 — Bloqueia uso acessível
- [ ] `src/styles/alunos.css:2397` — Aumentar `.el-close-btn` para `2.75rem` (44 px)
- [ ] `src/styles/chat.css:723-724` — Aumentar `.thread-attach-btn` para `2.75rem`
- [ ] `src/styles/chat.css:775-776` — Aumentar `.thread-send-btn` para `2.75rem`
- [ ] `index.html:435` — Adicionar `aria-label="Mensagem"` à textarea do chat
- [ ] `acesso.html:499-516` — Adicionar `aria-selected`, `aria-controls`, `tabindex` ao padrão de tabs
- [ ] `src/styles/treinos.css:635` — Remover `outline: 0 !important;`
- [ ] `src/styles/chat.css:765` — Adicionar `box-shadow` de foco ao campo de busca

### Prioridade 2 — Dificulta uso
- [ ] `src/styles/treinos.css:159,217` — Adicionar `:focus-visible` com box-shadow
- [ ] `src/styles/dieta.css:920,969,1035` — Complementar com box-shadow além da borda
- [ ] `src/styles/financeiro.css:896` — Adicionar box-shadow de foco
- [ ] `src/styles/contratos.css:241,624` — Verificar e corrigir foco
- [ ] `acesso.html:500-514` — `aria-hidden="true"` nos SVGs das tabs

### Prioridade 3 — Melhoria de qualidade
- [ ] `index.html:82` — Melhorar texto do botão demo com `aria-label` descritivo
- [ ] `src/styles/base.css:388` — Aumentar opacidade do box-shadow de foco (0.13 → 0.35)
- [ ] `acesso.html:452` — Aumentar `.pa-footer` de `0.72rem` para ≥ `0.8rem`
- [ ] `acesso.html:484` — Adicionar `aria-hidden="true"` ao SVG do logo
- [ ] Migrar `:focus` para `:focus-visible` nos módulos CSS ao longo do tempo

---

*Relatório gerado por análise estática. Recomenda-se validação complementar com leitores de tela (NVDA/VoiceOver) e ferramenta de contraste (ex: axe DevTools ou Colour Contrast Analyser).*
