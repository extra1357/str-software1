# CONTEXTO STR SOFTWARE - CHECKPOINT 2026-08-29

## Projeto
STR Software

## Raiz local
C:\Users\cotaw\Projetos\str-software1

## Método obrigatório
Este contexto deve ser utilizado em conjunto com o Prompt Mestre - Método STR de Desenvolvimento v1.1.

## Stack confirmada
- Next.js 15.0.3
- React 18.3.1
- TypeScript
- Prisma
- PostgreSQL / Neon
- bcryptjs
- JWT
- Stripe
- Resend
- Prisma Client 6.19.1

## Objetivo atual
Concluir a Área do Cliente, principalmente:
1. recuperação de senha;
2. redefinição segura de senha;
3. invalidação das sessões antigas;
4. posteriormente permitir alteração de senha pelo cliente autenticado.

## Trabalho realizado nesta sessão

### Área do Cliente
Login funcional confirmado pelo desenvolvedor.

Dashboard funcional confirmado com cliente de teste e exibição das faturas.

Fluxo Stripe já havia sido testado anteriormente e está funcionando.

### PasswordResetToken
Foi adicionado ao Prisma o modelo PasswordResetToken com:
- id
- clienteId
- tokenHash único
- expiresAt
- usedAt
- createdAt
- relação com Cliente
- índices clienteId e expiresAt

Migration aplicada:
20260829214122_add_cliente_password_reset

Banco confirmado atualizado.

### Invalidação de sessões
Foi adicionado:

Cliente.sessionVersion Int @default(0)

Migration aplicada:
20260829215204_add_cliente_session_version

O JWT da Área do Cliente passou a carregar:
- clienteId
- sessionVersion

A validação da sessão consulta o cliente no banco e rejeita JWT cuja sessionVersion seja diferente da versão atual.

Teste real realizado:
- cliente estava autenticado;
- sessionVersion foi incrementado no banco;
- atualização do dashboard invalidou a sessão;
- usuário foi redirecionado para /cliente/login.

Portanto, a invalidação de sessões antigas foi comprovada funcionalmente.

### TypeScript
Após atualização dos consumidores assíncronos de verificarSessionToken:

npx tsc --noEmit

foi executado sem erros.

## Link público da Área do Cliente

Foi adicionada a opção:

Área do Cliente -> /cliente/login

nos dois rodapés:
- app/page.tsx
- components/SiteFooter.tsx

O git diff confirmou somente essa alteração funcional nos dois arquivos.

Teste visual/click no navegador ainda precisa ser confirmado pelo desenvolvedor.

## Incidente de encoding

Durante uma edição anterior dos dois rodapés foi utilizado Get-Content -Raw sem codificação UTF-8 explícita.

Isso provocou mojibake nos arquivos:
- app/page.tsx
- components/SiteFooter.tsx

Exemplos observados:
- São -> SÃ£o
- Serviços -> ServiÃ§os
- © -> Â©
- → -> â†’

Os dois arquivos foram recuperados utilizando o HEAD íntegro do Git.

Validações realizadas após restauração:
- nenhum marcador comum de mojibake encontrado;
- git diff vazio antes de reaplicar o link;
- git diff --ignore-space-at-eol retornou exit code 0.

Depois disso o link Área do Cliente foi reaplicado nos dois arquivos.

Regra operacional daqui para frente:
NÃO utilizar Get-Content sem -Encoding UTF8 para operações que posteriormente gravem arquivos.

Preferir:
[System.IO.File]::ReadAllText(..., [System.Text.Encoding]::UTF8)

e gravar com:
New-Object System.Text.UTF8Encoding($false)

## Backups temporários do incidente

Existem:
app/page.tsx.mojibake-backup
components/SiteFooter.tsx.mojibake-backup

Não adicionar esses arquivos ao Git.

## Arquivos modificados relevantes antes deste checkpoint

- app/api/cliente/auth/login/route.ts
- app/api/cliente/faturas/[id]/checkout/route.ts
- app/cliente/dashboard/page.tsx
- app/page.tsx
- components/SiteFooter.tsx
- lib/auth-cliente.ts
- prisma/schema.prisma

Também existem migrations novas do password reset e sessionVersion.

next-env.d.ts apareceu modificado pelo Next.js e não deve ser editado manualmente.

tsconfig.tsbuildinfo é artefato gerado.

prisma/schema.prisma.backup-password-reset é backup operacional e não deve ser commitado.

contexto/segredos.txt NÃO deve ser lido, exibido ou commitado.

## Segurança aprovada para recuperação de senha

Arquitetura definida:

- gerar token criptograficamente aleatório;
- enviar token bruto somente ao cliente;
- armazenar somente SHA-256 do token no banco;
- validade de 30 minutos;
- token de uso único;
- resposta genérica no endpoint de solicitação;
- somente clientes ativos;
- invalidar tokens anteriores ainda não utilizados;
- redefinição em transação;
- senha armazenada com bcrypt;
- incrementar sessionVersion após redefinição;
- sessões antigas tornam-se inválidas;
- exigir novo login depois da redefinição;
- nunca registrar senha ou token bruto nos logs;
- adicionar rate limiting;
- não confiar no header Host para construir URL de recuperação.

## Resend

O projeto já utiliza Resend.

Foi identificado uso existente de:
RESEND_API_KEY

Para recuperação de senha ainda deve ser definida a estratégia do remetente verificado de produção.

Não colocar valores de secrets em documentação ou conversa.

## APP_URL

Ainda não implementado.

Recomendação arquitetural pendente:
utilizar APP_URL como origem canônica para montar o link de redefinição.

Exemplo conceitual:
local -> http://localhost:3000
produção -> domínio oficial STR

Não confiar em Host fornecido pela requisição.

Essa decisão deve ser confirmada antes da implementação.

## Pendência sobre senha do cliente de teste

Durante o teste de invalidação foi alterado deliberadamente somente sessionVersion.

Não houve alteração deliberada de senhaHash.

Se o login com a senha anterior estiver falhando, diagnosticar separadamente sem modificar senhaHash durante a investigação.

## Git

NÃO executar git add/commit/push indiscriminadamente.

Antes do commit:
- revisar .gitignore;
- excluir backups;
- excluir tsconfig.tsbuildinfo;
- garantir que contexto/segredos.txt não seja versionado;
- revisar git diff completo.

## Próximo passo literal

Retomar implementação da recuperação de senha.

Antes de alterar estrutura:
1. confirmar estratégia APP_URL;
2. confirmar estratégia de rate limit do reset;
3. inspecionar imediatamente os arquivos que serão modificados;
4. implementar endpoint de solicitação;
5. implementar envio via Resend;
6. implementar endpoint de redefinição;
7. criar páginas recuperar-senha e redefinir-senha;
8. testar fluxo real;
9. executar TypeScript/build;
10. somente então considerar a fase concluída.

## Estado do desenvolvimento

A funcionalidade de recuperação de senha NÃO está concluída.

A invalidação de sessões está implementada e testada.

O link Área do Cliente está implementado no código, mas ainda aguarda teste visual/click.

O incidente de mojibake foi recuperado.

Checkpoint criado porque a janela máxima de continuidade de cinco horas foi ultrapassada nesta sessão.