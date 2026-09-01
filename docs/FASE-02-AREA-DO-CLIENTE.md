# FASE 02 — EXPANSÃO FUNCIONAL DA ÁREA DO CLIENTE

**Projeto:** STR Software  
**Documento:** Especificação Funcional e Técnica da Fase  
**Data de abertura:** 30/08/2026  
**Status:** PLANEJAMENTO / AGUARDANDO IMPLEMENTAÇÃO  
**Método:** Prompt Mestre — Método STR de Desenvolvimento  
**Baseline anterior:** Fundação da Área do Cliente validada em produção  
**Commit de referência:** e0afd89  

---

# 1. ORDEM OBRIGATÓRIA DE LEITURA

Para desenvolver esta fase, a IA e o desenvolvedor deverão consultar, nesta ordem:

1. Prompt Mestre — Método STR de Desenvolvimento.
2. Este documento: `FASE-02-AREA-DO-CLIENTE.md`.
3. Último checkpoint numerado da fase.

Os três documentos possuem funções diferentes.

## Prompt Mestre

Define COMO o desenvolvimento deve ser realizado.

Contém as regras permanentes do Método STR.

## Documento da Fase

Define O QUE deve ser construído, os objetivos funcionais, regras, fluxos, limites e critérios de aceite.

## Checkpoint

Define ONDE o desenvolvimento efetivamente parou.

Nenhum desses documentos substitui os demais.

---

# 2. OBJETIVO DA FASE

Expandir a fundação existente da Área do Cliente para transformá-la em uma área operacional completa e reutilizável.

O objetivo não é construir apenas uma área específica para a STR Software.

A arquitetura deverá permitir reutilização futura em diferentes segmentos, como:

- software houses;
- consultorias;
- agências;
- marcenarias;
- empresas de manutenção;
- prestadores de serviços;
- contabilidades;
- assistência técnica;
- empresas de projetos;
- empresas com contratos recorrentes.

A Área do Cliente deverá funcionar como o ponto central de relacionamento entre empresa e cliente.

---

# 3. PRINCÍPIO FUNDAMENTAL

Esta fase será construída SOBRE OS ALICERCES EXISTENTES.

NÃO reconstruir funcionalidades já validadas.

NÃO desmontar a implementação produtiva.

NÃO substituir tecnologias funcionais sem decisão estrutural previamente apresentada e aprovada.

Devem ser preservados:

- autenticação existente;
- login;
- logout;
- sessões;
- sessionVersion;
- recuperação de senha;
- redefinição de senha;
- tokens de uso único;
- rate limiting existente;
- Prisma/PostgreSQL;
- integração Resend;
- integração Stripe existente;
- infraestrutura Vercel;
- infraestrutura Cloudflare;
- domínio de produção;
- políticas de segurança já implementadas.

O commit `e0afd89` representa o marco de encerramento da fundação anterior.

---

# 4. VISÃO DO PRODUTO

A Área do Cliente deverá permitir que o cliente acompanhe, em um único ambiente:

- seus dados;
- seus serviços;
- seus contratos;
- suas solicitações;
- seus atendimentos;
- seus documentos;
- suas cobranças;
- seus pagamentos;
- suas notificações;
- seu histórico de relacionamento com a empresa.

A empresa deverá possuir um Backoffice correspondente para administrar essas informações.

---

# 5. ATORES

## 5.1 Cliente

Usuário externo que possui relacionamento comercial com a empresa.

Poderá:

- acessar sua conta;
- consultar seus dados;
- consultar serviços;
- consultar contratos;
- abrir solicitações;
- acompanhar solicitações;
- responder atendimentos;
- anexar arquivos;
- consultar documentos;
- consultar cobranças;
- realizar pagamentos quando aplicável;
- consultar histórico;
- receber notificações.

## 5.2 Operador

Usuário interno responsável pelo atendimento.

Poderá:

- consultar clientes;
- visualizar solicitações;
- assumir ou receber solicitações;
- responder;
- alterar status;
- solicitar informações;
- adicionar registros internos quando permitido;
- concluir atendimentos.

## 5.3 Administrador

Usuário interno com privilégios administrativos.

Poderá:

- cadastrar clientes;
- editar clientes;
- ativar/inativar clientes;
- administrar serviços;
- administrar contratos;
- administrar solicitações;
- administrar documentos;
- administrar cobranças;
- administrar usuários internos;
- configurar tipos de solicitação;
- consultar histórico operacional.

---

# 6. ARQUITETURA FUNCIONAL

