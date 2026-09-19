# CONTEXTO STR SOFTWARE - STR ACADEMY + RBAC-02

**Data:** 19/09/2026
**Projeto:** STR Software
**Branch:** fase-02-area-cliente
**Commit:** 2036bb395a31c09176bee804e03722b2bb500753

---

# 1. OBJETIVO

Checkpoint tecnico da STR Academy imediatamente apos o encerramento do RBAC-02 e antes do inicio do CMS academico.

Ponto de retomada:

ACADEMY CMS-01A - PREFLIGHT

---

# 2. METODO DE DESENVOLVIMENTO

O desenvolvimento segue o Prompt Master / metodo STR:

- baseline antes da alteracao;
- diagnostico antes da mutacao;
- mudanca minima e controlada;
- backup e rollback quando aplicavel;
- logs em pontos sujeitos a falha silenciosa;
- validacao depois de cada etapa;
- checkpoints antes de mudancas estruturais;
- staging seletivo;
- nunca utilizar git add . em fluxo controlado;
- nao executar limpeza ampla do repositorio;
- nao alterar banco ou migration sem preflight.

---

# 3. OBJETIVO DA STR ACADEMY

A STR Academy e a area educacional da STR Software.

Publicos previstos:

- visitantes;
- alunos externos;
- funcionarios;
- professores e responsaveis por conteudo;
- administradores.

A Academy deve permitir descoberta publica das trilhas e cadastro independente de aluno.

---

# 4. IDENTIDADES

Usuario interno: modelo Usuario.

Aluno Academy: modelo AcademyAluno.

Cliente comercial permanece separado.

Nao misturar Usuario, Cliente e AcademyAluno como se fossem a mesma identidade.

---

# 5. ROTAS ACADEMY

/academy
/academy/fundamentos
/academy/desenvolvimento
/academy/infraestrutura
/academy/metodo-str
/academy/trilhas/[slug]
/academy/conteudos/[slug]
/academy/cadastro
/academy/login
/academy/verificar-email
/academy/recuperar-senha
/academy/redefinir-senha
/academy/minha-area

Administracao:

/admin/academy

---

# 6. AUTENTICACAO DO ALUNO

Fluxo implementado e testado:

Cadastro -> verificacao de e-mail -> login -> sessao -> Minha Area -> logout.

Tambem implementado:

Recuperacao de senha -> token temporario -> redefinicao -> incremento de sessionVersion -> invalidacao das sessoes anteriores.

Arquivo principal de autenticacao:

lib/auth-academy.ts

Caracteristicas:

- cookie academy-session;
- JWT HS256;
- bcrypt;
- custo bcrypt 12;
- sessionVersion;
- aluno ativo obrigatorio;
- e-mail verificado obrigatorio;
- rate limit de login;
- registro de tentativas.

---

# 7. MODELOS PRISMA ACADEMY

Modelos existentes:

- AcademyAluno
- AcademyTrilha
- AcademyModulo
- AcademyAula
- AcademyMatricula
- AcademyProgressoAula
- AcademyLoginAttempt
- AcademyPasswordResetToken
- AcademyEmailVerificationToken
- AcademyCadastroAttempt

Enums conhecidos:

- AcademyNivel
- AcademyMatriculaStatus

---

# 8. MIGRATIONS ACADEMY

Migration inicial:

prisma/migrations/20260916212107_add_str_academy/migration.sql

SHA256:

A471FC4E2DE9FC6C2BE9D90C8A62CCEC7BE73D51EC5EA253A703753C447A7074

Migration de rate limit:

prisma/migrations/20260916230702_add_academy_cadastro_rate_limit/migration.sql

SHA256:

AF76404D5AF369D8BEF20A99857D608911EDE3599BA51429E159ACAFDA36EAC5

REGRA: migrations aplicadas nao devem ser editadas.

---

# 9. COMPONENTES DE AUTENTICACAO

Cadastro:
app/api/academy/auth/cadastro/route.ts
app/academy/cadastro/page.tsx

Verificacao:
app/api/academy/auth/verificar-email/route.ts
app/academy/verificar-email/page.tsx

Login:
app/api/academy/auth/login/route.ts
app/academy/login/page.tsx

Area protegida:
app/academy/minha-area/page.tsx

Logout:
app/api/academy/auth/logout/route.ts
app/academy/_components/academy-logout-button.tsx

Recuperacao:
app/api/academy/auth/recuperar-senha/route.ts
app/academy/recuperar-senha/page.tsx

Redefinicao:
app/api/academy/auth/redefinir-senha/route.ts
app/academy/redefinir-senha/page.tsx

---

# 10. RBAC

Principio adotado:

Autenticacao identifica o usuario.
Autorizacao determina o que o usuario pode fazer.

Politica: deny by default.

Matriz Academy Admin:

| Papel | Academy Admin |
| --- | --- |
| SUPER_ADMIN | permitido |
| ADMIN | permitido |
| CONTEUDO | permitido |
| COMERCIAL | negado |
| FINANCEIRO | negado |
| SUPORTE | negado |
| indefinido | negado |
| desconhecido | negado |

---

# 11. ARQUIVOS RBAC

Criados:

- lib/auth-rbac.ts
- lib/rbac-politicas.ts
- app/admin/academy/page.tsx

Modificado:

- app/admin/admin-nav.tsx

Politica central:

PAPEIS_ACADEMY_ADMIN

