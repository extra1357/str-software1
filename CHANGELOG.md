# Changelog

Todas as alterações relevantes do STR Software serão documentadas neste arquivo.

O projeto utiliza versionamento semântico:

- versão principal: alterações incompatíveis;
- versão secundária: novas funcionalidades compatíveis;
- versão de correção: correções compatíveis.

## [1.1.0] - 2026-09-12

### Adicionado

- gestão de usuários internos pelo `SUPER_ADMIN`;
- papéis administrativos para separação de responsabilidades;
- autenticação dos novos usuários internos;
- recuperação de senha dos usuários internos por e-mail;
- tokens de recuperação armazenados somente como hash SHA-256;
- expiração, uso único e limitação de solicitações de recuperação;
- invalidação das sessões anteriores após redefinição de senha;
- módulo administrativo de destinatários das notificações de leads;
- cadastro, edição, ativação, desativação e remoção de destinatários;
- proteção contra remoção ou desativação do último destinatário ativo;
- envio individual das notificações para não revelar os destinatários;
- uso do e-mail do lead como endereço de resposta;
- logs seguros para autenticação, recuperação e notificações;
- checkpoint técnico da entrega.

### Alterado

- login administrativo passou a aceitar usuários internos;
- proxy administrativo passou a validar sessões dos usuários internos;
- navegação administrativa passou a considerar o papel do usuário;
- formulário de leads passou a aguardar o processamento das notificações;
- remetente dos leads passou a utilizar `RESEND_FROM_EMAIL`;
- painel de leads passou a ser revalidado depois de novo cadastro;
- versão do projeto atualizada de `1.0.0` para `1.1.0`.

### Segurança

- respostas genéricas contra descoberta de contas internas;
- senhas protegidas com bcrypt;
- tokens de recuperação aleatórios e de uso único;
- invalidação de sessões por `sessionVersion`;
- rotas de gestão restritas ao `SUPER_ADMIN`;
- normalização e validação de destinatários;
- tratamento dos dados do formulário antes da inserção no HTML;
- ausência de segredos nos arquivos versionados;
- lead preservado mesmo quando uma notificação externa falha.

### Banco de dados

Migrations adicionadas:

- `20260910215000_adiciona_usuarios_internos_v1`;
- `20260911214807_adiciona_destinatarios_leads_v1`.

As migrations foram aplicadas e o banco Neon está sincronizado.

### Validação

- Prisma schema aprovado;
- migrations sincronizadas;
- tipos do Next.js gerados;
- TypeScript aprovado;
- build de produção aprovado;
- 55 páginas processadas;
- recuperação de senha testada com envio real;
- lead salvo e enviado para dois destinatários em teste real.

### Observações operacionais

Antes do deploy, confirmar na Vercel:

- `APP_URL`;
- `RESEND_API_KEY`;
- `RESEND_FROM_EMAIL`.

A ausência da configuração do WhatsApp não impede o salvamento ou o envio dos e-mails.