A solução será dividida conceitualmente em dois ambientes.

## 6.1 Área do Cliente

Módulos previstos:

1. Dashboard
2. Meu Cadastro
3. Meus Serviços / Contratos
4. Solicitações
5. Documentos
6. Financeiro
7. Notificações / Histórico

## 6.2 Backoffice

Módulos previstos:

1. Clientes
2. Serviços / Contratos
3. Solicitações / Atendimento
4. Documentos
5. Financeiro
6. Administração

---

# 7. DASHBOARD DO CLIENTE

O Dashboard deverá apresentar uma visão resumida da situação do cliente.

Cards poderão incluir:

- solicitações abertas;
- solicitações aguardando resposta;
- serviços ativos;
- contratos ativos;
- cobranças pendentes;
- pagamentos recentes;
- documentos disponíveis;
- notificações não lidas.

Também poderão existir blocos como:

- últimas solicitações;
- próximos vencimentos;
- serviços ativos;
- últimos documentos;
- avisos importantes;
- atividade recente.

Os cards deverão ser concebidos de maneira modular para permitir futura configuração por projeto.

---

# 8. MEU CADASTRO

O cliente deverá conseguir consultar seus dados cadastrais.

Dados possíveis:

- nome;
- razão social;
- nome fantasia;
- CPF/CNPJ;
- e-mail;
- telefone;
- endereço;
- contatos relacionados;
- dados adicionais conforme o projeto.

Nem todos os campos deverão necessariamente ser editáveis pelo cliente.

Campos sensíveis ou jurídicos poderão exigir alteração administrativa.

Toda decisão sobre quais campos serão editáveis deverá ser definida antes da implementação.

---

# 9. GESTÃO ADMINISTRATIVA DE CLIENTES

O Backoffice deverá permitir:

- criar cliente;
- consultar cliente;
- editar cliente;
- ativar cliente;
- inativar cliente;
- localizar cliente;
- consultar histórico;
- consultar serviços;
- consultar solicitações;
- consultar documentos;
- consultar situação financeira.

## Criação do acesso

O administrador NÃO deverá precisar conhecer a senha definitiva do cliente.

Fluxo preferencial:

1. Administrador cadastra o cliente.
2. Sistema registra o cliente.
3. Cliente recebe comunicação segura.
4. Cliente define sua própria senha.
5. Cliente realiza o primeiro login.

A infraestrutura segura já existente deverá ser reaproveitada.

---

# 10. SERVIÇOS E CONTRATOS

O sistema deverá permitir registrar o relacionamento comercial existente.

Exemplos:

- software contratado;
- manutenção;
- consultoria;
- assinatura;
- projeto;
- serviço recorrente;
- serviço avulso;
- garantia;
- suporte.

Um registro poderá conter:

- identificação;
- cliente;
- nome do serviço;
- descrição;
- situação;
- data de início;
- data de término quando aplicável;
- valor quando aplicável;
- periodicidade;
- observações;
- documentos relacionados.

A modelagem definitiva será definida antes da implementação.

---

# 11. SOLICITAÇÕES — NÚCLEO OPERACIONAL

Solicitação será o elemento central de atendimento.

Não deverão ser criados sistemas independentes para cada finalidade quando o comportamento puder ser representado por uma solicitação configurável.

Exemplos de tipos:

- suporte;
- relatar problema;
- manutenção;
- alteração;
- orçamento;
- dúvida;
- financeiro;
- envio de documento;
- reclamação;
- visita;
- outro.

Cada empresa poderá futuramente habilitar apenas os tipos necessários.

---

# 12. REGISTRO DA SOLICITAÇÃO

Uma solicitação deverá possuir, conceitualmente:

- identificador interno;
- protocolo público;
- cliente;
- tipo;
- assunto;
- descrição;
- prioridade;
- status;
- serviço/contrato relacionado quando aplicável;
- responsável interno;
- data de abertura;
- data da última atualização;
- data de encerramento;
- anexos;
- interações;
- histórico.

Exemplo de protocolo:

`STR-2026-000184`

O formato definitivo será decidido antes da implementação.

---

# 13. STATUS DA SOLICITAÇÃO

Estados iniciais propostos:

- ABERTA
- RECEBIDA
- EM_ANALISE
- EM_ATENDIMENTO
- AGUARDANDO_CLIENTE
- RESOLVIDA
- ENCERRADA
- CANCELADA

Os estados definitivos e as transições permitidas deverão ser aprovados antes da modelagem.

---