Funcao de menu/politica:

papelPodeAcessarAcademy()

Funcoes server-side:

- exigirUsuarioAdmin()
- usuarioTemPapel()
- exigirPapelUsuario()

---

# 12. RESULTADO DOS TESTES RBAC

Matriz real testada:

SUPER_ADMIN = true
ADMIN = true
CONTEUDO = true
COMERCIAL = false
FINANCEIRO = false
SUPORTE = false
undefined = false
PAPEL_INEXISTENTE = false

Teste funcional positivo realizado com SUPER_ADMIN.

O menu STR Academy apareceu corretamente.

A rota /admin/academy foi acessada com sessao moderna de Usuario.

Nao foram alterados papeis de usuarios reais apenas para produzir testes negativos.

---

# 13. SESSAO ADMINISTRATIVA

/admin/academy exige Usuario moderno.

Sessao administrativa legada nao deve conceder acesso incidental a Academy.

Fluxo:

sem Usuario valido -> /login
papel nao autorizado -> /admin
papel autorizado -> /admin/academy

---

# 14. COMMIT RBAC-02

Commit:

2036bb395a31c09176bee804e03722b2bb500753

Mensagem:

feat: adiciona RBAC da administracao da STR Academy

Local e origin/fase-02-area-cliente foram confirmados no mesmo SHA.

---

# 15. CHECKPOINT ANTERIOR

MVP de autenticacao Academy:

29045181420b458a528283275c8f693649c4dc8f

Mensagem:

feat: adiciona MVP de autenticacao da STR Academy

---

# 16. CMS ACADEMY

O professor nao devera precisar utilizar:

- codigo;
- Git;
- terminal;
- Prisma;
- deploy para publicar uma aula.

Estrutura prevista:

STR Academy -> Trilhas -> Modulos -> Aulas -> Conteudo.

O CMS tambem devera permitir administracao futura de alunos e progresso.

---

# 17. VIDEOAULAS

Professor informa URL do video.

Sistema valida provider e identifica o video.

Player e incorporado na aula.

Nao aceitar iframe ou HTML arbitrario.

Providers devem utilizar allowlist.

YouTube e Vimeo sao candidatos iniciais.

---

# 18. CONTEUDO ESTRUTURADO

Hipotese para CMS-01:

armazenar conteudo pedagogico em blocos estruturados.

Possiveis blocos:

- titulo;
- paragrafo;
- lista;
- codigo;
- imagem;
- video;
- exercicio;
- aviso;
- material complementar.

Essa hipotese ainda deve ser validada pelo preflight.

Nao alterar schema antes dessa analise.

---

# 19. ACESSO FUTURO AS TRILHAS

Direcao prevista:

PUBLICA
ALUNOS
INTERNA

A implementacao ainda nao foi realizada.

A identidade de funcionarios dentro da experiencia educacional INTERNA ainda precisa de desenho definitivo.

---

# 20. DEBITOS TECNICOS CONHECIDOS

- token de verificacao ainda merece tratamento adicional de URL/referrer;
- URLs com token podem aparecer em logs de desenvolvimento;
- telemetria de login possui ponto de hardening;
- cadastro possui ponto de melhoria na associacao da tentativa individual;
- rate limit de recuperacao para e-mail inexistente merece revisao;
- retencao de IP merece revisao de privacidade;
- CASCADE em entidades academicas deve ser revisto antes de hard delete;
- invariantes de matricula e progresso precisam ser formalizadas;
- existem warnings de multiplos lockfiles;
- caniuse-lite pode aparecer desatualizado;
- qfilter/Turbopack apresentou problema relacionado a POPCNT;
- Prisma/PostgreSQL apresentou ocasionalmente conexao Closed.

Nao corrigir esses itens como efeito colateral de outra fase.

---

# 21. RESIDUOS LOCAIS

Existem arquivos nao rastreados de fases anteriores.

Podem incluir:

- auditoria/;
- backups;
- arquivos .bak;
- contextos anteriores;
- previews Prisma;
- scripts auxiliares.

NAO executar limpeza ampla.

Evitar:

git clean -fd
git reset --hard
git add .

---

# 22. PROXIMA FASE

ACADEMY CMS-01A - PREFLIGHT

Objetivos:

1. auditar modelos Academy atuais;
2. auditar enums;
3. verificar infraestrutura CMS existente;
4. verificar editores/componentes existentes;
5. definir modelo de conteudo;
6. projetar evolucao aditiva do Prisma;
7. somente depois decidir nova migration.

CMS-01A deve ser inicialmente somente leitura.

---

# 23. PONTO EXATO DE RETOMADA

1. confirmar branch;
2. confirmar HEAD;
3. preservar residuos locais;
4. preservar RBAC-02;
5. executar CMS-01A;
6. analisar schema;
7. projetar CMS;
8. criar checkpoint antes de migration.

---

# ESTADO FINAL

Concluido:

- identidade independente AcademyAluno;
- cadastro;
- verificacao de e-mail;
- login;
- sessao;
- Minha Area;
- logout;
- recuperacao de senha;
- redefinicao de senha;
- pagina administrativa Academy;
- RBAC central;
- menu condicionado ao papel;
- autorizacao server-side inicial;
- testes RBAC;
- commit e sincronizacao remota.

Proximo trabalho:

CMS academico administravel por professor sem programacao.

# FIM DO CHECKPOINT