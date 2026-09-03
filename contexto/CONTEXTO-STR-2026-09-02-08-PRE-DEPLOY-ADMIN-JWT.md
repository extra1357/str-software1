# CONTEXTO STR 08 — PRÉ-DEPLOY ADMIN JWT

Data: 2026-09-02
Projeto: STR Software
Branch: fase-02-area-cliente
HEAD anterior ao hardening: 6cf9f4b

## Estado

Hardening administrativo concluído e validado localmente.

Produção ainda NÃO foi alterada.

## Arquitetura administrativa

Defesa em profundidade:

1. proxy.ts — barreira de perímetro.
2. app/admin/layout.tsx — autenticação da árvore administrativa.
3. APIs e Server Actions — autenticação próxima às operações e aos dados.

A autenticação administrativa antiga baseada em cookie booleano foi substituída por JWT assinado.

## Sessão administrativa

lib/auth-admin.ts
CONFIRMACAO-STR: E3FC9F77DA62

A sessão utiliza JWT HS256 com subject admin, role ADMIN e expiração.

ADMIN_SESSION_SECRET é obrigatório e deve possuir tamanho mínimo definido pela implementação.

Cookie administrativo configurado como HttpOnly, SameSite Strict e Secure em produção.

## Arquivos do hardening

app/actions/admin-login.ts
CONFIRMACAO-STR: 1DADB54F2364

app/actions/update-lead-status.ts
CONFIRMACAO-STR: 72055B001B4B

app/actions/responder-ticket.ts
CONFIRMACAO-STR: 500B2352C498

app/actions/update-ticket-status.ts
CONFIRMACAO-STR: 6E4162777681

app/admin/export/route.ts
CONFIRMACAO-STR: B9A15C90CDF3

proxy.ts
CONFIRMACAO-STR: 7AD700F79934

app/admin/layout.tsx
CONFIRMACAO-STR: C247C7EAA76A

middleware.ts foi removido e substituído por proxy.ts.

components/AdminAccess.tsx foi removido após duas auditorias confirmarem que não possuía consumidor.

## Testes locais aprovados

- cookie legado admin-auth=true rejeitado;
- JWT adulterado rejeitado;
- API administrativa sem autenticação retornando 401;
- login JWT legítimo funcionando;
- /admin funcionando com sessão legítima;
- /api/admin/clientes funcionando com sessão legítima;
- /admin/export funcionando;
- operações administrativas funcionando;
- E2E local final confirmado pelo usuário.

## Build

Next.js 16.1.1
Prisma Client 6.19.1

Build de produção local aprovado.

TypeScript aprovado.
40/40 páginas estáticas geradas.

Débitos não bloqueantes:

- múltiplos package-lock.json;
- caniuse-lite desatualizado.

## Fase 02

Já presentes na branch:

- solicitações de clientes;
- protocolos;
- tipos e prioridades;
- status;
- backoffice;
- conversa bidirecional;
- rate limit de novas solicitações.

Migrations:

20260830223714_evolui_ticket_solicitacoes
CONFIRMACAO-STR: FD51E95BF692

20260831023745_adiciona_ticket_mensagens
CONFIRMACAO-STR: BB29D157C221

As migrations foram aplicadas e testadas localmente.

Ainda NÃO foram aplicadas ao banco de produção.

## Antes do deploy

Obrigatório:

1. commit seletivo do hardening;
2. push da branch;
3. configurar ADMIN_SESSION_SECRET de produção sem expor o valor;
4. rotacionar de forma controlada a credencial administrativa de produção anteriormente exposta;
5. aplicar migrations no banco de produção;
6. realizar deploy;
7. executar E2E em produção;
8. criar checkpoint pós-deploy.

## Exclusões

NÃO adicionar ao commit:

contexto/recupera senha.txt
prisma/STR-ticket-mensagem-diff-preview.sql
.env*

Não utilizar git add .

## Próximo passo literal

Realizar staging seletivo dos arquivos aprovados e deste checkpoint.

Revisar git diff --cached antes do commit.

Produção permanece inalterada neste checkpoint.
