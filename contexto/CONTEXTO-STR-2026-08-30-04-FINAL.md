# CONTEXTO STR - 2026-08-30 - 04 FINAL

## 1. Identificação

Projeto: STR Software  
Módulo/Fase: Fundação da Área do Cliente  
Data de encerramento: 30/08/2026  
Estado: VALIDADO EM PRODUÇÃO  
Domínio de produção: https://strsoftware.com.br

Este documento encerra formalmente a fase de construção e validação da
fundação da Área do Cliente da STR Software.

---

## 2. Objetivo da fase

Construir uma Área do Cliente segura e funcional, integrada à infraestrutura
real da STR Software, contemplando autenticação, sessões, faturas/pagamentos
já existentes, recuperação de senha, redefinição segura de senha e envio
transacional de e-mails.

A implementação foi validada localmente e posteriormente testada ponta a
ponta em produção.

---

## 3. Stack efetivamente utilizada

Aplicação:
- Next.js
- React
- TypeScript
- App Router

Persistência:
- PostgreSQL
- Neon
- Prisma ORM
- Prisma Client

Autenticação e segurança:
- bcrypt
- JWT
- cookies/sessão
- sessionVersion para invalidação de sessões

Pagamentos:
- Stripe
- Checkout
- Webhook

E-mail transacional:
- Resend

Infraestrutura:
- Vercel
- Cloudflare
- Neon PostgreSQL

Versionamento:
- Git
- GitHub

---

## 4. Área do Cliente

A fundação atualmente contempla:

- Login do cliente
- Logout
- Dashboard protegido
- Validação de cliente ativo
- Sessão autenticada
- Invalidação de sessão por sessionVersion
- Visualização de faturas
- Integração existente com Stripe
- Checkout de pagamento
- Webhook de pagamento
- Recuperação de senha
- Redefinição de senha
- E-mail transacional
- Proteção contra reutilização de token

---

## 5. Recuperação de senha

Fluxo implementado:

1. Cliente informa o e-mail.
2. Sistema utiliza resposta genérica para evitar enumeração de contas.
3. Cliente ativo é localizado.
4. Rate limiting é aplicado.
5. Token criptograficamente aleatório é criado.
6. Somente o hash SHA-256 do token é persistido.
7. Tokens anteriores não utilizados são invalidados.
8. Token recebe validade de 30 minutos.
9. Link é enviado por e-mail via Resend.
10. O token pode ser utilizado somente uma vez.

Política de senha:

- mínimo: 12 caracteres
- máximo: 128 caracteres

---

## 6. Invalidação de sessões

O modelo Cliente possui sessionVersion.

O JWT da Área do Cliente transporta a versão da sessão.

Durante a autenticação, a versão existente no token é comparada com a versão
atual persistida no banco.

Quando a senha é redefinida:

- a senha é substituída utilizando bcrypt;
- sessionVersion é incrementado;
- sessões anteriores tornam-se inválidas;
- outros tokens de recuperação são invalidados.

Esse comportamento foi testado.

---

## 7. Banco de dados e migrations

Foi criado suporte persistente para recuperação de senha.

Principais estruturas:

- PasswordResetToken
- relacionamento com Cliente
- tokenHash único
- expiresAt
- usedAt
- createdAt
- sessionVersion em Cliente

Migrations relacionadas:

- 20260829214122_add_cliente_password_reset
- 20260829215204_add_cliente_session_version

O banco utilizado localmente para validação das migrations foi confirmado
como o mesmo DATABASE_URL configurado no ambiente Production da Vercel.

As migrations encontram-se aplicadas.

---

## 8. Resend e infraestrutura de e-mail

Foi configurado remetente por variável de ambiente:

RESEND_FROM_EMAIL

Remetente de produção:

STR Software <no-reply@strsoftware.com.br>

O domínio strsoftware.com.br foi configurado no Resend.

No Cloudflare foram configurados os registros necessários para autenticação
de envio, incluindo:

- DKIM
- SPF
- MX

O domínio foi posteriormente submetido à verificação do Resend.

Resultado final:

STATUS DO DOMÍNIO: VERIFICADO

O Resend confirmou que o domínio está pronto para envio de e-mails.

---

## 9. Variáveis relevantes de produção

A aplicação depende, entre outras, das seguintes configurações:

- DATABASE_URL
- SESSION_SECRET
- STRIPE_SECRET_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- APP_URL

Segredos e valores reais NÃO devem ser registrados neste documento,
versionados no Git ou inseridos em templates reutilizáveis.

---

## 10. Validação real em produção

O fluxo foi testado utilizando a aplicação publicada em produção.

Foram comprovados:

- acesso à página de recuperação;
- solicitação de recuperação aceita;
- API executando em produção;
- geração do token;
- persistência do token;
- Resend operacional;
- domínio autenticado;
- e-mail entregue ao Gmail;
- remetente no-reply@strsoftware.com.br;
- template HTML do e-mail;
- abertura do link;
- redefinição da senha;
- gravação da nova senha;
- invalidação das sessões anteriores;
- login com a nova senha;
- acesso ao dashboard;
- tentativa de reutilização do mesmo token.

Resultado do teste de reutilização:

BLOQUEADO.

A aplicação apresentou mensagem informando que o link de recuperação era
inválido ou havia expirado.

Portanto, a proteção de uso único foi comprovada em produção.

---

## 11. Deploy e versionamento

Commits relevantes desta fase:

a8ee1af
feat: adiciona recuperacao segura de senha do cliente

e8cb6e6
fix: adiciona suspense na redefinicao de senha

5b08006
fix: configura remetente de recuperacao por ambiente

O deploy de produção foi concluído na Vercel e associado ao domínio:

https://strsoftware.com.br

---

## 12. Problemas relevantes encontrados e solucionados

Durante a fase ocorreram problemas que produziram aprendizado técnico
reutilizável:

### Encoding

Houve corrupção de caracteres durante manipulação de arquivos no PowerShell.

Regra consolidada:

- UTF-8 sem BOM;
- preferir APIs .NET explícitas para leitura/escrita;
- inspecionar arquivo antes de modificar;
- utilizar caminhos absolutos;
- scripts devem falhar imediatamente em caso de exceção.

### PowerShell

Evitar variável $home devido ao conflito case-insensitive com $HOME.

Evitar comandos improvisados com node -e quando houver quoting complexo.

### Next.js

A página de redefinição exigiu Suspense devido ao uso de useSearchParams.

O problema foi reproduzido localmente, corrigido, compilado e publicado.

### Vercel

Foram configuradas e validadas variáveis necessárias no ambiente Production.

### Resend

O domínio possuía registros DNS configurados, mas inicialmente a verificação
não havia sido iniciada no painel.

Após iniciar a verificação:

Não Iniciado -> Pendente -> Verificado

O envio em produção passou a funcionar corretamente.

---

## 13. Débitos técnicos conhecidos

Existem itens não bloqueadores que poderão ser tratados futuramente:

- divergência histórica de versões documentadas do Next.js;
- warning de workspace root causado por lockfile externo;
- middleware convention deprecated;
- atualização futura de caniuse-lite;
- revisão futura da condição payment_status no webhook Stripe;
- possível otimização de consultas duplicadas de autenticação;
- melhoria de UX para validar token antes de exibir o formulário de
  redefinição.

Nenhum desses itens impede a entrega da fundação atualmente validada.

---

## 14. Estado comercial do módulo

Esta implementação passa a possuir também uma referência econômica para
comparações futuras.

Horas técnicas já mensuradas nesta fase:

19 horas

Tarifa-base utilizada no cálculo histórico:

R$ 150,00/h

Custo técnico mensurado:

R$ 2.850,00

IMPORTANTE:

Esse valor representa as horas já contabilizadas e não necessariamente
representa todo o custo econômico de infraestrutura, configuração, IA,
ferramentas e conhecimento acumulado.

Configuração, DevOps, Cloud, segurança, arquitetura e outras especialidades
poderão utilizar tarifas próprias nos controles futuros.

---

## 15. Valor comercial de referência

VALOR COMERCIAL DE REFERÊNCIA DO MÓDULO:

R$ 4.500,00

Esse valor passa a servir como referência interna da STR Software para a
fundação funcional atualmente entregue.

Não representa obrigatoriamente preço fixo para todos os clientes.

Projetos futuros poderão acrescentar:

- personalização;
- configuração;
- implantação;
- infraestrutura;
- integrações;
- suporte;
- manutenção;
- módulos adicionais;
- margem comercial.

Portanto, R$ 4.500,00 é uma BASE HISTÓRICA DE VALORAÇÃO deste estágio do
ativo, e não um teto comercial.

---

## 16. Decisão estratégica - STR Modules

Foi definida uma nova estratégia de engenharia da STR Software.

Funcionalidades maduras e comprovadas em produção poderão ser transformadas
em módulos proprietários extremamente reutilizáveis.

Exemplos futuros:

- STR Auth Core
- STR Client Area
- STR Password Recovery
- STR Billing
- STR CRM
- STR CMS
- STR Notifications
- STR Analytics
- STR Audit
- STR Financial

Objetivo:

reduzir reconstrução de software, reutilizar conhecimento já pago e testado,
aumentar produtividade, margem e capacidade de entrega da STR.

---

## 17. Regra fundamental para criação dos módulos

NÃO refatorar ou desmontar aplicações produtivas estáveis para criar os
módulos.

O processo deverá ser:

IMPLEMENTAÇÃO VALIDADA
        ->
CÓPIA CONTROLADA
        ->
GENERALIZAÇÃO
        ->
PARAMETRIZAÇÃO
        ->
TESTES
        ->
DOCUMENTAÇÃO
        ->
VERSIONAMENTO
        ->
STR MODULE

Segredos, credenciais, domínios, clientes e regras específicas nunca deverão
ser incorporados ao módulo genérico.

---

## 18. Primeiro candidato

Primeiro ativo candidato:

STR Client Area Module v1.0

Origem:

fundação da Área do Cliente STR validada em produção em 30/08/2026.

O módulo deverá posteriormente ser extraído por cópia controlada.

A implementação produtiva atual deverá permanecer intacta.

---

## 19. Próxima fase funcional

A próxima expansão da Área do Cliente poderá contemplar um backoffice
financeiro modular, incluindo:

- administração de clientes;
- contratos;
- CRUD de faturas;
- cobranças;
- Stripe;
- conciliação;
- gestão financeira;
- histórico;
- posteriormente integração fiscal/NFS-e.

Essa expansão constitui NOVA FASE.

Não é pendência da fundação encerrada neste documento.

---

# MARCO DE PRODUÇÃO

Em 30/08/2026, a fundação da Área do Cliente STR foi validada ponta a ponta
em produção.

A partir deste checkpoint, alterações futuras pertencem a novas fases de
desenvolvimento.

A implementação estável atual não deve ser refatorada para criação dos
módulos reutilizáveis.

Os STR Modules deverão ser derivados por cópia controlada.

STATUS FINAL:

FUNDAÇÃO DA ÁREA DO CLIENTE
PRONTA PARA ENTREGA E VALIDADA EM PRODUÇÃO.

VALOR COMERCIAL DE REFERÊNCIA:

R$ 4.500,00