# 14. PRIORIDADE

Prioridades iniciais propostas:

- BAIXA
- NORMAL
- ALTA
- URGENTE

A prioridade não deverá, por si só, constituir SLA.

SLA poderá ser implementado futuramente como módulo próprio.

---

# 15. INTERAÇÕES E MENSAGENS

Cada solicitação poderá possuir uma sequência cronológica de interações.

Uma interação poderá representar:

- mensagem do cliente;
- resposta do operador;
- pedido de informação;
- mudança relevante de status;
- registro operacional permitido;
- envio de anexo.

O cliente deverá conseguir acompanhar o histórico da solicitação.

Registros internos não destinados ao cliente deverão possuir tratamento separado e controle de visibilidade.

---

# 16. ANEXOS

Solicitações poderão aceitar anexos quando habilitado.

Exemplos:

- imagem;
- captura de tela;
- PDF;
- documento;
- comprovante.

Antes da implementação deverão ser definidos:

- tipos permitidos;
- tamanho máximo;
- armazenamento;
- autorização;
- política de download;
- segurança;
- retenção.

Nenhum upload será implementado sem essas definições.

---

# 17. DOCUMENTOS

A Área do Cliente poderá disponibilizar documentos relacionados a:

- cliente;
- serviço;
- contrato;
- solicitação;
- cobrança;
- projeto.

Exemplos:

- contrato;
- proposta;
- orçamento;
- relatório;
- termo;
- comprovante;
- documento técnico.

O acesso deverá respeitar autorização por cliente.

Um cliente jamais poderá acessar documento pertencente a outro cliente.

---

# 18. FINANCEIRO

A fundação já possui conceitos de faturas e integração Stripe.

Esta fase deverá evoluir essa capacidade para administração pelo Backoffice.

Funcionalidades previstas:

- consultar cobranças;
- criar cobrança;
- editar dados permitidos;
- acompanhar situação;
- consultar pagamentos;
- disponibilizar cobrança ao cliente;
- permitir pagamento via fluxo existente;
- consultar histórico financeiro.

Estados financeiros deverão ser definidos formalmente antes da implementação.

---

# 19. CONCILIAÇÃO

Conciliação financeira avançada poderá ser tratada como subfase específica.

Não deverá ser adicionada de maneira improvisada ao CRUD de faturas.

Deverá existir definição própria para:

- origem do pagamento;
- identificação da transação;
- valor esperado;
- valor recebido;
- divergência;
- confirmação;
- estorno;
- cancelamento;
- auditoria.

---

# 20. NOTIFICAÇÕES

O sistema deverá possuir arquitetura preparada para eventos relevantes.

Exemplos:

- cliente cadastrado;
- acesso disponibilizado;
- solicitação criada;
- solicitação respondida;
- mudança de status;
- documento disponibilizado;
- cobrança criada;
- pagamento confirmado.

Canais possíveis:

- interface;
- e-mail;
- futuramente WhatsApp.

A existência de um evento não significa que todos os canais serão implementados nesta fase.

---

# 21. HISTÓRICO E RASTREABILIDADE

Operações relevantes deverão deixar rastreabilidade suficiente.

Exemplos:

- criação de cliente;
- alteração de status;
- criação de solicitação;
- atribuição de responsável;
- resposta;
- encerramento;
- criação de cobrança;
- confirmação de pagamento.

A estratégia técnica de auditoria será definida antes da implementação.

---

# 22. FLUXO END TO END PRINCIPAL

Fluxo de referência:

1. Administrador entra no Backoffice.
2. Administrador cadastra novo cliente.
3. Sistema cria o registro.
4. Cliente recebe instrução segura para criar acesso.
5. Cliente define sua senha.
6. Cliente realiza login.
7. Cliente acessa o Dashboard.
8. Cliente consulta seus serviços.
9. Cliente abre uma nova solicitação.
10. Cliente seleciona o tipo.
11. Cliente informa assunto e descrição.
12. Cliente anexa arquivo quando permitido.
13. Sistema gera protocolo.
14. Solicitação aparece no Backoffice.
15. Operador visualiza a solicitação.
16. Operador assume ou recebe o atendimento.
17. Operador responde.
18. Cliente é notificado.
19. Cliente acessa a solicitação.
20. Cliente responde quando necessário.
21. Operador executa o atendimento.
22. Status é atualizado.
23. Solicitação é resolvida.
24. Solicitação é encerrada.
25. Histórico permanece disponível.
26. Cliente continua podendo consultar documentos, serviços e financeiro.

