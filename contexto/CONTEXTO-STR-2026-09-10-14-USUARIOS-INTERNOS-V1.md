# CONTEXTO STR — 2026-09-10 — USUÁRIOS INTERNOS V1

## 1. Projeto

- Projeto: STR Software
- Raiz: `C:\Users\cotaw\Projetos\str-software1`
- Branch: `fase-02-area-cliente`
- Último commit conhecido antes desta etapa:
  - `459a68a feat: adiciona CMS de blog e publicacao dinamica`
- Banco: PostgreSQL / Neon
- ORM: Prisma 6.19.1
- Framework: Next.js 16.1.1
- Método de trabalho: Prompt Mestre STR
- Gravações: PowerShell e UTF-8 sem BOM
- Estado desta etapa: implementado localmente e parcialmente validado
- Ainda não foi realizado commit, push ou deploy desta etapa.

## 2. Objetivo da etapa

Criar uma estrutura de usuários internos da STR para permitir o crescimento da equipe, com:

- contas individuais;
- senhas protegidas com bcrypt;
- papéis distintos;
- JWT individual;
- bloqueio e reativação;
- invalidação de sessões;
- gerenciamento por SUPER_ADMIN;
- futura recuperação de senha.

A autenticação dos usuários internos permanece separada da Área do Cliente.

## 3. Papéis criados

Enum Prisma `UsuarioPapel`:

- `SUPER_ADMIN`
- `ADMIN`
- `COMERCIAL`
- `FINANCEIRO`
- `SUPORTE`
- `CONTEUDO`

A distribuição definitiva de permissões por módulo ainda precisa ser concluída.

## 4. Modelos Prisma adicionados

### Usuario

Campos principais:

- `id`
- `nome`
- `email`
- `senhaHash`
- `papel`
- `ativo`
- `sessionVersion`
- `ultimoLoginEm`
- `createdAt`
- `updatedAt`
- relação com tokens de recuperação

### UsuarioPasswordResetToken

Campos:

- `id`
- `usuarioId`
- `tokenHash`
- `expiresAt`
- `usedAt`
- `createdAt`

### UsuarioLoginAttempt

Campos:

- `id`
- `email`
- `sucesso`
- `ip`
- `createdAt`

O rate limit dos usuários internos ficou separado do rate limit dos clientes.

## 5. Migration

Migration criada:

`prisma/migrations/20260910215000_adiciona_usuarios_internos_v1/migration.sql`

Nome:

`20260910215000_adiciona_usuarios_internos_v1`

Resultado:

- migration aplicada no Neon;
- Prisma Client regenerado;
- dez migrations reconhecidas;
- banco informado pelo Prisma como atualizado;
- nenhuma tabela anterior foi removida ou alterada destrutivamente.

## 6. Primeiro SUPER_ADMIN

Primeiro usuário interno criado:

- Nome: Edson Santos
- Papel: `SUPER_ADMIN`
- Ativo: `true`

O e-mail e a senha não devem ser reproduzidos em checkpoints públicos.

A senha foi processada com bcrypt, custo 12.

## 7. Arquivos de autenticação criados

### `lib/auth-usuario-token.ts`

Responsável por:

- criação do JWT individual;
- validação criptográfica do JWT;
- identificação do usuário pelo `sub`;
- inclusão do papel;
- inclusão de `sessionVersion`;
- duração da sessão administrativa;
- validação dos papéis reconhecidos.

O módulo foi mantido sem acesso ao Prisma para poder ser utilizado pelo proxy.

### `lib/auth-usuario.ts`

Responsável por:

- bcrypt;
- consulta do usuário no banco;
- validação de conta ativa;
- comparação de `sessionVersion`;
- comparação do papel atual com o papel do JWT;
- rate limit;
- registro das tentativas de login.

O arquivo foi refatorado para reutilizar `auth-usuario-token.ts`.

## 8. Login administrativo

Arquivos alterados:

- `app/actions/admin-login.ts`
- `app/login/page.tsx`

O login deixou de usar diretamente:

- `ADMIN_USER`
- `ADMIN_PASSWORD`

O novo login utiliza:

- e-mail do usuário interno;
- senha protegida com bcrypt;
- consulta ao Prisma;
- verificação de conta ativa;
- rate limit;
- JWT individual;
- cookie HTTP-only;
- `sameSite: strict`;
- `secure` em produção;
- atualização de `ultimoLoginEm`.

A tela agora mostra:

- `Acesso STR`;
- campo de e-mail;
- campo de senha;
- aviso de credenciais inválidas;
- aviso de bloqueio temporário por excesso de tentativas.

## 9. Proxy e layout administrativo

### `proxy.ts`

Foi adaptado temporariamente para reconhecer:

- JWT administrativo legado;
- JWT individual dos usuários STR.

### `app/admin/layout.tsx`

Agora:

- valida o novo JWT no banco;
- verifica se o usuário continua ativo;
- verifica `sessionVersion`;
- verifica se o papel foi alterado;
- mostra nome e papel do usuário autenticado;
- preserva temporariamente a sessão administrativa antiga.

## 10. Gerenciamento de usuários

APIs criadas:

- `GET /api/admin/usuarios`
- `POST /api/admin/usuarios`
- `PATCH /api/admin/usuarios/[id]`

Arquivos:

- `app/api/admin/usuarios/route.ts`
- `app/api/admin/usuarios/[id]/route.ts`

Proteções implementadas:

