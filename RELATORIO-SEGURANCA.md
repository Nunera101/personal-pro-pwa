# Relatório de Segurança — Personal Pro / Elite AS

**Data da auditoria:** 2026-06-13  
**Escopo:** leitura de código, sem alteração de arquivos  
**Auditor:** análise estática do repositório  

---

## 1. Como funciona o login/auth hoje

### Fluxo resumido

```
[Usuário] → POST /api/auth/login → [servidor valida credencial]
                                  → gera JWT (jsonwebtoken)
                                  ← retorna { token, user }
[Front]   → armazena token (localStorage ou sessionStorage)
          → envia em cada request: Authorization: Bearer <token>
[Servidor] → requireAuth() → verifySessionToken() → decodifica JWT
           → injeta req.auth = { role, email, trainerId, studentId }
```

### Onde a validação acontece

**100% no servidor.** O middleware `requireAuth` (`server/auth.js:41`) valida o JWT antes de qualquer rota protegida. O front-end `src/auth.js` e `src/api.js` estão atualmente vazios (apenas um comentário).

### Roles existentes

| Role | Quem | Gerado por |
|---|---|---|
| `manager` | Personal trainer (admin) | Login com `admin@personalpro.app` |
| `student` | Aluno | Login com e-mail + senha (após convite) |

### Hash de senha

- **Novas senhas:** bcrypt custo 12 (`bcrypt.hashSync`) — adequado.
- **Legado:** `hashPassword()` usa FNV-1a de 32 bits com prefixo fixo — **hash trivialmente quebrável**, mantido apenas para migração automática (ao fazer login com hash legado, o servidor realiza upgrade automático para bcrypt).

### TTL de sessão

JWT com expiração configurável via `SESSION_TTL` (padrão `12h`). Não há invalidação de token ativa (sem blocklist), o que significa que o logout é apenas client-side.

---

## 2. Mapa de rotas: com e sem autenticação

### Rotas públicas (sem nenhum middleware de auth)

| Rota | Risco |
|---|---|
| `GET /api/health` | Expõe tipo de storage, status do banco e configurações de mail/push |
| `GET /api/push/vapid-public-key` | Chave pública — sem risco |
| `POST /api/auth/login` | Com rate limit (10/15 min) |
| `POST /api/auth/forgot-password` | Com rate limit |
| `POST /api/auth/reset-password` | Com rate limit |
| `POST /api/auth/contract-token` | Valida token de contrato; retorna `studentId`, `contractId`, `email` — token não é marcado como usado |
| `POST /api/auth/student-area-view` | **Token não é consumido após uso** — reutilizável por 7 dias; retorna treinos, dietas, atualizações de progresso |
| `GET /api/videos/:id` | **Sem autenticação** — qualquer pessoa com um ID válido pode baixar o vídeo |
| `GET /uploads/*` | **Sem autenticação** — PDFs de contrato, fotos de perfil, vídeos legacy acessíveis por URL direta |

### Rotas com `requireAuth` (manager ou student)

| Rota | Observação |
|---|---|
| `GET/PUT /api/collections/:collection` | Filtragem por role dentro da função; aluno só vê seus próprios dados |
| `DELETE /api/collections/:collection/:id` | Aluno não pode deletar registros de outros students |
| `GET/PUT /api/profile` | OK |
| `POST/DELETE /api/push/subscribe` | OK |
| `POST /api/auth/contract-signature-meta` | OK |

### Rotas com `requireManager` (apenas trainer)

| Rota |
|---|
| `POST /api/auth/student-invite` |
| `POST /api/auth/contract-link` |
| `POST /api/auth/student-area-link` |
| `POST /api/videos/` |
| `POST /api/uploads/exercises` |
| `POST /api/uploads/contracts` |

---

## 3. Onde dados sensíveis trafegam