Esse fluxo deverá ser testado integralmente antes da fase ser considerada concluída.

---

# 23. FLUXO DE PROBLEMA

Exemplo:

Cliente
→ Nova Solicitação
→ Relatar Problema
→ descreve problema
→ anexa print
→ recebe protocolo
→ operador analisa
→ responde
→ cliente acompanha
→ problema resolvido
→ solicitação encerrada.

---

# 24. FLUXO DE MANUTENÇÃO

Exemplo:

Cliente
→ Nova Solicitação
→ Solicitar Manutenção
→ descreve necessidade
→ adiciona fotos
→ recebe protocolo
→ empresa analisa
→ atendimento é organizado
→ execução
→ conclusão
→ histórico.

Manutenção é um TIPO de solicitação.

Não constitui o núcleo da arquitetura.

---

# 25. FLUXO FINANCEIRO

Exemplo:

Administrador
→ cria cobrança
→ cobrança fica associada ao cliente
→ cliente visualiza no Financeiro
→ cliente inicia pagamento
→ Stripe processa
→ webhook confirma
→ sistema atualiza situação
→ histórico permanece disponível.

O fluxo Stripe existente deverá ser preservado e evoluído somente quando necessário.

---

# 26. FLUXO DE DOCUMENTOS

Exemplo:

Empresa
→ associa documento ao cliente ou serviço
→ documento é disponibilizado
→ cliente recebe aviso quando aplicável
→ cliente entra
→ consulta documento autorizado.

---

# 27. MODELAGEM CONCEITUAL INICIAL

Entidades candidatas:

- Cliente
- Serviço
- Contrato
- TipoSolicitacao
- Solicitacao
- InteracaoSolicitacao
- Anexo
- Documento
- Notificacao
- Fatura
- Pagamento
- UsuarioInterno

IMPORTANTE:

Esta lista NÃO autoriza criação imediata de tabelas.

Antes de qualquer alteração no Prisma:

1. inspecionar schema atual;
2. identificar entidades já existentes;
3. evitar duplicação;
4. apresentar modelagem proposta;
5. explicar relacionamentos;
6. identificar impacto;
7. obter aprovação;
8. somente depois criar migration.

---

# 28. ETAPA A — DESCOBERTA E MODELAGEM

Objetivo:

Entender exatamente o que já existe antes de alterar banco ou arquitetura.

Atividades:

- ler Prompt Mestre;
- ler este documento;
- ler último checkpoint;
- inspecionar Git;
- inspecionar Prisma;
- mapear APIs existentes;
- mapear páginas existentes;
- mapear autenticação;
- mapear faturas;
- mapear Stripe;
- mapear Resend;
- identificar componentes reutilizáveis;
- propor modelagem.

Saída:

Documento/modelagem aprovada.

Nenhum banco deverá ser alterado antes disso.

---

# 29. ETAPA B — CLIENTES NO BACKOFFICE

Implementar administração de clientes.

Critérios mínimos:

- criar;
- visualizar;
- editar;
- ativar/inativar;
- pesquisar;
- abrir detalhes;
- preservar segurança de acesso.

Deverá existir teste real antes de avançar.

---

# 30. ETAPA C — MEU CADASTRO

Implementar experiência do cliente para consulta de seus próprios dados.

Definir explicitamente:

- campos visíveis;
- campos editáveis;
- campos bloqueados;
- validações.

---

# 31. ETAPA D — SERVIÇOS / CONTRATOS

Implementar registros dos serviços do cliente.

Testar:

- criação administrativa;
- associação correta;
- visualização pelo cliente correto;
- isolamento entre clientes.

---

# 32. ETAPA E — SOLICITAÇÕES

Implementar o núcleo operacional.

Inclui:

- tipos;
- protocolo;
- abertura;
- prioridade;
- status;
- detalhes;
- histórico inicial.

Essa etapa deverá ser funcional antes de adicionar complexidade desnecessária.

---

# 33. ETAPA F — ATENDIMENTO

Implementar o lado interno.

Inclui:

- fila de solicitações;
- filtros;
- responsável;
- respostas;
- mudanças de status;
- encerramento;
- histórico.

---

# 34. ETAPA G — DOCUMENTOS E ANEXOS

Somente após definição de segurança e armazenamento.

Inclui:

- associação;
- autorização;
- upload quando aprovado;
- consulta;
- download seguro.

---

# 35. ETAPA H — FINANCEIRO

Expandir o financeiro existente.

Inclui:

- administração de faturas;
- consulta;
- cobrança;
- pagamento;
- histórico.

Não reconstruir Stripe sem necessidade.

---

# 36. ETAPA I — DASHBOARD E NOTIFICAÇÕES

Consolidar informações já existentes.

O Dashboard deverá refletir dados reais.

Evitar cards fictícios ou métricas sem origem definida.

---

# 37. ETAPA J — VALIDAÇÃO END TO END

Criar cenário real de teste.

Exemplo:

1. criar Cliente Teste Fase 02;
2. disponibilizar acesso;
3. definir senha;
4. login;
5. cadastrar serviço;
6. cliente visualizar serviço;
7. abrir solicitação;
8. gerar protocolo;
9. operador responder;
10. cliente responder;
11. alterar status;
12. concluir;
13. disponibilizar documento;
14. criar cobrança;
15. cliente consultar;
16. validar pagamento quando aplicável;
17. verificar isolamento entre clientes;
18. verificar histórico.

---

# 38. SEGURANÇA

Pontos obrigatórios:

- autenticação em todas as rotas privadas;
- autorização por cliente;
- isolamento de dados;
- nenhuma confiança em IDs enviados pelo navegador;
- validação server-side;
- proteção contra enumeração quando aplicável;
- rate limiting onde necessário;
- cookies seguros;
- nenhum segredo no código;
- nenhum segredo na documentação;
- logs sem credenciais;
- validação de upload;
- controle de tipos de arquivo;
- controle de tamanho;
- proteção das operações administrativas.

---

# 39. REGRA DE ISOLAMENTO

Esta é uma regra crítica.

Cliente A nunca poderá:

- visualizar solicitação do Cliente B;
- visualizar fatura do Cliente B;
- visualizar contrato do Cliente B;
- visualizar serviço do Cliente B;
- visualizar documento do Cliente B;
- modificar qualquer registro do Cliente B.

Os testes deverão tentar explicitamente violar essa regra.

---

# 40. LOGGING

Falhas relevantes deverão possuir logging explícito.

Especialmente:

- banco de dados;
- autenticação;
- autorização;
- Resend;
- Stripe;
- upload;
- criação de solicitações;
- operações administrativas críticas.

Não utilizar catch silencioso.

---

# 41. ENCODING E ALTERAÇÃO DE ARQUIVOS

Seguir Prompt Mestre.

Política:

UTF-8 sem BOM.

Antes de alterar arquivo existente:

1. ler conteúdo atual;
2. compreender função;
3. identificar impacto;
4. somente então modificar.

Não realizar substituições cegas em múltiplos arquivos.

---

# 42. DECISÕES ESTRUTURAIS

Exigem apresentação e aprovação antes de aplicação:

- nova entidade;
- alteração relevante de entidade;
- migration;
- nova biblioteca principal;
- armazenamento de arquivos;
- sistema de permissões;
- estratégia de auditoria;
- protocolo;
- mudança relevante de autenticação;
- mudança de infraestrutura;
- alteração da arquitetura financeira.

---

# 43. TESTE POR ETAPA

Cada etapa deverá possuir:

1. implementação;
2. build/compilação;
3. teste funcional;
4. teste de erro provável;
5. verificação de logs;
6. confirmação do desenvolvedor.

Nenhuma etapa avança somente porque o código foi escrito.

---

# 44. TESTE DE PREVIEW

Antes de produção, quando aplicável:

- publicar preview;
- executar fluxo real;
- verificar banco;
- verificar autenticação;
- verificar integrações;
- verificar responsividade;
- verificar erros do navegador;
- verificar logs.

---

# 45. PRODUÇÃO

Produção somente após validação da etapa aplicável.

Após deploy:

- confirmar domínio;
- confirmar versão;
- repetir fluxo crítico;
- verificar logs;
- registrar resultado.

Deploy presumido não é deploy confirmado.

---

# 46. CRITÉRIOS DE ACEITE DA FASE

A Fase 02 somente poderá receber status CONCLUÍDA E CONFIRMADA quando:

- código compilar;
- aplicação executar;
- clientes puderem ser administrados;
- cliente puder acessar sua conta;
- serviços/contratos definidos no escopo funcionarem;
- solicitação puder ser aberta;
- protocolo for criado;
- operador puder atender;
- cliente puder acompanhar;
- histórico estiver correto;
- isolamento entre clientes for comprovado;
- documentos previstos funcionarem;
- financeiro previsto funcionar;
- integrações relevantes forem testadas;
- preview for validado quando aplicável;
- produção for validada quando fizer parte da etapa;
- erros prováveis forem documentados;
- checkpoint final for criado;
- Git estiver em estado conhecido;
- nenhum segredo tiver sido exposto.

