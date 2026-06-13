# Campo `professionalId` — Adição Não-Destrutiva

**Data:** 2026-06-13  
**Status:** Implementado, inativo (sem filtro)

## O que foi feito

Adicionado o campo `professionalId` em todas as funções de normalização de objetos do `app.js`.  
O campo usa o padrão `objeto.professionalId || TRAINER_ID`, onde `TRAINER_ID = "trainer-demo"`.

- Objetos **novos** recebem `professionalId: "trainer-demo"` automaticamente.
- Objetos **existentes** no localStorage/DB recebem o valor na próxima leitura/escrita (a normalização é aplicada sempre que o objeto passa pela função).
- **Nenhum filtro foi adicionado.** O app continua mostrando tudo, comportamento idêntico ao anterior.

## Objetos que passaram a ter `professionalId`

| Coleção | Função de normalização | Arquivo:linha |
|---|---|---|
| Alunos | `normalizeStudent()` | `app.js:717` |
| Biblioteca (exercícios) | `normalizeExercise()` | `app.js:926` |
| Treinos + Padrões | `normalizeWorkout()` | `app.js:954` |
| Agenda (atividades) | `normalizeActivity()` | `app.js:990` |
| Sessões de treino | `normalizeSession()` | `app.js:1012` |
| Atualizações (check-in) | `normalizeUpdate()` | `app.js:1027` |
| Contratos | `normalizeContract()` | `app.js:1049` |
| Mensagens | `normalizeMessage()` | `app.js:1084` |
| Financeiro (pagamentos) | `normalizePayment()` | `app.js:1097` |
| Dieta (planos) | `normalizeDietPlan()` | `app.js:1142` |

**Total: 10 coleções.**  
Padrões não têm função própria — reutilizam `normalizeWorkout()` com `studentId: ""`.

## O que NÃO mudou

- Nenhuma query foi alterada — todas as leituras continuam retornando todos os registros.
- Nenhum filtro por `professionalId` foi adicionado.
- `trainerId` foi mantido intacto em todos os objetos (campo legado, coexiste com `professionalId`).
- `normalizeSettings()`, `normalizeContractModel()`, `normalizeDietMeal()`, `normalizeFoodItem()`, `normalizeWorkoutExercise()` **não receberam** o campo — são sub-objetos ou configurações únicas, não coleções por profissional.

## Próximos passos (decidir junto)

1. **Fase 2 — Camada de escopo centralizada:** refatorar leituras para passar por `getDataScope()` que hoje retorna tudo, mas centraliza o ponto de filtragem.
2. **Fase 3 — Ativar filtro:** trocar `getDataScope()` para filtrar por `professionalId` do usuário logado.
3. **Fase 4 — Migração de dados legados:** registros mais antigos (que nunca passaram pela normalização pós-deploy) podem não ter o campo; um script de migração pode preencher `professionalId = TRAINER_ID` em massa.

## Referências

- `RELATORIO-MULTI-PERSONAL.md` — plano de fases completo
- `RELATORIO-ADMIN.md` — estrutura de dados do admin e vínculo com profissionais
