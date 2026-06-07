# Web Push — Configuração

## Variáveis de ambiente necessárias

Configure no Railway (ou no seu `.env` local para desenvolvimento):

| Variável | Descrição |
|---|---|
| `VAPID_PUBLIC_KEY` | Chave pública VAPID (base64url, começa com `BN…` ou similar) |
| `VAPID_PRIVATE_KEY` | Chave privada VAPID (base64url, **nunca expor publicamente**) |
| `VAPID_SUBJECT` | Identificador do remetente — use `mailto:seu@email.com` ou a URL do app |

## Como gerar as chaves VAPID

Execute uma única vez localmente:

```bash
node -e "const wp = require('web-push'); const keys = wp.generateVAPIDKeys(); console.log(keys);"
```

A saída será algo como:

```json
{
  "publicKey": "BN...",
  "privateKey": "xyz..."
}
```

Copie os valores para as variáveis de ambiente no Railway. **Nunca commite as chaves no repositório.**

## Variável VAPID_SUBJECT

Use seu e-mail:

```
VAPID_SUBJECT=mailto:cerqueiragnsla@gmail.com
```

## Exemplo de `.env` local (não commitar)

```
VAPID_PUBLIC_KEY=BN...sua_chave_publica...
VAPID_PRIVATE_KEY=xyz...sua_chave_privada...
VAPID_SUBJECT=mailto:cerqueiragnsla@gmail.com
```

## O que acontece sem as variáveis

- O servidor sobe normalmente — push fica silenciosamente desativado.
- O endpoint `GET /api/push/vapid-public-key` retorna 503.
- O cliente detecta isso e não pede permissão de notificação.
- Nenhum erro é lançado — o app funciona normalmente.

## Fluxo de notificações implementado

| Evento | Quem recebe |
|---|---|
| Gestor publica treino | Aluno destinatário |
| Gestor cria atividade na agenda | Aluno destinatário |
| Gestor envia mensagem | Aluno destinatário |
| Aluno envia mensagem | Gestor |
| Aluno envia atualização de progresso | Gestor |
