# Elite AS — Personal Pro PWA

PWA instalável para personal trainers. Permite gerenciar alunos, treinos, agenda, dieta, contratos, financeiro e chat em tempo real — tudo em uma interface mobile-first com tema escuro.

**URL de produção:** https://nunera101.github.io/personal-pro-pwa/

---

## Visão geral do produto

| Perfil | O que pode fazer |
|---|---|
| **Gestor** | Cadastrar alunos e gerar login, montar planos alimentares, criar treinos a partir da biblioteca de exercícios, gerenciar agenda (dia / semana / mês), emitir e cobrar contratos, controle financeiro (registrar, detalhar, emitir recibo), chat em tempo real, relatórios de desempenho |
| **Aluno** | Visualizar agenda, treinos e dieta, executar treinos série por série com descanso automático e registro de carga, assinar contratos, enviar mensagens ao personal, acompanhar evolução por fotos e métricas |

Funciona offline via Service Worker (cache do app shell). Quando há backend Node ativo, dados persistem em PostgreSQL e uploads vão para `uploads/exercises/`; sem backend os dados ficam em `localStorage` (modo estático/GitHub Pages).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + CSS + JavaScript vanilla (ES modules) |
| Backend | Node.js ≥ 20, Express 4, Socket.IO 4 |
| Banco | PostgreSQL (Railway) · fallback JSON em `data/` |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Upload | Multer → `uploads/exercises/` |
| E-mail | Nodemailer (SMTP configurável) |
| Push | web-push (VAPID) |
| PWA | manifest.json + Service Worker (`sw.js`) |
| Deploy | Railway (backend) · GitHub Pages / Vercel / Netlify (frontend estático) |

---

## Como rodar localmente

### Pré-requisitos

- Node.js ≥ 20
- (Opcional) PostgreSQL local ou string de conexão Railway

### 1. Instalar dependências

```powershell
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz (nunca commite este arquivo):

```env
# Banco de dados (se omitido, usa armazenamento JSON em data/)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# JWT
JWT_SECRET=seu-segredo-aqui

# URL pública do app (para links em e-mails)
APP_PUBLIC_URL=http://localhost:3000

# E-mail (opcional)
MAIL_FROM=noreply@seudominio.com
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=senha
```

> Em produção (Railway) todas as variáveis são configuradas no painel da plataforma — não hardcode valores sensíveis.

### 3. Rodar migrações (apenas com PostgreSQL)

```powershell
npm run migrate
```

### 4. Iniciar o servidor

```powershell
npm start
```

O app estará disponível em `http://localhost:3000`.

> Service Worker e instalação PWA exigem `https://` ou `localhost`. Em produção, use sempre HTTPS.

### Credencial demo

Adicione `?demo=1` à URL para exibir o card de preenchimento automático:

- **E-mail:** `admin@personalpro.app`
- **Senha:** `Admin@2026`

---

## Estrutura de pastas

```
/
├── server/                    # Backend Node.js
│   ├── auth.js                # Middlewares JWT, login, registro
│   ├── config.js              # Variáveis de ambiente e caminhos
│   ├── db.js                  # Pool PostgreSQL
│   ├── mail.js                # Envio de e-mail (Nodemailer)
│   ├── migrate.js             # Executor de migrações
│   ├── migrationRunner.js
│   ├── migrations/
│   │   └── 001_initial.sql    # Schema inicial
│   ├── routes/
│   │   └── uploads.js         # Rota de upload de vídeo (Multer)
│   └── storage/
│       └── collections.js     # Abstração JSON ↔ PostgreSQL
│
├── src/                       # Frontend (ES modules vanilla)
│   ├── api.js                 # Wrapper fetch → REST API
│   ├── auth.js                # Estado de autenticação no cliente
│   ├── pwa.js                 # Registro do SW e prompt de instalação
│   ├── state.js               # Estado global reativo
│   ├── normalize/             # Normalização de dados da API
│   ├── utils/                 # Utilitários (ids, etc.)
│   ├── styles/                # CSS por domínio
│   │   ├── base.css           # Reset, tokens, layout base
│   │   ├── nav.css            # Navegação inferior e lateral
│   │   ├── alunos.css
│   │   ├── agenda.css
│   │   ├── treinos.css
│   │   ├── dieta.css
│   │   ├── financeiro.css
│   │   ├── contratos.css
│   │   ├── chat.css
│   │   ├── relatorios.css
│   │   ├── atualizacoes.css
│   │   └── microinteractions.css
│   └── domains/               # Módulos por domínio (data / render / forms)
│       ├── alunos/
│       ├── agenda/
│       ├── treinos/
│       ├── exercicios/
│       ├── dieta/
│       ├── chat/
│       ├── contratos/
│       ├── financeiro/
│       └── atualizacoes/
│
├── assets/                    # Ícones e logo SVG
├── scripts/                   # Scripts auxiliares (PowerShell)
├── docs/                      # Documentação interna (checklist PWA, deploy)
├── app.js                     # Entry point do frontend (orquestra domínios)
├── styles.css                 # CSS legado / overrides globais
├── index.html                 # Shell HTML do PWA
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
├── server.js                  # Entry point do backend
├── package.json
├── vercel.json                # Headers Vercel (SW + manifest)
├── netlify.toml               # Headers Netlify equivalentes
└── CLAUDE.md                  # Instruções de desenvolvimento para IA
```

