# CONTEXTO STR — 2026-08-30 — 03

## 1. Projeto

Projeto: STR Software  
Módulo atual: Área do Cliente  
Raiz local:

C:\Users\cotaw\Projetos\str-software1

Repositório:

https://github.com/extra1357/str-software1.git

Branch:

main

Projeto Vercel:

granavivas-projects/str-software2

Domínio de produção:

https://strsoftware.com.br

---

## 2. Regra de continuidade

Este documento deve ser utilizado em conjunto com o Prompt Mestre — Método STR de Desenvolvimento v1.1.

Princípios obrigatórios:

- trabalhar pelo terminal PowerShell;
- inspecionar arquivos existentes antes de editar;
- UTF-8 sem BOM;
- evitar alterações estruturais sem explicação e confirmação;
- não expor segredos;
- não avançar fases sem testes reais;
- não considerar uma fase concluída apenas porque compilou;
- registrar checkpoints periódicos e nas mudanças importantes de fase;
- usar staging seletivo no Git;
- não usar `git add .`;
- comandos de alteração devem falhar imediatamente em caso de erro;
- evitar comandos improvisados que possam modificar banco ou produção.

---

## 3. Stack observada

Aplicação:

- Next.js;
- React;
- TypeScript;
- Prisma;
- PostgreSQL/Neon;
- bcryptjs;
- JWT;
- Stripe;
- Resend.

O ambiente atual de build está executando:

Next.js 16.1.1 com Turbopack.

Existe divergência histórica com registros antigos indicando Next.js 15.0.3. Essa divergência permanece como dívida técnica e não deve ser corrigida durante esta fase sem análise específica.

Prisma Client:

6.19.1

---

## 4. Área do Cliente

A Área do Cliente possui:

- login;
- logout;
- dashboard protegido;
- visualização de faturas;
- checkout Stripe;
- recuperação de senha;
- redefinição de senha;
- invalidação de sessões após troca de senha.

O fluxo Stripe já havia sido testado anteriormente e não foi alterado nesta fase.

---

## 5. Recuperação de senha

Arquivos principais:

app\api\cliente\auth\recuperar-senha\route.ts
app\cliente\recuperar-senha\page.tsx
app\cliente\login\page.tsx

A recuperação implementa:

- resposta genérica para evitar enumeração de usuários;
- geração criptográfica de token;
- armazenamento somente do SHA-256 do token;
- expiração em 30 minutos;
- limitação de solicitações;
- invalidação de tokens anteriores;
- envio por Resend;
- tratamento explícito de falha no envio.

O fluxo real de envio de e-mail foi testado com sucesso.

---

## 6. Redefinição de senha

Arquivos:

app\api\cliente\auth\redefinir-senha\route.ts
app\cliente\redefinir-senha\page.tsx

Política atual:

- mínimo de 12 caracteres;
- máximo de 128 caracteres.

O fluxo implementa:

- validação do token;
- verificação de expiração;
- bloqueio de token já utilizado;
- bcrypt;
- atualização da senha;
- incremento de sessionVersion;
- invalidação dos demais tokens;
- proteção contra reutilização do token.

Teste funcional realizado:

1. solicitação de recuperação;
2. recebimento real do e-mail;
3. abertura do link;
4. redefinição da senha;
5. invalidação da sessão anterior;
6. login com a nova senha;
7. tentativa de reutilização do token;
8. reutilização corretamente rejeitada.

---

## 7. Sessões

A autenticação do cliente utiliza JWT contendo:

- clienteId;
- sessionVersion.

A validação consulta o cliente no banco e compara sessionVersion.

Foi realizado teste real incrementando sessionVersion.

Resultado:

uma sessão anteriormente válida deixou de funcionar e o usuário foi redirecionado para o login.

---

## 8. Prisma e migrations

Foram adicionados:

PasswordResetToken

e:

Cliente.sessionVersion

Migrations relevantes:

20260829214122_add_cliente_password_reset
20260829215204_add_cliente_session_version

O projeto possui atualmente 5 migrations.

Comando executado localmente:

npx prisma migrate status

Resultado:

Database schema is up to date!

O banco consultado pelo ambiente local foi identificado pelo Prisma como PostgreSQL Neon, database `neondb`.

IMPORTANTE:

isso confirma que o banco apontado pelo DATABASE_URL local está atualizado.

Ainda NÃO está comprovado que o DATABASE_URL configurado na Vercel Production aponta exatamente para esse mesmo banco.

Essa é a principal pendência antes do deploy.

Nenhuma migration adicional deve ser aplicada em produção até essa identidade ser confirmada.

---

## 9. Vercel

CLI observada:

Vercel CLI 59.0.0
Node.js 22.14.0

Projeto corretamente vinculado:

granavivas-projects/str-software2

Domínio canônico:

https://strsoftware.com.br

Variáveis de Production já configuradas:

APP_URL
SESSION_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL

APP_URL:

https://strsoftware.com.br

SESSION_SECRET foi gerado criptograficamente e cadastrado como Sensitive sem exposição do valor.

RESEND_FROM_EMAIL foi cadastrado em Production como Non-sensitive.

Valor configurado:

STR Software <no-reply@strsoftware.com.br>

Não registrar neste documento valores de DATABASE_URL, RESEND_API_KEY, SESSION_SECRET ou outras credenciais.

---

## 10. Vercel env run

