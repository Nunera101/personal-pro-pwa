# Inventário de Componentes Compartilhados

Atualizado em: 2026-06-08 (revisão de consistência pós-unificação)  
Fonte: `app.js` · `src/styles/` · `index.html`

---

## STATUS GERAL DA UNIFICAÇÃO

| Componente | Status | Observação |
|-----------|--------|-----------|
| Botão primário de topo | ✅ UNIFICADO | Classe `btn-action-header` em base.css usada em 6 abas |
| stroke-width dos ícones nos botões | ✅ UNIFICADO | Global `svg { stroke-width: 2 }` prevalece sobre atributos inline |
| Cards — fundo | ✅ UNIFICADO | Token `var(--card)/#1A1A1A` em todos os domínios |
| Logo / header | ✅ UNIFICADO | `logo-oficial.svg` nas duas views (manager e student) |
| Flash preto na troca de aba | ✅ RESOLVIDO | `.view.is-entering` usa `view-fade-only` (só opacity, sem transform) |
| Sheet piscando | ✅ RESOLVIDO | install-sheet tem `is-open`/`is-closing` com timer; thread-sheet é fullscreen fixo |
| Compose acima da barra | ✅ CORRETO | `thread-sheet` é `position:fixed; z-index:1100; height:100dvh` — cobre bottom nav |
| CSS órfão `.library-primary-action` | ✅ REMOVIDO | Apagado de treinos.css (3 ocorrências) |
| CSS órfão `.contract-primary-action` | ✅ REMOVIDO | Apagado das 2 listas de seletores em base.css |
| `stroke-width="2.2"` no botão voltar do thread | ✅ CORRIGIDO | Alterado para `"2"` em app.js |

---

## 1. Ícones internos

### 1.1 Conjunto base de ícones (`icons` object — app.js ~linha 190)

Todos os ícones do conjunto central são SVG inline com `viewBox="0 0 24 24"` e `aria-hidden="true"`. O **estilo de traçado predominante é stroke** (sem fill), exceto `goal` que usa `<circle>` geométrico (fill implícito).

| Slug | Tipo de path | Observação |
|------|-------------|------------|
| `home` | `<path>` retângulos | Quatro quadrados — representa "Dashboard" na nav |
| `students` | `<path>` arco/círculo | Silhueta de pessoa |
| `agenda` | `<path>` calendário | Linhas de grade + traços de datas |
| `workouts` | `<path>` halter | Barbell horizontal |
| `layers` | `<path>` camadas | Três linhas sobrepostas |
| `library` | `<path>` livro | Livro aberto com linhas |
| `updates` | `<path>` câmera | Câmera fotográfica |
| `progress` | `<path>` gráfico de barras | Barras crescentes |
| `settings` | `<path>` engrenagem | Roda dentada complexa |
| `today` | `<path>` relógio | Círculo + ponteiros |
| `profile` | `<path>` silhueta | Mesmo path de `students` com arco maior |
| `messages` | `<path>` balão de chat | Retângulo + cauda |
| `contracts` | `<path>` documento | Folha com dobra + linhas |
| `finance` | `<path>` cifrão | Símbolo $ |
| `diet` | `<path>` prato/folha | Composição orgânica |
| `more` | `<path>` três pontos | Três círculos horizontais |
| `goal` | `<circle>` × 3 | **EXCEÇÃO:** fill geométrico, não stroke path |
| `link` | `<path>` corrente | Elos de corrente |
| `logout` | `<path>` seta saída | Porta + seta |
| `reports` | `<path>` gráfico | Similar a `progress`, linhas verticais |

> **Atenção — `goal` vs demais:** enquanto todos os ícones do conjunto usam `<path stroke-based>`, o `goal` usa três `<circle>` concêntricos. Comportamento visual diferente porém intencional (representa alvo/mira).

---

### 1.2 Tamanho e stroke-width dos ícones nos botões `btn-action-header`

