# STR Software Academy — CMS-07G / CMS-07H

**Data:** 26/09/2026
**Branch:** `fase-02-area-cliente`
**Projeto:** STR Software Academy
**Status:** auditoria estática aprovada; testes funcionais documentados conforme execução.

## 1. Objetivo

Instrumentar as APIs de matrícula e progresso, preservar os contratos HTTP e tratar solicitações repetidas e concorrência de criação de registros.

## 2. Implementações

### API de matrículas

Arquivo: `app/api/academy/matriculas/route.ts`

- Tratamento de concorrência Prisma P2002.
- Consulta do registro existente após conflito de criação.
- Reativação condicionada ao status CANCELADA.
- Preservação da resposta `{ ok: true, matricula }`.
- Cinco pontos de log: três INFO, um WARN e um ERROR.

### API de progresso

Arquivo: `app/api/academy/progresso/route.ts`

- Tratamento de concorrência Prisma P2002.
- Atualização condicional de conclusão.
- Preservação de `concluidaEm` quando a aula já está concluída.
- Preservação da resposta `{ ok: true, progresso }`.
- Cinco pontos de log: três INFO, um WARN e um ERROR.

## 3. Validações aprovadas

| Verificação | Resultado |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Aprovado |
| `git diff --check` | Aprovado |
| Contrato HTTP de matrículas | Identificado |
| Contrato HTTP de progresso | Identificado |
| Instrumentação de matrículas | 5 logs |
| Instrumentação de progresso | 5 logs |
| Interface local da Academy | Funcionando |
| Área do aluno | Funcionando |
| Página da trilha | Funcionando |
| Matrícula repetida via API | Aprovada |
| Persistência da matrícula repetida via Prisma | Aprovada |

### Evidências do teste de matrícula repetida

- HTTP: 200.
- Resposta `ok`: true.
- Identificador original preservado: true.
- Status: ATIVA.
- Erro retornado: nenhum.
- Consulta Prisma posterior: exatamente um registro para o mesmo aluno e a mesma trilha.
- Resultado: idempotência da matrícula repetida comprovada no cenário executado.

## 4. Baseline de progresso registrado

A consulta Prisma identificou:

- Aula "Introdução à Lógica de Programação": concluída.
- Registro de conclusão existente.
- `concluidaEm`: `2026-09-23T22:51:58.474Z`.
- Aula "Da lógica para o código": sem registro de progresso na consulta realizada.

A repetição da chamada HTTP de conclusão foi preparada, mas não executada nesta sequência. Portanto, não está registrada como teste funcional aprovado.

Os cenários de concorrência simultânea e reativação de matrícula cancelada também não foram executados funcionalmente nesta sequência.

## 5. Recuperação e integridade

Uma tentativa anterior de substituição textual corrompeu a API de matrículas. O arquivo foi restaurado a partir do backup original, com integridade SHA-256 confirmada e TypeScript aprovado.

A implementação corrigida CMS-07G.7 foi aplicada posteriormente, com backup e mecanismo de rollback. A validação TypeScript e `git diff --check` foram aprovadas.

## 6. Política de continuidade

Não repetir testes aprovados sem uma mudança posterior que afete diretamente o comportamento validado, uma falha concreta ou necessidade específica de validação do release.

Distinguir sempre:
- Teste executado e aprovado.
- Verificação estática aprovada.
- Teste preparado, mas não executado.
- Cenário ainda não validado.

Não executar operações destrutivas, migrations, commit, push ou deploy sem delimitação do escopo e checkpoints.

## 7. Escopo do release

Inclui alterações da Academy nas áreas de aluno, administração de aulas, componentes de matrícula/conteúdo/conclusão, páginas de exploração e trilhas, APIs de matrícula e progresso e esta documentação.

Exclui backups locais, arquivos temporários, diagnósticos SQL e alterações não relacionadas à Academy.

## 8. Situação do release

Documentação consolidada. Commit, push e deploy ainda dependem da preparação do índice Git e do build de produção.