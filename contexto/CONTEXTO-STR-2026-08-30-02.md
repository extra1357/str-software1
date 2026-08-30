# CONTEXTO STR SOFTWARE — 2026-08-30 — 02

## 1. OBJETIVO DESTE DOCUMENTO

Este documento é um checkpoint autossuficiente para continuidade do desenvolvimento da STR Software.

Ao retomar o projeto, este documento deve ser usado em conjunto com o Prompt Mestre — Método STR de Desenvolvimento v1.1.

Não presumir que o histórico da conversa estará disponível.

---

## 2. PROJETO

Projeto:
STR Software

Módulo em desenvolvimento:
Área do Cliente

Diretório local correto:

C:\Users\cotaw\Projetos\str-software1

Branch:
main

Ambiente:
Windows + PowerShell

Regras importantes:
- trabalhar pelo terminal/PowerShell;
- UTF-8 sem BOM;
- inspecionar arquivos existentes antes de editar;
- não sobrescrever arquivos sem necessidade;
- explicar decisões estruturais antes de aplicá-las;
- não avançar fase sem teste real;
- não expor segredos;
- não usar `git add .` indiscriminadamente;
- não usar variável PowerShell `$home`;
- evitar `node -e`;
- scripts temporários devem ser removidos após utilização.

---

## 3. ESTADO DA ÁREA DO CLIENTE

Já existe Área do Cliente protegida.

Fluxos existentes:
- login;
- sessão via JWT;
- cookie HttpOnly;
- dashboard;
- visualização de faturas;
- checkout Stripe;
- logout.

Autenticação utiliza:
- bcryptjs;
- JWT;
- Prisma;
- PostgreSQL.

O JWT contém:
- clienteId;
- sessionVersion.

A validação da sessão consulta o cliente no banco e compara sessionVersion.

Isso permite invalidar sessões antigas quando a senha é redefinida.

---

## 4. SESSION VERSION

Foi adicionado ao model Cliente:

sessionVersion Int @default(0)

Migration:

prisma/migrations/20260829215204_add_cliente_session_version/

A função gerarSessionToken recebe:
- clienteId;
- sessionVersion.

A função verificarSessionToken:
- valida JWT;
- consulta cliente;
- verifica se está ativo;
- compara sessionVersion.

Teste real realizado anteriormente:
- sessionVersion do cliente de teste foi incrementado;
- sessão antiga deixou de funcionar;
- dashboard redirecionou para login.

Portanto, invalidação de sessão por versionamento foi comprovada.

---

## 5. RECUPERAÇÃO DE SENHA

Foi implementado o model:

PasswordResetToken

Campos principais:
- id;
- clienteId;
- tokenHash;
- expiresAt;
- usedAt;
- createdAt.

Migration:

prisma/migrations/20260829214122_add_cliente_password_reset/

Arquitetura:
- token bruto aleatório de 32 bytes;
- token enviado somente por e-mail;
- banco armazena SHA-256;
- validade de 30 minutos;
- uso único;
- novos pedidos invalidam tokens anteriores;
- resposta genérica para e-mail inexistente/inativo;
- somente cliente ativo pode receber recuperação.

Rate limit atual:
- mínimo de 1 minuto entre solicitações por cliente;
- máximo de 5 solicitações em 30 minutos.

---

## 6. ENDPOINT DE SOLICITAÇÃO

Criado:

app/api/cliente/auth/recuperar-senha/route.ts

Fluxo:
1. recebe e-mail;
2. normaliza;
3. procura cliente ativo;
4. aplica rate limit;
5. gera token;
6. grava SHA-256;
7. invalida tokens anteriores;
8. gera link usando APP_URL;
9. envia via Resend.

APP_URL local configurado como:

http://localhost:3000

Não usar Host recebido da requisição para construir URL.

---

## 7. RESEND

RESEND_API_KEY já existe no ambiente.

Durante teste inicial com:

teste@strsoftware.com.br

o Resend respondeu 403 porque a conta está em modo de testes e só permite envio para:

salvacao.cristo@gmail.com

Erro observado:

"You can only send testing emails to your own email address..."

Por isso foi criado um cliente exclusivamente de teste:

salvacao.cristo@gmail.com

Nome:
Cliente Teste Recuperacao

ativo:
true

sessionVersion inicial:
0

A senha temporária usada para criar esse cliente NÃO foi registrada neste documento e foi removida da sessão PowerShell.

O script temporário usado para criar o cliente também foi removido.

Não alterar esse cliente sem necessidade.

---

## 8. TESTE REAL DO E-MAIL

Foi solicitado reset para:

salvacao.cristo@gmail.com