**Token unificado** em `base.css`:
```css
.btn-action-header svg {
  width: 1.1rem;
  height: 1.1rem;
  stroke: currentColor;
  fill: none;
  flex-shrink: 0;
}

/* Global — prevalece sobre atributos inline */
svg { stroke-width: 2; }
```

Todos os botões `btn-action-header` herdam `1.1rem × 1.1rem` e `stroke-width: 2`.  
Os ícones "+" (Biblioteca e Padrões) têm `stroke-width="2.5"` inline, mas o CSS global prevalece → renderizam em 2.

---

### 1.3 Tamanho dos ícones na barra de navegação inferior

| Contexto | Tamanho SVG | Classe |
|----------|------------|--------|
| Bottom nav (todos os botões) | `1.05rem × 1.05rem` | `.nav-button svg` |
| Estado ativo | mesma dimensão | cor muda para `var(--brand-strong)` |

Barra inferior **consistente** em todas as abas.

---

### 1.4 Ícones por aba — mapa completo

#### Dashboard
- **Métricas:** `students`, `workouts`, `today`, `updates`, `messages`
- **Pendências:** `finance`, `updates`, `students`, `contracts`, `messages`
- **Botão hero:** `agenda` via `btn-action-header` (Agendar atividade)
- **Bottom nav:** `home`, `students`, `agenda`, `layers`, `more`

#### Alunos
- **Cards de aluno:** `goal` (único fill geométrico em card), `agenda`, `workouts`, `contracts`
- **Ações do card:** `profile`, `link`
- **Botão hero:** `students` via `btn-action-header` (Novo)
- **Bottom nav:** igual Dashboard

#### Agenda
- **Navegação de período:** chevron inline `<path d="m15 18-6-6 6-6"/>` — ícone ad-hoc, fora do conjunto central
- **Botão hero:** `agenda` via `btn-action-header` (Agendar atividade)
- **Bottom nav:** igual Dashboard

#### Padrões (Treinos)
- **Botão hero:** SVG inline "+" via `btn-action-header` (stroke-width CSS prevalece = 2)
- **Meta-lines dos cards:** `agenda`, `workouts`, `students`
- **Bottom nav:** igual Dashboard

#### Biblioteca
- **Stat cards:** `workouts`, `agenda`, `more`
- **Botão hero:** SVG inline "+" via `btn-action-header` (stroke-width CSS prevalece = 2)
- **Bottom nav:** igual Dashboard

#### Atualizações
- **Hero:** sem `btn-action-header` (aba é lista com filtros, sem ação primária no topo)
- **Botão de ação por card:** `.update-primary-action` (chevron — botão de avaliação dentro do card)
- **Bottom nav:** igual Dashboard

#### Contratos
- **Hero:** sem `btn-action-header` (aba usa `new-contract-card` inline na lista)
- **Ações dos cards:** `contracts` (Visualizar), `messages` (Reenviar), SVG PDF customizado
- **Bottom nav:** igual Dashboard

#### Financeiro
- **Registros:** `finance` (valor), `agenda` (data)
- **Insights:** `finance`, `progress`, `updates`, `today`, `agenda`
- **Botão hero:** `finance` via `btn-action-header` (Registrar pagamento)
- **Bottom nav:** igual Dashboard

#### Dieta
- **Cards de plano:** `progress`, `more`, `agenda`, `diet`, `today`
- **Botão hero:** não usa `btn-action-header` (aba tem botões de seção, não hero de topo)
- **Bottom nav:** igual Dashboard

#### Mensagens
- **Ícone da aba:** `messages`
- **Inbox WA-style:** sem botão hero de topo
- **Compose:** dentro do `thread-sheet` fullscreen (`position:fixed; z-index:1100`) — sempre acima da bottom nav

#### Perfil do aluno (view secundária)
- Painel de evolução: `progress`, `updates`
- Navegação interna: abas de texto

---

