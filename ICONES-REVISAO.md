# Revisão Global de Ícones — Elite AS

Data: 2026-06-07  
Arquivo central: `app.js` linhas 124–144 (`const icons = { ... }`)  
Estilo global: `fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round`

---

## Ícones trocados

### 1. `finance` — Financeiro
**Tela(s):** Menu lateral gestor, Dashboard KPI, lista de pagamentos, botão "Registrar pagamento", empty state financeiro  
**Antes:** Cartão de crédito com chip (`M4 7h16v12H4zM4 10h16M17 15h1M7 7V5h10v2`)  
**Depois:** Cifrão / dollar sign (`M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6`)  
**Por quê:** Referência exige "carteira/cifrão"; cartão de crédito não representa financeiro de forma direta.

### 2. `updates` — Atualizações
**Tela(s):** Menu lateral gestor, nav aluno, Dashboard métrica "Atualizações pendentes", card dieta "Próxima revisão", contratos "Pendentes", filtro de status financeiro  
**Antes:** Documento com lupa/busca (`M4 5h16v14H4zM8 9h8M8 13h5M18 17l3 3`)  
**Depois:** Câmera (`M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z`)  
**Por quê:** Referência exige "relógio ou câmera"; o módulo de Atualizações é sobre fotos/registros de evolução física, câmera é semanticamente preciso. Relógio descartado por conflito com `today` (já usa relógio).

---

## Ícones auditados e mantidos (sem alteração)

| Chave | Tela | Ícone atual | Referência | Status |
|---|---|---|---|---|
| `home` | Dashboard | Grade 4 quadrados | grade 4 quadrados | ✓ |
| `students` | Alunos | Silhueta de pessoa (arco) | pessoa | ✓ |
| `agenda` | Agenda | Calendário com pinos | calendário | ✓ |
| `layers` | Padrões | Camadas empilhadas | camadas empilhadas | ✓ |
| `more` | Mais | Três pontos horizontais | três pontos | ✓ |
| `goal` | Objetivo do aluno | Três círculos concêntricos (alvo) | alvo | ✓ |
| `workouts` | Treino / haltere | Barra olímpica com anilhas | haltere | ✓ |
| `contracts` | Contrato | Documento com canto dobrado + linhas | documento | ✓ |
| `messages` | Mensagens | Balão de chat com cauda + linhas | balão de chat | ✓ |
| `diet` | Dieta | Garfo (talheres) + maçã | maçã/talher | ✓ |
| `profile` | Acesso (card perfil) | Círculo cabeça + arco ombros | pessoa/login | ✓ |
| `progress` | Volume (card perfil) | Gráfico de barras verticais | gráfico de barras | ✓ |
| `today` | Hoje (nav aluno) | Relógio com ponteiros | — | ✓ |
| `settings` | Configurações | Engrenagem | — | ✓ |
| `library` | Biblioteca exercícios | Livro aberto com linhas | — | ✓ |
| `link` | Compartilhamento | Corrente/link | — | ✓ |
| `logout` | Sair | Seta saindo de porta | — | ✓ |

---

## Ícones inline (não no objeto `icons`)

Estes ícones são usados diretamente no HTML gerado e **não foram alterados** — estão corretos ou fora do escopo da referência:

| Elemento | Path | Contexto |
|---|---|---|
| Hamburger menu | `M4 7h16M4 12h16M4 17h16` | Abrir menu gestor (`index.html`) |
| Fechar modal | `M18 6 6 18M6 6l12 12` | Fechar modal (`index.html`) |
| Sino notificação | `M18 8a6 6 0 0 0-12 0c0 7-3 7...` | Botão notificações header |
| Lupa busca | `circle r=7 + M21 21l-4.35-4.35` | Campos de busca em listas |
| Filtro funil | `M4 6h16M7 12h10M10 18h4` | Botão filtrar |
| Chevron baixo | `m6 9 6 6 6-6` | Expandir filtros |
| Seta esquerda | `m15 18-6-6 6-6` | Navegar mês anterior |
| Seta direita | `m9 18 6-6-6-6` | Navegar próximo mês |
| Play | `M8 5v14l11-7z` | Badge "em uso" na biblioteca |
| Plus | `M12 5v14M5 12h14` | Novo contrato |
| Câmera placeholder | `M4 8h4l2-3h4...` | Placeholder foto atualização |
| Enviar | `M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z` | Botão envio mensagem |