| Dado | Onde armazenado | Como trafega |
|---|---|---|
| **CPF do aluno** (`signerCpf`) | Collection `personal-pro-contracts-v1` (JSON/Postgres) | JSON via HTTPS em `/api/collections/personal-pro-contracts-v1` |
| **Senhas (hash bcrypt)** | Collection `personal-pro-students-v2` / settings | Campo `passwordHash` removido antes de enviar ao cliente (`sanitizeStudent`) — OK |
| **Hash da senha admin** | Collection `personal-pro-settings-v1` | Campo `adminPasswordHash` removido em `sanitizeSettings` — OK |
| **Dados financeiros** (mensalidades, valores) | Collection `personal-pro-payments-v1` | Aluno só vê seus próprios registros; manager vê todos |
| **Contrato em PDF** | `/uploads/contracts/` em disco | Acessível via URL pública sem autenticação |
| **Fotos de progresso** | `/uploads/` em disco | Acessível via URL pública sem autenticação |
| **Token JWT** | `localStorage` / `sessionStorage` no front | Enviado como `Bearer` em cada request — exposto a XSS |
| **VAPID private key** | Variável de ambiente `VAPID_PRIVATE_KEY` | Não exposto ao front — OK |
| **Credenciais SMTP** | Variáveis de ambiente | Não expostas ao front — OK |

---

## 4. HTTPS / TLS

- O servidor Node sobe como **HTTP puro** (`http.createServer`).
- TLS é terminado pelo **Railway** (reverse proxy) antes de chegar ao app.
- Em produção no Railway: comunicação cliente→Railway é HTTPS; Railway→Node é HTTP interno — aceitável para esse modelo.
- **Em desenvolvimento local:** HTTP sem TLS. Cookies com `Secure` não funcionariam localmente, mas o app usa `Authorization: Bearer`, que não depende de cookies.
- **Sem HSTS** nem Strict-Transport-Security headers — o servidor não força HTTPS ativo.

---

## 5. Chaves e segredos no código-fonte

| Local | Segredo exposto | Severidade |
|---|---|---|
| `index.html` linhas 104-110 | `admin@personalpro.app` + `Senha: Admin@2026` visíveis em HTML público | **CRÍTICO** |
| `server/routes/api.js:517` | `hashPassword("Admin@2026")` — senha padrão hardcoded | **CRÍTICO** |
| `server/config.js:18` | `jwtSecret: process.env.JWT_SECRET \|\| "personal-pro-local-dev-secret"` | Alto |
| `server/auth.js:6-9` | Fallback para `crypto.randomBytes(32)` — válido mas muda a cada restart, invalidando todas as sessões ativas | Médio |

---

## 6. Validação de input nas rotas

### O que existe

- `COLLECTION_ALLOWLIST` (`server/routes/api.js:37`) impede acesso a coleções arbitrárias.
- `multer` valida mimetype e tamanho de uploads (vídeo, PDF, foto).
- `sanitizeBaseUrl()` valida URLs recebidas no corpo para geração de links — aceita apenas `https:` ou `localhost`.
- `normalizeEmail()` faz `.trim().toLowerCase()`.
- `String(value || "")` como padrão de coerção de entrada.

### O que falta

- **Sem schema de validação de corpo** em nenhuma rota (sem zod, joi, yup ou similar). Tipos e campos obrigatórios não são verificados formalmente.
- `PUT /api/collections/:collection` aceita **qualquer JSON** como payload e o grava diretamente (após a lógica de merge). Um manager mal-intencionado ou comprometido pode enviar objetos com campos arbitrários.
- Campos de texto livre (nome do aluno, observações, corpo de mensagem) são armazenados sem sanitização de HTML. Se o front renderizá-los via `innerHTML` sem escape, ocorre XSS.
- `request.body.trainerId` em uploads (`server/routes/uploads.js:89`) é lido do body sem verificar se corresponde ao `req.auth.trainerId` — um manager pode associar uploads a um `trainerId` diferente.

---

## 7. Outros achados

### CORS aberto

```js
// server/app.js:21
cors: { origin: "*", methods: ["GET", "POST"] }   // Socket.IO
app.use(cors())                                    // Express — sem restrição de origin
```

Qualquer site pode fazer requisições autenticadas ao backend se possuir o token do usuário.

### Headers de segurança ausentes

