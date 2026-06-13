# RELATORIO-ADMIN — Área do Dono do Sistema (Super Admin)

> **Escopo:** Documentação e design. Nenhum código implementado.
> **Data:** 2026-06-13

---

## 1. Contexto e Motivação

O sistema hoje opera com dois perfis: **manager** (personal trainer) e **student** (aluno). Cada trainer tem seu próprio `trainerId` que isola completamente os dados — alunos, treinos, pagamentos, contratos.

O **Admin** (dono do sistema/SaaS) é um terceiro perfil acima de todos os trainers. Ele não é um trainer; é quem vende o acesso ao sistema para os trainers. Suas necessidades são:

- Ver o negócio como um todo: quantos trainers, quantos alunos, quanto fatura
- Gerenciar os trainers como "clientes" do SaaS
- Entrar na visão de um trainer específico para suporte ou auditoria
- Ter métricas consolidadas sem misturar dados entre trainers

---

## 2. Modelo de Dados Proposto

### 2.1 Alteração na tabela `trainers` (já existe)

Adicionar colunas sem quebrar estrutura atual:

```sql
ALTER TABLE trainers ADD COLUMN role TEXT NOT NULL DEFAULT 'trainer';
-- role: 'trainer' | 'admin'
-- O admin é um trainer especial; não tem alunos próprios.

ALTER TABLE trainers ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
-- status: 'active' | 'suspended' | 'trial' | 'canceled'

ALTER TABLE trainers ADD COLUMN plan TEXT;
-- plan: 'starter' | 'pro' | 'elite' | null
-- Plano de assinatura do trainer no SaaS

ALTER TABLE trainers ADD COLUMN plan_value NUMERIC(10,2);
-- Mensalidade que o trainer paga ao dono do sistema

ALTER TABLE trainers ADD COLUMN trial_ends_at TIMESTAMPTZ;
-- Quando o período de trial expira

ALTER TABLE trainers ADD COLUMN created_by_admin_id INTEGER REFERENCES trainers(id);
-- Qual admin criou este trainer (para multi-admin futuro)

ALTER TABLE trainers ADD COLUMN notes TEXT;
-- Observações internas do admin sobre o trainer
```

### 2.2 Nova tabela: `admin_sessions` (impersonação)

```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES trainers(id),
  target_trainer_id INTEGER NOT NULL REFERENCES trainers(id),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  reason TEXT
  -- reason: 'support' | 'audit' | 'demo'
);
```

Impersonação é temporária e auditada. O admin gera um token de sessão que monta a visão do trainer alvo sem alterar credenciais.

### 2.3 Nova tabela: `saas_payments` (financeiro do SaaS)

```sql
CREATE TABLE saas_payments (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES trainers(id),
  reference_month TEXT NOT NULL, -- 'YYYY-MM'
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'paid' | 'pending' | 'overdue'
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Separa o financeiro do SaaS (admin cobra do trainer) do financeiro interno (trainer cobra do aluno), que já existe na tabela `payments` (scoped por `trainer_id`).

### 2.4 Estrutura do JWT para admin

```js
// Payload do token admin
{
  role: 'admin',
  trainerId: <id do admin>,
  email: 'admin@sistema.com',
  // Sem studentId — admin não tem aluno
}

// Payload do token de impersonação
{
  role: 'manager',           // Entra como manager do trainer alvo
  trainerId: <id do trainer alvo>,
  email: <email do trainer alvo>,
  impersonatedBy: <id do admin>,
  impersonationToken: <token da admin_sessions>,
}
```

---

## 3. Telas Necessárias

### Tela 1 — Login Admin

**Reutiliza:** tela de login existente (`#loginView`).

**Diferença:** após autenticação com `role: 'admin'`, redireciona para `renderAdmin()` em vez de `renderManager()`.

**Nenhum componente novo necessário.**

---

### Tela 2 — Dashboard Admin (Home)

**URL/View:** `#admin-home`

**Métricas no topo (cards de KPI):**

| Card | Dado | Fonte |
|------|------|-------|
| Trainers Ativos | COUNT trainers WHERE status='active' | trainers |
| Total de Alunos | COUNT students (todos trainers) | students |
| Faturamento do Mês | SUM saas_payments.amount WHERE mês atual | saas_payments |
| Faturamento Pendente | SUM saas_payments WHERE status='pending' | saas_payments |
| Trainers em Trial | COUNT trainers WHERE status='trial' | trainers |
| Inadimplentes | COUNT trainers com saas_payment overdue | saas_payments |

**Seção: Atividade Recente**
- Últimos 5 trainers criados
- Últimos 5 pagamentos SaaS (pagos ou vencidos)
- Alertas: trials expirando em ≤7 dias