---

# 47. FORA DO ESCOPO INICIAL

Não implementar automaticamente nesta fase:

- ERP completo;
- contabilidade completa;
- emissão fiscal/NFS-e;
- omnichannel completo;
- chatbot;
- inteligência artificial de atendimento;
- SLA avançado;
- central telefônica;
- estoque;
- agenda complexa;
- assinatura eletrônica própria;
- sistema completo de projetos;
- aplicativo mobile nativo.

Esses itens poderão tornar-se módulos futuros.

---

# 48. REUTILIZAÇÃO FUTURA — STR MODULES

Esta fase também deverá produzir conhecimento para o futuro:

`STR Client Area Module v1.0`

Entretanto:

A implementação produtiva NÃO deverá ser desmontada para criar o módulo.

Processo futuro:

IMPLEMENTAÇÃO VALIDADA
→ CÓPIA CONTROLADA
→ GENERALIZAÇÃO
→ PARAMETRIZAÇÃO
→ TESTES
→ DOCUMENTAÇÃO
→ VERSIONAMENTO
→ STR MODULE

---

# 49. PRINCÍPIO DE GENERALIZAÇÃO

Sempre que surgir uma funcionalidade, perguntar:

"Isso pertence especificamente à STR ou pertence ao conceito genérico de relacionamento empresa-cliente?"

Se for genérico, projetar de forma reutilizável.

Se for específico, manter separado da fundação reutilizável.

Não generalizar prematuramente quando isso aumentar complexidade sem benefício comprovado.

---

# 50. VALOR DO ATIVO DE REFERÊNCIA

A fundação anterior possui valor comercial interno de referência registrado de:

R$ 4.500,00

Esse valor é baseline histórica da fundação já entregue.

A Fase 02 deverá ter suas horas, custos e valor comercial mensurados separadamente.

Ao final será possível comparar:

- custo da fundação;
- valor da fundação;
- custo da expansão;
- valor da expansão;
- componentes reutilizáveis;
- economia potencial de reutilização.

---

# 51. MEDIÇÃO DA EFICÁCIA DO PROMPT MESTRE

Esta fase será utilizada também para validar o Método STR.

Durante o desenvolvimento observar:

- houve perda de contexto?
- arquivos funcionais foram quebrados desnecessariamente?
- houve alteração estrutural sem aprovação?
- houve avanço sem teste?
- houve problema de encoding?
- houve exposição de segredo?
- houve comando incompatível com PowerShell?
- houve erro silencioso?
- houve deploy presumido?
- checkpoints foram suficientes?
- outra IA conseguiria continuar apenas com os documentos?
- o tempo gasto em diagnóstico diminuiu?
- o retrabalho diminuiu?

Essas observações deverão compor a avaliação final da fase.

---

# 52. REGRA DE CONTINUIDADE

Ao interromper o desenvolvimento:

criar ou atualizar checkpoint numerado conforme Prompt Mestre.

O checkpoint deverá informar:

- data;
- fase;
- etapa;
- concluído;
- testado;
- não testado;
- pendente;
- problemas;
- decisões;
- arquivos alterados;
- commits;
- próximo passo literal.

---

# 53. PRIMEIRO PASSO DE IMPLEMENTAÇÃO

O primeiro passo NÃO é criar tabela.

O primeiro passo é:

1. reler Prompt Mestre;
2. reler este documento;
3. reler checkpoint mais recente;
4. verificar Git;
5. inspecionar schema Prisma atual;
6. mapear estruturas já existentes;
7. apresentar a modelagem proposta;
8. obter aprovação.

Somente depois poderá ocorrer alteração estrutural.

---

# 54. ESTADO DE ABERTURA

FASE:

02 — EXPANSÃO FUNCIONAL DA ÁREA DO CLIENTE

STATUS:

PLANEJAMENTO / AGUARDANDO IMPLEMENTAÇÃO

BASELINE:

Fundação da Área do Cliente validada em produção.

PRINCÍPIO:

TRABALHAR SOBRE OS ALICERCES EXISTENTES.

PRÓXIMO PASSO LITERAL:

Inspecionar o estado atual do projeto e do schema Prisma, sem modificar arquivos,
e apresentar a modelagem proposta da Fase 02 para aprovação antes de qualquer
migration ou implementação estrutural.