O app usa `app.disable("x-powered-by")` mas não configura:
- `Content-Security-Policy` — risco de XSS
- `X-Frame-Options` — risco de clickjacking
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`

### Socket.IO — autenticação presente

`server/realtime.js:52` — verifica JWT na conexão. Conexões sem token são desconectadas. Correto.

### Audit log

`writeAuditLog` existe e registra ações de leitura/escrita em coleções, mas:
- Só funciona quando Postgres está disponível (falha silenciosamente com JSON).
- Não registra login, logout, tentativas de login falhas ou uso de links de token.

### Token de `student-area-view` não é consumido

`POST /api/auth/student-area-view` **não marca o token como `usedAt`** após uso bem-sucedido. O mesmo link pode ser acessado repetidamente durante 7 dias. O `reset-password` (linhas 882-886) marca corretamente — inconsistência.

### Dados de alunos servidos sem autenticação via `student-area-view`

A rota não exige JWT. Qualquer pessoa que obtenha o link (e-mail, WhatsApp, histórico de navegador) acessa treinos, dietas e progresso do aluno sem precisar de credenciais, durante 7 dias.

---

## 8. Recomendações priorizadas

### CRÍTICO

| # | Recomendação |
|---|---|
| C1 | **Remover o bloco `.demo-credentials` do `index.html`** que expõe publicamente o e-mail e senha do admin. Em produção isso é uma porta aberta. |
| C2 | **Não hardcodar a senha padrão no código** (`"Admin@2026"` em `api.js:517`). Forçar troca obrigatória no primeiro acesso via uma flag no banco/settings. |
| C3 | **Proteger `/uploads/` com autenticação** ou assinar URLs temporárias. PDFs de contrato e fotos de progresso são dados sensíveis e hoje ficam acessíveis por qualquer URL adivinhada. |
| C4 | **Adicionar autenticação à rota `GET /api/videos/:id`**. Vídeos de exercício têm valor comercial e não devem ser públicos. |

### ALTO

| # | Recomendação |
|---|---|
| A1 | **Marcar tokens de `student-area-view` como usados** (`usedAt`) após o primeiro acesso bem-sucedido, como já é feito em `reset-password`. |
| A2 | **Definir `JWT_SECRET` obrigatório via variável de ambiente** e remover os fallbacks hardcoded (`"personal-pro-local-dev-secret"`). Sem esse segredo fixado, reiniciar o servidor invalida todas as sessões ativas. |
| A3 | **Adicionar `helmet`** para configurar CSP, HSTS, X-Frame-Options e demais headers HTTP de segurança em uma única dependência. |
| A4 | **Restringir CORS** para as origens conhecidas do app em produção (não `"*"`). |

### MÉDIO

| # | Recomendação |
|---|---|
| M1 | **Implementar schema de validação de corpo** (ex.: zod) nas rotas críticas: `/auth/login`, `/auth/reset-password`, `PUT /collections/:collection`. |
| M2 | **Garantir que campos de texto livre** (nome, observações, mensagens) sejam sempre renderizados via `textContent`/`escHtml`, nunca via `innerHTML` sem escape. Auditar o `app.js` do front. |
| M3 | **Implementar blocklist de tokens JWT** (ou usar refresh tokens de curta duração) para que o logout server-side seja possível — hoje o logout é puramente client-side. |
| M4 | **Registrar no audit log** tentativas de login (sucesso e falha), logout e uso de links de token. Isso é essencial para rastrear acessos indevidos. |
| M5 | **Validar `request.body.trainerId` nos uploads** contra `req.auth.trainerId` para evitar que um manager associe mídia a outro trainer (relevante para multi-personal). |
| M6 | **Reduzir TTL do link de área do aluno** de 7 dias para 24-48 horas, dado que contém dados sensíveis de saúde. |

### BAIXO

| # | Recomendação |
|---|---|
| B1 | **Eliminar completamente o hash FNV-1a legado** após migração total das senhas para bcrypt. |
| B2 | **Mover o `/api/health`** para rota autenticada ou remover campos sensíveis (`databaseReady`, `storage`, `mailConfigured`) da resposta pública. |
| B3 | **Remover token de contrato** (`contract-token`) da resposta sem consumo; considerar marcar como usado após verificação se o fluxo não exigir múltiplas leituras. |
| B4 | **Para multi-personal (futuro):** todo `trainerId` hoje é a constante `"trainer-demo"`. O isolamento entre trainers precisará ser implementado em todas as queries antes de abrir para múltiplos usuários. |
| B5 | **Configurar `SameSite` e `Secure`** caso o app migre de `Bearer token` para cookies no futuro. |

---

## Resumo executivo

O sistema tem uma base razoável: JWT assinado no servidor, bcrypt nas senhas, rate limiting nas rotas de autenticação, allowlist de coleções e audit log estruturado. O vetor de risco mais imediato é a **exposição pública das credenciais admin no HTML** (C1/C2) combinada com **arquivos de upload acessíveis sem autenticação** (C3/C4). A rota de área do aluno compartilhável também carece de consumo de token (A1). O projeto está bem posicionado para uma fase 2 segura se esses pontos críticos forem endereçados antes de crescer para múltiplos trainers.
