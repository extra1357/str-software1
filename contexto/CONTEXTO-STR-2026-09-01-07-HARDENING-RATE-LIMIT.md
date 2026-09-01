# CONTEXTO STR — CHECKPOINT 07

Data: 2026-09-01  
Projeto: STR Software — Área do Cliente  
Fase: 02 — Área do Cliente + Backoffice  
Estado: Sprint 1 preservado; hardening de criação de solicitações validado localmente

---

## 1. ORDEM OBRIGATÓRIA DE LEITURA

Para retomar o desenvolvimento:

1. Prompt Mestre — Método STR de Desenvolvimento
2. `docs/FASE-02-AREA-DO-CLIENTE.md`
3. Este checkpoint

Este documento registra ONDE a execução parou.

---

## 2. REPOSITÓRIO

Raiz local:

`C:\Users\cotaw\Projetos\str-software1`

Repositório remoto:

`https://github.com/extra1357/str-software1.git`

Commit do Sprint 1:

`101ccf6 feat: adiciona solicitacoes e conversa bidirecional na area do cliente`

Branch de preservação:

`fase-02-area-cliente`

O commit `101ccf6` foi enviado para:

`origin/fase-02-area-cliente`

`origin/main` permaneceu em `e0afd89`.

Não fazer push para `origin/main` sem decisão explícita sobre publicação.

---

## 3. SPRINT 1 CONCLUÍDO LOCALMENTE

Foi implementado e validado:

- abertura de solicitações pelo cliente;
- protocolo único;
- tipo;
- prioridade;
- status;
- acompanhamento pela Área do Cliente;
- visualização no Backoffice;
- alteração de status pelo Backoffice;
- conversa bidirecional Cliente ↔ STR;
- persistência cronológica das mensagens;
- bloqueio de resposta em ticket encerrado;
- isolamento das solicitações pelo cliente autenticado;
- autenticação das ações administrativas existentes.

Fluxo E2E local validado:

Cliente
→ API
→ PostgreSQL
→ Backoffice
→ ação administrativa autenticada
→ PostgreSQL
→ Área do Cliente.

Conversa bidirecional também validada localmente.

---

## 4. MIGRAÇÕES DA FASE 02

Aplicadas SOMENTE no banco local:

`20260830223714_evolui_ticket_solicitacoes`

`20260831023745_adiciona_ticket_mensagens`

Produção ainda NÃO recebeu essas migrações.

---

## 5. HARDENING — AUTENTICAÇÃO DO CLIENTE

Durante a revisão foi inicialmente levantada a hipótese de que cliente inativo pudesse continuar utilizando `/api/cliente/solicitacoes`.

A inspeção de `lib/auth-cliente.ts` comprovou que isso já está protegido.

`verificarSessionToken()`:

- valida o JWT;
- obtém o cliente no banco;
- exige `ativo = true`;
- compara `sessionVersion`;
- rejeita sessão inválida ou revogada.

Portanto, NÃO foi adicionada uma segunda implementação para esse problema.

CONFIRMACAO-STR conhecida de `lib/auth-cliente.ts`:

`D438300FB01A`

---

## 6. HARDENING — RATE LIMIT DE NOVAS SOLICITAÇÕES

Decisão aprovada:

Máximo de:

`10 novas solicitações`

por:

`15 minutos`

por cliente autenticado.

O limite aplica-se somente à criação de novos protocolos.

Não limita mensagens dentro de solicitações existentes.

---

## 7. ARQUITETURA DO RATE LIMIT

Não foi criada nova tabela.

Não foi criada nova migration.

O próprio PostgreSQL é utilizado como fonte persistente.

Antes de criar uma solicitação, a API conta tickets do cliente autenticado com:

`createdAt >= agora - 15 minutos`

Se a quantidade for maior ou igual a 10:

- a criação é recusada;
- HTTP `429` é retornado;
- `console.warn` registra o bloqueio.

Em falha na consulta do rate limit:

- a criação não prossegue;
- HTTP `500` é retornado;
- `console.error` registra a falha.

Essa estratégia funciona entre diferentes instâncias da aplicação porque a contagem está no banco, não em memória local do processo.

Observação técnica:

É um limite prático baseado em count-before-create. Não constitui garantia transacional absoluta contra múltiplas requisições perfeitamente concorrentes.

---

## 8. ARQUIVO ALTERADO

`app/api/cliente/solicitacoes/route.ts`

CONFIRMACAO-STR anterior:

`83AE0967C1D9`

CONFIRMACAO-STR atual:

`EB9D23551EFA`

Configuração definitiva:

`RATE_LIMIT_SOLICITACOES_MINUTOS = 15`

`RATE_LIMIT_SOLICITACOES_MAX = 10`

UTF-8 sem BOM confirmado.

---

## 9. BUILD

Build de produção local executado com:

`npm run build`