- somente `SUPER_ADMIN`;
- validação de nome;
- normalização e validação de e-mail;
- senha entre 12 e 128 caracteres;
- validação do papel;
- prevenção de e-mail duplicado;
- prevenção de autobloqueio;
- prevenção de autorrebaixamento;
- proteção do último `SUPER_ADMIN` ativo;
- incremento de `sessionVersion` ao alterar papel ou bloquear;
- nenhuma senha ou hash é retornado pelas APIs.

Interface planejada/criada em:

- `app/admin/usuarios/page.tsx`
- `app/admin/usuarios/usuarios-admin.tsx`

Funções da interface:

- criar usuário;
- listar usuários;
- editar nome;
- editar e-mail;
- alterar papel;
- bloquear;
- reativar;
- identificar a própria conta;
- mostrar último acesso.

É necessário confirmar no próximo ciclo se esses dois arquivos foram efetivamente criados e testar todo o fluxo visual.

## 11. Navegação administrativa

Arquivos alterados:

- `app/admin/admin-nav.tsx`
- `app/admin/layout.tsx`

Itens adicionados:

- aba `Usuários`, visível para `SUPER_ADMIN`;
- botão `← Voltar ao site`, disponível em toda a área administrativa.

## 12. Compatibilidade das APIs antigas

Problema encontrado:

O novo JWT era aceito pelo proxy e pelo layout, mas as APIs antigas ainda reconheciam somente o JWT legado.

Sintoma observado:

- Blog retornava `Não autorizado`.

Correção aplicada em:

- `lib/auth-admin.ts`

Foi adicionada uma ponte temporária para que as APIs antigas reconheçam também o JWT individual.

Pendência de segurança:

- substituir gradualmente a autenticação genérica das APIs por autorização baseada no usuário consultado no banco;
- aplicar permissões específicas por papel;
- garantir que bloqueio e mudança de papel sejam verificados diretamente em todas as APIs;
- remover a ponte legada após a migração completa.

## 13. Correção do pool de conexões

Problema encontrado em:

- `app/admin/leads/page.tsx`

A página executava seis consultas simultâneas com `Promise.all`, enquanto o pool informado possuía limite de cinco conexões.

Erro:

- Prisma `P2024`;
- timeout de conexão;
- conexões reiniciadas pelo host remoto.

Correção:

- cinco consultas `count` foram substituídas por um único `groupBy`;
- a listagem passou a ser executada sequencialmente;
- o fluxo foi reduzido para duas consultas sequenciais;
- TypeScript aprovado.

## 14. Validações concluídas

Foram aprovados durante a etapa:

- `npx prisma validate`;
- `npx prisma migrate deploy`;
- `npx prisma generate`;
- `npx prisma migrate status`;
- múltiplas execuções de `npx tsc --noEmit --pretty false`;
- novo login administrativo local;
- carregamento do painel;
- correção da autorização do Blog;
- correção estrutural da página de leads.

## 15. Credenciais legadas

Durante um diagnóstico, arquivos `.env` foram incluídos indevidamente na busca e valores administrativos legados apareceram na saída.

Não registrar esses valores neste checkpoint.

Pendências:

- remover `ADMIN_USER` e `ADMIN_PASSWORD` do código;
- remover as credenciais legadas dos ambientes local e produção;
- confirmar a rotação de qualquer valor exposto;
- manter `ADMIN_SESSION_SECRET`;
- nunca pesquisar ou imprimir arquivos `.env` integralmente.

## 16. Alterações anteriores preservadas

A árvore de trabalho já possuía alterações e arquivos não rastreados antes desta etapa, principalmente relacionados a:

- integração dinâmica do Blog;
- backups;
- auditoria;
- contextos técnicos;
- scripts auxiliares.

Essas alterações pertencem ao trabalho anterior e não devem ser removidas, sobrescritas ou incluídas indiscriminadamente.

Não utilizar `git add .`.

## 17. Próxima etapa

Prioridade definida por Edson:

### Recuperação de senha dos usuários internos

Implementar:

1. link `Esqueci minha senha` em `/login`;
2. página administrativa de solicitação;
3. API de solicitação;
4. resposta genérica contra enumeração de e-mails;
5. rate limit;
6. token aleatório criptográfico;
7. persistência somente do hash SHA-256;
8. expiração em 30 minutos;
9. invalidação dos tokens anteriores;
10. envio pelo Resend;
11. página de redefinição;
12. API de redefinição;
13. senha com bcrypt;
14. consumo atômico e uso único do token;
15. incremento de `sessionVersion`;
16. encerramento das sessões anteriores;
17. testes de token válido, expirado, reutilizado e inválido.

Depois:

- criar botão de logout administrativo;
- concluir permissões específicas por papel;
- proteger todas as APIs com consulta ao banco;
- remover autenticação legada;
- remover `ADMIN_USER` e `ADMIN_PASSWORD`;
- executar build completo;
- realizar testes locais;
- preparar commit seletivo;
- push;
- deploy;
- testes E2E em produção.

## 18. Ponto exato da parada

O sistema possui estrutura de usuários internos, primeiro `SUPER_ADMIN`, novo login individual, gerenciamento de usuários e navegação administrativa.

A próxima implementação deve começar pela recuperação de senha dos usuários internos, reutilizando o padrão seguro já validado na Área do Cliente, sem misturar `UsuarioPasswordResetToken` com `PasswordResetToken` dos clientes.