Foi investigado:

vercel env run

A CLI informa suporte a:

-e, --environment <TARGET>

Porém tentativas de execução com Production retornaram:

Error: No command provided. Use `--` to separate vercel flags from your command.

As tentativas falharam antes da execução do comando filho.

Nenhuma alteração no banco ocorreu.

Decisão:

não continuar tentando sintaxes aleatórias de `vercel env run`.

---

## 11. Resend e DNS

Domínio autenticado:

strsoftware.com.br

DNS gerenciado pelo Cloudflare.

Registros configurados para Resend:

- DKIM;
- MX;
- SPF.

O painel do Resend confirmou os registros com indicadores verdes.

Envio habilitado.

Recebimento permanece desabilitado, pois não é necessário para recuperação de senha.

Remetente de produção definido como:

STR Software <no-reply@strsoftware.com.br>

---

## 12. Alteração atual do remetente

O endpoint de recuperação deixou de usar remetente hardcoded:

STR Software <onboarding@resend.dev>

e passou a utilizar:

process.env.RESEND_FROM_EMAIL

Se a variável estiver ausente:

- registra erro;
- invalida o token criado;
- retorna HTTP 503.

A alteração foi compilada com sucesso no build de produção local.

Essa alteração ainda deve ser conferida no Git antes do próximo commit.

---

## 13. Build

Após a implementação da recuperação/reset foi encontrado erro do Next.js 16 relacionado a useSearchParams fora de Suspense.

Correção aplicada em:

app\cliente\redefinir-senha\page.tsx

A página passou a envolver o conteúdo em Suspense.

Commit da correção:

e8cb6e6 fix: adiciona suspense na redefinicao de senha

Commit principal anterior:

a8ee1af feat: adiciona recuperacao segura de senha do cliente

Ambos foram enviados ao origin/main.

Após a alteração mais recente de RESEND_FROM_EMAIL:

npm run build

foi executado novamente.

Resultado:

BUILD APROVADO.

---

## 14. Git

Branch:

main

Último commit remoto conhecido:

e8cb6e6 fix: adiciona suspense na redefinicao de senha

Commit anterior:

a8ee1af feat: adiciona recuperacao segura de senha do cliente

Existe alteração local ainda não consolidada referente ao uso de RESEND_FROM_EMAIL em:

app\api\cliente\auth\recuperar-senha\route.ts

Antes de qualquer commit:

1. executar git status;
2. inspecionar git diff;
3. confirmar que somente alterações esperadas serão versionadas;
4. fazer staging seletivo.

Não usar `git add .`.

---

## 15. Backups operacionais

Existem arquivos de backup operacionais ignorados pelo Git.

Entre eles:

app\page.tsx.mojibake-backup
components\SiteFooter.tsx.mojibake-backup
app\cliente\login\page.tsx.backup-recuperacao-senha
prisma\schema.prisma.backup-password-reset
.env.local.backup-app-url
app\api\cliente\auth\recuperar-senha\route.ts.backup-resend-from

Não versionar esses arquivos.

---

## 16. Encoding

Houve anteriormente incidente real de mojibake causado por leitura/escrita inadequada no PowerShell.

Regra atual:

usar APIs .NET com UTF-8 explícito para operações de leitura/modificação/escrita.

Para escrita UTF-8 sem BOM:

New-Object System.Text.UTF8Encoding($false)

Evitar ciclos de Get-Content/WriteAllText sem encoding explícito.

Nunca utilizar a variável `$home` em scripts PowerShell porque PowerShell diferencia nomes de variáveis de forma case-insensitive e `$HOME` é variável automática/read-only.

---

## 17. Segurança

Não expor:

- DATABASE_URL;
- SESSION_SECRET;
- RESEND_API_KEY;
- senhas;
- tokens válidos;
- credenciais Stripe;
- conteúdo de contexto\segredos.txt.

O arquivo:

contexto\segredos.txt

não deve ser lido, exibido ou versionado.

---

## 18. Pendência crítica atual

ANTES DO DEPLOY:

confirmar se o DATABASE_URL configurado na Vercel Production corresponde ao mesmo banco Neon que já possui as 5 migrations.

Não executar `prisma migrate deploy` até essa confirmação.

Não executar migration às cegas.

---

## 19. Próximo passo literal

1. confirmar de forma segura a identidade do banco configurado na Vercel Production sem expor a connection string;
2. se for o mesmo banco já verificado, não aplicar migrations novamente;
3. se for banco diferente, consultar primeiro o status das migrations;
4. somente depois decidir sobre `prisma migrate deploy`;
5. revisar `git status` e `git diff`;
6. versionar seletivamente a alteração de RESEND_FROM_EMAIL e este checkpoint;
7. verificar estado do deployment da Vercel;
8. publicar somente quando banco e Git estiverem confirmados;
9. realizar teste real em produção;
10. somente então considerar a fase concluída.

---

## 20. Critério para conclusão desta fase

A fase somente poderá ser marcada como concluída após:

- banco de Production confirmado;
- migrations confirmadas;
- código versionado;
- build aprovado;
- deployment publicado;
- recuperação de senha testada em produção;
- redefinição testada em produção;
- login posterior testado;
- tentativa de reutilização do token rejeitada;
- resumo dos erros prováveis e dívidas técnicas registrado.

Até este momento:

A FASE NÃO ESTÁ CONCLUÍDA.