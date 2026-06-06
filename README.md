# Personal Pro App

PWA responsivo e instalável para personal trainer, com tela de login, área do aluno, painel do gestor, manifest, service worker, ícones, splash inicial e fluxo profissional de "Baixar app".

Versão v8: reorganização visual inspirada no padrão operacional do app Realize, com dashboard mais limpo, menu agrupado, linhas compactas, perfil do aluno em abas e dados de teste ocultos fora do modo demo.

## URL publicada

https://nunera101.github.io/personal-pro-pwa/

## Fluxos disponíveis

- Admin entra com a credencial demo.
- Admin cria, edita, remove e abre alunos.
- Admin cria atividades na agenda, visualiza por dia ou semana, edita/remarca, conclui e remove.
- Admin cria exercícios com vídeo na Biblioteca de Exercícios.
- Admin faz upload de vídeo do exercício; com backend ativo o arquivo vai para `/uploads/exercises/`, e no GitHub Pages fica como vídeo local de teste no aparelho.
- Admin cria treinos estruturados a partir da biblioteca e vincula a um aluno.
- Admin acompanha atualizações quinzenais, histórico e performance.
- Admin configura mensagem padrão de WhatsApp e abre conversa pré-preenchida para atividades da agenda.
- Admin cria contratos para aceite digital interno do aluno.
- Admin conversa com alunos pelo chat interno; em backend Node/Socket.IO o envio é em tempo real.
- Aluno entra com o login criado pelo gestor.
- Aluno visualiza agenda, treinos, atualizações, evolução e perfil.
- Aluno executa treinos série por série, registra carga/repetições, usa descanso automático e gera volume load.
- Aluno visualiza e assina contratos, além de enviar mensagens ao personal.

## Como testar

O PWA precisa rodar em `https://` ou em `localhost` para habilitar service worker e instalação. Em produção, hospede esta pasta em um domínio HTTPS.

Credencial demo do admin. Para exibir o card de preenchimento automático, abra com `?demo=1`:

- E-mail: `admin@personalpro.app`
- Senha: `Admin@2026`

No painel do gestor, use **Novo aluno** para cadastrar um aluno fictício. O login criado fica salvo no navegador via `localStorage`, apenas para teste desta primeira versão.

Opções de servidor local:

```powershell
npm start
```

Com `npm install`, o servidor Node habilita API, upload em `/uploads/exercises/` e Socket.IO para chat em tempo real.
Sem dependências instaladas ou em GitHub Pages, o app continua funcionando em modo local com `localStorage` e fallback de vídeo no navegador.

Depois, abra o endereço no Chrome e use o botão **Baixar app**.

## Logo oficial

O arquivo atual `assets/logo-oficial.svg` é um placeholder técnico. Quando a imagem oficial for enviada, substitua esse arquivo preservando o nome ou atualize as referências em:

- `index.html`
- `manifest.json`
- `sw.js`

Depois gere novamente os ícones:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\scripts\gerar-icones.ps1
```

Se a logo oficial vier em PNG/JPG, o ideal é adaptar o script ou gerar manualmente estes arquivos finais:

- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/icon-maskable-512.png`
- `assets/apple-touch-icon.png`
- `assets/favicon.svg` ou favicon equivalente

## PWA

Arquivos principais:

- `manifest.json`: nome do app, nome curto, start URL, scope, display standalone, cores e ícones.
- `sw.js`: cache do app shell e fallback offline.
- `app.js`: prompt nativo de instalação, detecção de standalone, instruções alternativas, navegação, treinos executáveis, WhatsApp, contratos, chat e fallback local.
- `styles.css`: visual mobile-first com cabeçalho de app, botões grandes, cards e navegação inferior.
- `server.js`: backend Node/Express/Socket.IO para Hostinger, com upload de vídeo e persistência JSON inicial.

## Deploy

Este projeto é estático. Pode ser publicado em GitHub Pages, Vercel, Netlify, Cloudflare Pages ou outro provedor que entregue HTTPS.

Configurações incluídas:

- `package.json` e `server.js` para rodar o backend Node em ambiente novo e separado.
- `vercel.json` para headers de cache do service worker e manifest.
- `netlify.toml` para headers equivalentes.

O backend Node incluído é a base para Hostinger. Enquanto o app estiver no GitHub Pages, dados e vídeos de teste ficam no navegador local.