**Seção: Gráfico de Crescimento** (opcional, fase 2)
- Novos trainers por mês
- Receita SaaS por mês

**Reutiliza:** os mesmos cards de métrica do `renderManager` home — só mudam os dados injetados. A função que renderiza um card KPI não precisa saber se é dado de aluno ou de trainer.

---

### Tela 3 — Lista de Trainers

**URL/View:** `#admin-trainers`

**Componentes:**
- Barra de busca (nome, email)
- Filtro por status: Todos | Ativos | Trial | Suspensos | Cancelados
- Filtro por plano: Starter | Pro | Elite

**Card de cada trainer:**

```
┌─────────────────────────────────────────────┐
│  [Avatar]  João Silva                        │
│            joao@email.com                    │
│            ● Ativo  —  Plano Pro  —  R$297  │
│                                              │
│  Alunos: 14  │  Receita: R$4.900/mês        │
│  Trial até: —  │  Desde: Jan 2026            │
│                                              │
│  [Ver Perfil]  [Impersonar]  [Suspender]    │
└─────────────────────────────────────────────┘
```

**Reutiliza:** estrutura dos cards de aluno existentes (`student-card`). O layout nome + badge de status + ações é idêntico. Apenas os campos mudam.

**Ação "Novo Trainer":** abre o mesmo `formModal` genérico com campos: nome, email, plano, valor, data início trial.

---

### Tela 4 — Perfil do Trainer (Detalhe/Edição)

**URL/View:** `#admin-trainer-detail?id=<trainerId>`

**Seções:**

#### 4.1 Dados Cadastrais
- Nome, email, telefone, CPF/CNPJ (campos do `settings` JSONB já existente)
- Plano, valor, status, data de criação
- Observações internas do admin
- Botões: Salvar, Suspender, Cancelar Conta

#### 4.2 Alunos deste Trainer
- Lista compacta (nome, status ativo/inativo) — read-only
- Total: X ativos, Y inativos
- Reutiliza: mini-cards de aluno já existentes, sem botões de ação

#### 4.3 Financeiro SaaS deste Trainer
- Histórico de pagamentos `saas_payments` filtrado por `trainer_id`
- Colunas: Mês, Valor, Status, Data Pago, Método
- Botão: Registrar Pagamento (abre `paymentFormSheet` adaptado)
- Reutiliza: tabela/lista de pagamentos do `renderFinance()` existente

#### 4.4 Sessões de Impersonação
- Histórico: quando o admin entrou, por quanto tempo, motivo
- Fonte: `admin_sessions` filtrado por `target_trainer_id`

---

### Tela 5 — Modo de Impersonação (Visão do Trainer)

**Mecanismo:**

1. Admin clica em "Impersonar" no card do trainer
2. Sistema gera um `admin_sessions` token com `expires_at = NOW() + 2h`
3. Frontend carrega `renderManager()` com o `trainerId` do trainer alvo
4. **Banner fixo no topo:**

```
┌──────────────────────────────────────────────────────┐
│ ⚠ Você está vendo como: João Silva (joao@email.com) │
│                              [Sair da Impersonação]  │
└──────────────────────────────────────────────────────┘
```

5. Clicar "Sair" restaura a sessão admin e volta para `#admin-trainer-detail`

**O que o admin pode fazer durante impersonação:**
- Ver todos os dados do trainer: alunos, treinos, contratos, pagamentos, mensagens
- Criar/editar dados **em nome do trainer** (para suporte)
- **Não** pode criar novos trainers — ação de admin, não de manager

**Reutiliza:** 100% do `renderManager()` existente. A impersonação só troca o `trainerId` no estado da aplicação e exibe o banner.

---

### Tela 6 — Financeiro Consolidado (SaaS)

**URL/View:** `#admin-finance`

**Seção: KPIs do mês atual**
- MRR (Monthly Recurring Revenue): soma dos planos ativos
- Recebido no mês: `saas_payments` status=paid, mês atual
- Pendente: `saas_payments` status=pending
- Inadimplência: `saas_payments` status=overdue

**Seção: Receita por Trainer (tabela)**

| Trainer | Plano | Valor | Status Mês | Pago Em |
|---------|-------|-------|------------|---------|
| João Silva | Pro | R$297 | ✅ Pago | 05/06 |
| Maria Santos | Elite | R$497 | ⏳ Pendente | — |
| Carlos Lima | Starter | R$97 | 🔴 Vencido | — |

- Filtro por mês (navegação mês anterior/próximo)
- Filtro por status
- Exportar CSV (fase 2)

**Seção: Histórico Mensal (linha do tempo)**
- Cada mês: total faturado vs recebido vs pendente

