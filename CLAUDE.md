# Personal Pro — PWA para Personal Trainer

## Visão geral

Aplicativo PWA voltado para personal trainers. Permite gerenciar alunos, treinos e acompanhamento de desempenho.

## Stack

- **Frontend:** HTML + CSS + JavaScript vanilla
- **Backend:** Node.js + Express + PostgreSQL + Socket.IO
- **Infra/Deploy:** Railway (variáveis de ambiente gerenciadas lá)

## Estrutura de pastas

```
/
├── server/          # Todo o backend (Node.js + Express)
├── public/          # Arquivos estáticos do frontend (ou raiz do PWA)
├── CLAUDE.md
└── ...
```

A estrutura de pastas deve ser mantida. Não criar novas pastas sem necessidade clara.

## Regras obrigatórias

### Edição de código

- **Nunca editar `app.js` inteiro.** Sempre trabalhar em funções isoladas — edite apenas o trecho relevante.
- **Nunca editar `styles.css` inteiro.** Sempre edite por seção (ex: apenas o bloco de cards, apenas o header). Use comentários de seção como referência.

### Commits — REGRA INEGOCIÁVEL

Ao final de **cada tarefa concluída**, sem exceção, executar obrigatoriamente:

```bash
git add .
git commit -m "mensagem descritiva da tarefa"
git push origin main
```

- Isso é inegociável e deve acontecer em toda tarefa, sem pular etapas.
- Commits devem ser **pequenos e descritivos**.
- Um commit por mudança lógica. Não agrupar alterações não relacionadas.
- Exemplos de mensagem: `fix: corrige cálculo de carga no treino`, `feat: adiciona modal de novo aluno`.

### Backend

- Todo código de servidor fica dentro de `server/`.
- Variáveis de ambiente (banco de dados, segredos, portas) estão configuradas no Railway — não hardcodar valores sensíveis no código.

### Geral

- Não introduzir dependências novas sem consultar o usuário.
- Manter compatibilidade com a stack vanilla — não adicionar frameworks de frontend (React, Vue, etc.).