### Convenção dos módulos de domínio

Cada domínio em `src/domains/<nome>/` segue o padrão:

| Arquivo | Responsabilidade |
|---|---|
| `*.data.js` | Chamadas à API, cache local, lógica de negócio |
| `*.render.js` | Renderização de HTML, listeners de eventos de UI |
| `*.forms.js` | Abertura/fechamento de modais e submissão de formulários |

---

## Tokens de design oficiais

Definidos em `src/styles/base.css` (bloco `:root` Elite AS v22).

### Paleta base

| Token | Valor | Uso |
|---|---|---|
| `--brand` | `#f5b51b` | Amarelo-ouro principal, CTAs, ícones ativos |
| `--brand-strong` | `#ffc447` | Dourado mais claro, textos de destaque |
| `--brand-soft` | `rgba(245,181,27,0.15)` | Fundos de seleção e hover suave |
| `--canvas` | `#050505` | Fundo raiz da página |
| `--bg` | `#0D0D0D` | Fundo de painéis e splash |
| `--card` | `#1A1A1A` | Fundo de cards elevados |
| `--surface` | `rgba(18,18,18,0.9)` | Superfície genérica de componente |
| `--ink` | `#f7f4eb` | Texto principal (quase branco quente) |
| `--muted` | `#aaa59a` | Texto secundário, rótulos |
| `--line` | `rgba(255,255,255,0.12)` | Bordas e divisores |
| `--borda` | `rgba(255,255,255,0.06)` | Bordas mais sutis |
| `--shadow` | `0 24px 64px rgba(0,0,0,0.46)` | Sombra padrão |
| `--radius` | `8px` | Borda arredondada padrão |

### Semântica de estado

| Token | Valor | Uso |
|---|---|---|
| `--success` / `--ok` | `#48d764` | Concluído, pago, ativo |
| `--success-soft` | `rgba(72,215,100,0.13)` | Fundo de badge/status positivo |
| `--danger` / `--erro` | `#ff5a4f` | Erro, cancelado, dívida |
| `--danger-soft` | `rgba(255,90,79,0.14)` | Fundo de badge negativo |
| `--info` | `#5aa7ff` | Informativo, neutro |
| `--info-soft` | `rgba(90,167,255,0.14)` | Fundo informativo |
| `--accent` | `#f5b51b` | Alias de `--brand` para acento |
| `--accent-soft` | `rgba(245,181,27,0.16)` | Fundo de banner de descanso, etc. |

### Tokens por tipo de atividade (agenda / agenda cores)

| Token | Cor | Tipo de evento |
|---|---|---|
| `--dourado` / `--dourado-soft` / `--dourado-borda` | `#F59E0B` | Avaliação geral |
| `--treino` / `--treino-soft` / `--treino-borda` | `#10B981` | Sessão de treino |
| `--aval` / `--aval-soft` / `--aval-borda` | `#8B5CF6` | Avaliação física |
| `--atualiza` / `--atualiza-soft` / `--atualiza-borda` | `#3B82F6` | Atualização quinzenal |
| `--retorno` / `--retorno-soft` / `--retorno-borda` | `#F97316` | Retorno / follow-up |

### Tipografia

- **Família:** Inter → `ui-sans-serif` → `system-ui` → `-apple-system`
- **Antialiasing:** `-webkit-font-smoothing: antialiased`
- **Escala de destaque:** `clamp(2rem, 9vw, 3rem)` (títulos de página)
- **Peso padrão dos botões:** 800
- **Peso de rótulos:** 750–850

### Breakpoints responsivos

| Breakpoint | Comportamento |
|---|---|
| `< 28rem` | Colunas colapsam para 1, ações ocupam largura total |
| `≥ 42rem` | Grid de métricas expande para 4 colunas |
| `≥ 58rem` | Side-nav lateral visível, bottom-nav some, modal centralizado |

---

## Deploy

### GitHub Pages (frontend estático)

O workflow `.github/workflows/pages.yml` publica automaticamente a raiz do repositório. Dados ficam em `localStorage` — sem backend.

### Railway (backend + banco)

1. Crie um projeto Railway com um serviço Node e um plugin PostgreSQL.
2. Configure as variáveis de ambiente listadas acima no painel Railway.
3. O serviço sobe com `npm start` (entry point: `server.js`).
4. Execute `npm run migrate` uma vez para criar o schema.

### Vercel / Netlify

Os arquivos `vercel.json` e `netlify.toml` já configuram os headers necessários para Service Worker e manifest (`Cache-Control`, `Service-Worker-Allowed`).

---

## Ícones e logo

O arquivo `assets/logo-oficial.svg` é o wordmark oficial. Para regenerar os ícones PNG após trocar a logo:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\scripts\gerar-icones.ps1
```

Arquivos gerados:

- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/icon-maskable-512.png`
- `assets/apple-touch-icon.png`