### 1.5 SVGs ad-hoc (fora do conjunto central)

| Local | SVG path | Representa | Status |
|-------|----------|-----------|--------|
| Agenda — nav período | `m15 18-6-6 6-6` | Chevron esquerdo | Mantido intencional |
| Atualizações — botão ação card | `m9 18 6-6-6-6` | Chevron direito | Mantido intencional |
| Contratos — ação PDF | SVG customizado de documento | Ícone PDF | Mantido intencional |
| Financeiro — busca/filtro | SVG lupa e funil | Search / Filter | Mantidos intencionais |
| Thread back btn | `M19 12H5M12 5l-7 7 7 7` | Seta voltar | `stroke-width="2"` ✅ |
| Thread attach btn | `M12 5v14M5 12h14` | "+" / link | `stroke-width: 2.5` no CSS (intencional — diferencia ação de envio) |

---

## 2. Botão primário de ação do topo (`btn-action-header`)

### 2.1 Token unificado (base.css linha ~5782)

```css
.btn-action-header {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: auto !important;
  min-height: 2.8rem;
  padding: 0 1.1rem;
  background: #F59E0B;          /* âmbar fixo */
  color: #080808;
  font-weight: 800;
  font-size: clamp(0.82rem, 3vw, 0.92rem);
  border-radius: 0.82rem;
  border: none;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: none;
}
```

### 2.2 Uso por aba

| Aba | Usa `btn-action-header` | Observação |
|-----|------------------------|-----------|
| Dashboard | ✅ | Agendar atividade |
| Alunos | ✅ | Novo aluno |
| Agenda | ✅ | Agendar atividade |
| Padrões | ✅ | Novo treino/padrão |
| Biblioteca | ✅ | Novo exercício |
| Financeiro | ✅ | Registrar pagamento |
| Atualizações | — | Sem ação de topo (aba de listagem + filtros) |
| Contratos | — | Sem ação de topo (`new-contract-card` inline) |
| Dieta | — | Ações por seção, sem hero |
| Mensagens | — | Inbox puro, sem hero |

### 2.3 Override mobile

Única exceção: `.finance-hero .btn-action-header` em `financeiro.css` aplica `width: 100%` em telas ≤ 22.5rem — não muda aparência, apenas expande para a linha.

---

## 3. Cards

Token `--card: #1A1A1A` definido em base.css e aplicado a todos os cards nos 9 arquivos de domínio. Nenhuma divergência de cor de fundo encontrada.

---

## 4. Transições e animações

| Elemento | Animação | Nota |
|---------|---------|------|
| Troca de aba | `view-fade-only` (opacity 0→1, 200ms) | Sem transform — evita flash no bottom nav fixo |
| Entrada de conteúdo | `view-enter` (opacity + translateY 8px, 200ms) | Aplicado em `.content-area.is-entering` |
| Modal abrir | `modal-panel-in` (scale 0.95→1 + opacity) | 220ms cubic-bezier com overshoot |
| Install sheet abrir | `sheet-panel-in` (translateY 100%→0) | |
| Install sheet fechar | `sheet-panel-out` + timer 260ms antes de `hidden = true` | Sem piscado |
| Thread sheet | fullscreen fixo `z-index:1100` | Sem animação de entrada (imediato) |

---

## 5. Divergências restantes (intencionais ou baixo impacto)

| # | Componente | Detalhe | Decisão |
|---|-----------|---------|---------|
| 1 | Ícone `goal` | Único com `<circle>` fill em vez de stroke | Mantido — representa alvo |
| 2 | `update-primary-action` | Botão de ação dentro do card de atualização (não é hero) | Mantido — classe específica de card |
| 3 | Thread attach `stroke-width: 2.5` | Intencional — diferencia visualmente a ação de envio de link | Mantido |
| 4 | Atualizações/Contratos sem `btn-action-header` | Abas são listas, não precisam de hero | Correto por design |
