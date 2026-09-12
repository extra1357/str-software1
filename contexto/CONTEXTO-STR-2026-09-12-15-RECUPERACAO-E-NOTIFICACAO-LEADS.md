# CONTEXTO STR — Recuperação interna e notificação de leads

Data: 12/09/2026
Branch: `fase-02-area-cliente`

## 1. Recuperação de senha interna

Implementado o fluxo de recuperação dos usuários internos da STR:

- solicitação pública por e-mail;
- token aleatório armazenado somente como hash SHA-256;
- validade de 30 minutos;
- uso único;
- limitação de solicitações;
- redefinição com senha entre 12 e 128 caracteres;
- incremento de `sessionVersion`;
- invalidação das sessões antigas;
- resposta genérica contra enumeração de usuários;
- envio pelo Resend;
- páginas internas de recuperação e redefinição.

### Rotas

- `/recuperar-senha`
- `/redefinir-senha`
- `/api/auth/recuperar-senha`
- `/api/auth/redefinir-senha`

### Testes realizados

- envio real do e-mail;
- recebimento confirmado;
- redefinição executada;
- TypeScript aprovado;
- build de produção aprovado.

## 2. Notificação configurável de leads

Criado módulo exclusivo para `SUPER_ADMIN`.

### Funcionalidades

- cadastrar destinatário;
- editar nome e e-mail;
- ativar e desativar;
- remover;
- impedir desativação ou exclusão do último destinatário ativo;
- enviar cada notificação separadamente;
- utilizar o e-mail do lead como `replyTo`;
- preservar o lead quando Resend ou WhatsApp falhar;
- escapar conteúdo antes de inserir no HTML;
- não revelar os destinatários uns aos outros;
- logs seguros com IDs e quantidade de envios.

### Modelo Prisma

`LeadEmailRecipient`

Campos:

- `id`
- `nome`
- `email` único
- `ativo`
- `createdAt`
- `updatedAt`

### Migration

`20260911214807_adiciona_destinatarios_leads_v1`

Migration aplicada com sucesso ao Neon.

### Rotas administrativas

- `/admin/destinatarios-leads`
- `/api/admin/destinatarios-leads`
- `/api/admin/destinatarios-leads/[id]`

### Teste funcional

Resultado confirmado:

- lead salvo no banco;
- WhatsApp sem configuração não impediu o processo;
- e-mail enviado separadamente para dois destinatários;
- formulário respondeu com HTTP 200;
- cadastro e atualização de destinatários aprovados.

## 3. Validações finais

- `git diff --check`: aprovado;
- `prisma validate`: aprovado;
- `prisma migrate status`: banco atualizado;
- `next typegen`: aprovado;
- `tsc --noEmit`: aprovado;
- `npm run build`: aprovado;
- 55 páginas geradas;
- rotas novas reconhecidas no build.

## 4. Configurações locais

Presentes:

- `APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Valores não foram registrados neste documento.

## 5. Avisos conhecidos

Não bloqueantes:

- múltiplos `package-lock.json`;
- Browserslist desatualizado;
- CPU antiga sem instrução `popcnt`;
- configuração do WhatsApp incompleta;
- avisos de conversão futura entre LF e CRLF.

## 6. Antes do deploy

- confirmar `RESEND_FROM_EMAIL` no ambiente da Vercel;
- confirmar `RESEND_API_KEY` no ambiente da Vercel;
- revisar seletivamente os arquivos do commit;
- não utilizar `git add .`;
- não incluir backups, auditorias ou segredos;
- testar novamente em produção depois do deploy.