O terminal confirmou:

[recuperar-senha] solicitacao processada com sucesso

POST /api/cliente/auth/recuperar-senha 200

O e-mail efetivamente chegou.

O usuário clicou no link recebido.

Portanto foi comprovado:

aplicação -> banco -> token -> Resend -> e-mail -> link.

---

## 9. REDEFINIÇÃO DE SENHA

Foram criados:

app/api/cliente/auth/redefinir-senha/route.ts

app/cliente/redefinir-senha/page.tsx

Política atual:
- mínimo 12 caracteres;
- máximo 128 caracteres.

Endpoint:
1. recebe token e nova senha;
2. calcula SHA-256 do token;
3. procura PasswordResetToken;
4. verifica usedAt;
5. verifica expiração;
6. verifica cliente ativo;
7. gera bcrypt da nova senha;
8. consome token atomicamente;
9. altera senhaHash;
10. incrementa sessionVersion;
11. invalida outros tokens ainda abertos.

A operação crítica utiliza transação Prisma.

Nenhum token bruto ou senha deve ser escrito nos logs.

---

## 10. TYPESCRIPT

Após criação da API e página de redefinição foi executado:

npx tsc --noEmit

Resultado confirmado:

OK: TypeScript sem erros.

---

## 11. TESTE REAL DA REDEFINIÇÃO

O usuário abriu o link de recuperação.

A página:

/cliente/redefinir-senha?token=...

carregou com HTTP 200.

Uma nova senha foi definida.

Terminal confirmou:

[redefinir-senha] senha redefinida e sessoes anteriores invalidadas

POST /api/cliente/auth/redefinir-senha 200

Depois o usuário realizou login usando a NOVA senha.

Terminal:

POST /api/cliente/auth/login 200

GET /cliente/dashboard 200

Portanto estão comprovados:
- token aceito;
- senha alterada;
- bcrypt funcionando;
- sessionVersion incrementada;
- nova senha aceita no login;
- dashboard acessível.

Logout também foi testado:

POST /api/cliente/auth/logout 200

GET /cliente/login 200

---

## 12. TESTE QUE AINDA FALTA

A recuperação de senha AINDA NÃO DEVE SER DECLARADA TOTALMENTE CONCLUÍDA.

Falta testar uso único do token.

PRÓXIMO PASSO LITERAL AO RETOMAR:

Usar novamente EXATAMENTE O MESMO link/token do e-mail que já foi utilizado para alterar a senha.

Não solicitar novo e-mail antes desse teste.

A página pode abrir normalmente porque atualmente a validação do token ocorre no POST.

Preencher nova senha válida com 12+ caracteres e tentar redefinir.

Resultado esperado:

HTTP 400

Mensagem esperada:

"Este link de recuperação é inválido ou expirou. Solicite um novo link."

Log esperado:

[redefinir-senha] tentativa com token invalido, utilizado ou expirado

POST /api/cliente/auth/redefinir-senha 400

Se isso acontecer, o requisito de uso único estará comprovado.

IMPORTANTE:
O token já apareceu anteriormente nos logs/conversa.
Ele NÃO deve ser copiado para documentação, commit ou novos logs manuais.

---

## 13. FOOTER — ÁREA DO CLIENTE

Foi adicionado link:

Área do Cliente
/cliente/login

em dois footers:

app/page.tsx

components/SiteFooter.tsx

A alteração foi reaplicada após recuperação de um incidente de encoding.

Ainda revisar/confirmar visualmente o link no footer caso isso não tenha sido formalmente registrado como teste concluído.

---

## 14. INCIDENTE DE ENCODING

Houve corrupção real de UTF-8/mojibake anteriormente após uso inadequado de leitura/escrita no PowerShell.

Arquivos afetados:
- app/page.tsx;
- components/SiteFooter.tsx.

Eles foram restaurados do Git HEAD.

Depois o link Área do Cliente foi reaplicado corretamente.

Backups operacionais existentes:

app/page.tsx.mojibake-backup

components/SiteFooter.tsx.mojibake-backup

Também existe:

app/cliente/login/page.tsx.backup-recuperacao-senha

prisma/schema.prisma.backup-password-reset

Esses backups NÃO devem ser commitados.

Padrão seguro para leitura:

[System.IO.File]::ReadAllText(path, [System.Text.Encoding]::UTF8)

Padrão seguro para escrita UTF-8 sem BOM:

$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(path, conteudo, $utf8SemBom)

Nunca usar `$home` como variável PowerShell porque conflita com `$HOME`.

---

## 15. PRISMA — ANOMALIA A INVESTIGAR DEPOIS

Durante vários testes apareceu:

prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }

Apesar disso:
- recuperação funcionou;
- envio de e-mail funcionou;
- redefinição funcionou;
- login funcionou;
- dashboard funcionou.

Portanto não foi bloqueador desta funcionalidade.

Registrar como débito técnico.

Não misturar essa investigação com o teste final de uso único do token.

---

## 16. NEXT.JS — OBSERVAÇÃO

Há discrepância histórica de versão.

Documentação/contextos anteriores indicavam Next.js 15.0.3.

Porém o `npm run dev` atual exibiu:

Next.js 16.1.1 (Turbopack)

Também apareceram anteriormente:
- warning de múltiplos package-lock;
- workspace root inferido incorretamente;
- aviso sobre middleware -> proxy;
- panic relacionado a CPU/popcnt no Turbopack;
- caniuse-lite desatualizado.

Esses pontos são débitos técnicos separados.

Não alterar versões sem inspeção e decisão explícita.

---

## 17. ESTADO DO GIT ANTES DA PARADA

Último status conhecido continha:

M app/api/cliente/auth/login/route.ts
M app/api/cliente/faturas/[id]/checkout/route.ts
M app/cliente/dashboard/page.tsx
M app/cliente/login/page.tsx
M app/page.tsx
M components/SiteFooter.tsx
M lib/auth-cliente.ts
M next-env.d.ts
M prisma/schema.prisma

Novos:

app/api/cliente/auth/recuperar-senha/
app/api/cliente/auth/redefinir-senha/
app/cliente/recuperar-senha/
app/cliente/redefinir-senha/

Migrations novas:

prisma/migrations/20260829214122_add_cliente_password_reset/

prisma/migrations/20260829215204_add_cliente_session_version/

Também existem arquivos operacionais que NÃO devem ser adicionados indiscriminadamente:
- backups;
- contexto;
- tsconfig.tsbuildinfo;
- possivelmente arquivos de ambiente.

NÃO executar:

git add .

antes da higiene do repositório.

---

## 18. HIGIENE DO REPOSITÓRIO — DEPOIS DO TESTE

Depois que o teste de reutilização do token retornar 400:

1. inspecionar `.gitignore`;
2. identificar backups operacionais;
3. impedir commit de segredos;
4. verificar `contexto/segredos.txt` sem abrir/expor seu conteúdo;
5. decidir quais documentos de contexto serão versionados;
6. revisar `git diff`;
7. revisar migrations;
8. executar TypeScript novamente;
9. preparar staging seletivo;
10. somente então commit/push.

Não apagar backups antes de confirmar que não são mais necessários.

---

## 19. PRODUÇÃO — AINDA PENDENTE

O Resend está usando atualmente:

STR Software <onboarding@resend.dev>

Isso é adequado apenas ao teste atual do Resend.

Antes de produção:
- verificar domínio no Resend;
- definir remetente oficial;
- preferencialmente tornar remetente configurável por ambiente;
- configurar APP_URL de produção com domínio oficial STR.

Não inventar domínio/remetente.

Não publicar produção antes dessas decisões.

---

## 20. CRITÉRIO DE CONCLUSÃO DA RECUPERAÇÃO

A funcionalidade somente poderá ser marcada como concluída quando estiverem confirmados:

[x] migration PasswordResetToken
[x] sessionVersion
[x] geração segura de token
[x] SHA-256 no banco
[x] expiração
[x] rate limit
[x] resposta genérica
[x] envio real de e-mail
[x] página de recuperação
[x] página de redefinição
[x] bcrypt da nova senha
[x] transação
[x] incremento sessionVersion
[x] login real com nova senha
[x] dashboard após novo login
[x] logout
[ ] tentativa de reutilização do mesmo token retorna 400
[ ] higiene final do repositório
[ ] revisão de produção/Resend
[ ] publicação e teste de produção

---

## 21. PRÓXIMA AÇÃO — NÃO INTERPRETAR

Ao retomar:

PASSO 1:
Não alterar código.

PASSO 2:
Abrir novamente o MESMO link de recuperação que já foi usado.

PASSO 3:
Tentar redefinir novamente com uma senha válida de teste.

PASSO 4:
Confirmar que API retorna 400 e informa token inválido/expirado.

PASSO 5:
Somente após esse teste iniciar higiene do Git/repositório.

Não iniciar nova funcionalidade antes disso.

---

## 22. ESTADO DA SESSÃO

Desenvolvimento interrompido voluntariamente em:

2026-08-30

Motivo:
encerramento da sessão por cansaço.

Nenhuma nova alteração deve ser inferida depois deste checkpoint.

FIM DO CONTEXTO.