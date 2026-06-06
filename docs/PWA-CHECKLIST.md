# Checklist PWA

- Manifest configurado em `manifest.json`.
- `display` definido como `standalone`.
- `start_url` e `scope` definidos como `./`.
- Ícones 192x192, 512x512, maskable 512x512 e Apple touch icon incluídos.
- Cor principal e cor de fundo configuradas.
- Service worker com cache de app shell e fallback offline.
- Botão **Baixar app** na tela de login.
- Botão **Baixar app** nos painéis do aluno e gestor.
- Prompt nativo acionado via evento `beforeinstallprompt` quando suportado.
- Modal profissional de instruções quando o prompt nativo não está disponível.
- Detecção de app instalado por `display-mode: standalone`, `navigator.standalone` e evento `appinstalled`.
- Botões de instalação ocultos quando o app já está instalado ou aberto em standalone.
- Meta tags para comportamento de app em iOS.
- Estrutura pronta para hospedagem HTTPS.

## Validação em produção

1. Publicar em domínio HTTPS.
2. Abrir no Chrome para Android ou Chrome desktop.
3. Confirmar que o service worker está ativo.
4. Confirmar que o manifest está válido.
5. Confirmar que o botão **Baixar app** abre o prompt nativo.
6. Instalar o app.
7. Abrir pelo ícone instalado e validar ausência da barra de endereço.
8. Testar carregamento inicial sem conexão após a primeira visita.