**Reutiliza:**
- Estrutura de `renderFinance()` (manager) — mesmas colunas e status badges
- Cards KPI de receita — mesmo componente, dados de `saas_payments`
- Filtros de mês — já existem no módulo financeiro do trainer

---

### Tela 7 — Métricas Gerais / Relatório

**URL/View:** `#admin-reports`

**Relatórios disponíveis:**

| Relatório | Dados |
|-----------|-------|
| Trainers por Plano | Pie chart: quantos em cada plano |
| Crescimento de Alunos | Total de alunos no sistema por mês |
| Faturamento SaaS | Receita mensal histórica |
| Churn | Trainers cancelados por mês |
| Ranking de Trainers | Ordenado por: alunos ativos / receita gerada / engajamento |

**Reutiliza:** `renderReports()` do manager — mesma estrutura de seções e cards. Os dados vêm de endpoints admin (`/api/admin/metrics`) em vez de `/api/collections`.

---

## 4. Fluxo de Navegação Admin

```
Login
  └─▶ renderAdmin()
        ├─▶ #admin-home          (Dashboard)
        ├─▶ #admin-trainers      (Lista de Trainers)
        │     └─▶ #admin-trainer-detail  (Perfil + Financeiro SaaS)
        │               └─▶ [Impersonar]
        │                     └─▶ renderManager() com banner ⚠
        │                               └─▶ [Sair] ─▶ volta ao detalhe
        ├─▶ #admin-finance       (Financeiro Consolidado SaaS)
        └─▶ #admin-reports       (Métricas Gerais)
```

---

## 5. Endpoints de API Necessários

> Todos prefixados com `/api/admin/` e protegidos por middleware que exige `role: 'admin'`.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/metrics` | KPIs consolidados (trainers, alunos, MRR) |
| GET | `/api/admin/trainers` | Lista todos os trainers com stats |
| POST | `/api/admin/trainers` | Cria novo trainer |
| GET | `/api/admin/trainers/:id` | Detalhe: dados + alunos + financeiro |
| PATCH | `/api/admin/trainers/:id` | Atualiza perfil/status/plano |
| POST | `/api/admin/trainers/:id/impersonate` | Gera token de impersonação |
| DELETE | `/api/admin/impersonate/:token` | Encerra sessão de impersonação |
| GET | `/api/admin/saas-payments` | Lista todos os pgtos SaaS |
| POST | `/api/admin/saas-payments` | Registra pagamento SaaS |
| GET | `/api/admin/reports` | Dados para gráficos consolidados |

---

## 6. Reaproveitamento de Componentes Existentes

| Componente Existente | Uso no Admin |
|---------------------|-------------|
| Cards KPI (home manager) | Dashboard admin: mesmo HTML, dados de `admin/metrics` |
| `student-card` | `trainer-card`: mesma estrutura visual, campos trocados |
| `formModal` genérico | Criar/editar trainer: mesmo modal com campos diferentes |
| `renderFinance()` + tabela de pagamentos | Financeiro SaaS: mesma tabela, fonte `saas_payments` |
| `paymentFormSheet` | Registrar pgto SaaS: mesmo form, `trainer_id` no lugar de `student_id` |
| `renderReports()` | Relatórios admin: mesma estrutura de seções |
| Filtros de mês/status | Idênticos em todas as telas financeiras |
| `renderManager()` completo | Impersonação: reutilizado sem mudança |
| Banner de notificação (toast) | Banner de impersonação: mesmo padrão visual |
| `audit_logs` (já existe) | Registrar ações do admin automaticamente |

---

## 7. Considerações de Segurança

- **Middleware de admin:** toda rota `/api/admin/` deve verificar `req.user.role === 'admin'`. Sem exceção.
- **Impersonação auditada:** toda entrada em impersonação cria registro em `admin_sessions` com `reason` obrigatório.
- **Impersonação não grava senhas:** o token de impersonação não expõe nem altera credenciais do trainer.
- **Expiração forçada:** tokens de impersonação expiram em 2h; frontend força logout do modo impersonação.
- **Admin não aparece para trainers:** trainers não veem outros trainers; o admin é invisível no escopo deles.
- **Logs de mutação:** qualquer alteração feita durante impersonação grava `audit_logs` com `actor_id = admin` e `impersonating = trainer_id`.

---

## 8. Itens Fora do Escopo Desta Fase

- Sistema de notificações/alertas automáticos ao admin (trial expirando, inadimplência)
- Cobrança automatizada (integração Stripe/Asaas)
- Multi-admin (mais de um usuário com role=admin)
- Portal público de onboarding de novos trainers (cadastro self-service)
- Permissões granulares por admin (RBAC interno)

Estes itens ficam para fases futuras e não comprometem a arquitetura proposta acima.