Resultado:

- compilação: OK;
- TypeScript: OK;
- coleta de dados: OK;
- geração das páginas: OK;
- otimização final: OK.

Build aprovado.

Avisos não bloqueantes conhecidos:

1. convenção `middleware` depreciada pelo Next.js em favor de `proxy`;
2. base `caniuse-lite` desatualizada.

Esses itens permanecem como dívida técnica e não fazem parte deste hardening.

---

## 10. TESTE FUNCIONAL HTTP 429

Para testar sem criar 10 protocolos, foi realizado teste controlado exclusivamente local.

Procedimento:

1. limite temporariamente alterado de 10 para 1;
2. backup byte a byte criado;
3. hash original confirmado;
4. autenticação realizada pela API;
5. primeira solicitação enviada;
6. primeira chamada retornou HTTP 201;
7. segunda solicitação imediata foi enviada;
8. segunda chamada retornou HTTP 429;
9. teste declarado aprovado;
10. arquivo original restaurado pelo backup;
11. limite definitivo 10 restaurado;
12. hash original do hardening confirmado novamente.

Hash durante teste temporário:

`47F5EA51A1D1`

Hash definitivo restaurado:

`EB9D23551EFA`

Resultado funcional:

`201 → 429`

APROVADO.

---

## 11. LIMPEZA DO TESTE

O teste criou exatamente um ticket temporário:

ID:

`cmtjabfn10003ugrscbhqftza`

Protocolo:

`STR-2026-832C96D3`

Título:

`STR TESTE RATE LIMIT 429`

Cliente:

`teste@strsoftware.com.br`

Mensagens:

`0`

Antes da exclusão foi realizada consulta somente leitura e validação campo a campo.

O ticket foi então removido pelo ID exato.

Validação pós-exclusão:

OK.

Nenhum dado temporário do teste permaneceu.

---

## 12. INCIDENTE DO SCRIPT DE LIMPEZA

Uma primeira tentativa de exclusão foi bloqueada pela proteção STR porque o protocolo havia sido digitado incorretamente no script:

incorreto:

`STR-2026-832C96D`

correto:

`STR-2026-832C96D3`

Nenhum registro foi excluído nessa tentativa.

Foi executado diagnóstico somente leitura, todos os campos foram confirmados e somente depois ocorreu a exclusão correta.

A proteção funcionou como planejado.

---

## 13. ESTADO DO BANCO

Banco local:

- migrations da Fase 02 aplicadas;
- ticket temporário do teste removido.

Schema:

- não foi alterado pelo hardening de rate limit.

Banco de produção:

- NÃO alterado por este hardening;
- migrations da Fase 02 ainda não publicadas.

---

## 14. PRODUÇÃO

Nenhuma publicação da Fase 02 foi realizada.

Nenhum `git push origin main` foi realizado durante este hardening.

Nenhuma migration da Fase 02 foi aplicada em produção.

O incidente anterior envolvendo a senha administrativa de produção foi encerrado sem alteração da senha: a credencial existente foi localizada e funcionou.

Não alterar credenciais de produção por causa daquele incidente.

---

## 15. SEGURANÇA ADMINISTRATIVA PENDENTE

A autenticação administrativa existente ainda utiliza o mecanismo simplificado baseado no cookie:

`admin-auth=true`

Esse mecanismo é dívida técnica conhecida.

Não foi alterado neste hardening para evitar expansão indevida de escopo.

Deve ser tratado em etapa específica antes da publicação definitiva da expansão administrativa, conforme decisão de segurança.

---

## 16. ARQUIVOS NÃO RASTREADOS QUE NÃO DEVEM ENTRAR AUTOMATICAMENTE EM COMMIT

Preservar fora de staging automático:

`contexto/recupera senha.txt`

`prisma/STR-ticket-mensagem-diff-preview.sql`

Não usar:

`git add .`

Usar staging seletivo.

---

## 17. ESTADO DO HARDENING

Rate limit:

APROVADO estruturalmente.

Build:

APROVADO.

Teste funcional real:

APROVADO.

HTTP esperado:

`201 → 429`

Limite definitivo:

`10 / 15 minutos`

Arquivo definitivo:

`app/api/cliente/solicitacoes/route.ts`

CONFIRMACAO-STR:

`EB9D23551EFA`

---

## 18. PRÓXIMO PASSO LITERAL

1. validar este Checkpoint 07;
2. fazer staging seletivo SOMENTE de:
   - `app/api/cliente/solicitacoes/route.ts`
   - este Checkpoint 07;
3. revisar `git diff --cached`;
4. criar commit específico do hardening na branch `fase-02-area-cliente`;
5. preservar `origin/main`;
6. depois decidir o próximo hardening da Fase 02, incluindo a dívida de autenticação administrativa antes de produção.

Não publicar a Fase 02 em produção automaticamente.