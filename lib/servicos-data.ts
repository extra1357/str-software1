export type Servico = {
  slug: string;
  icone: string;
  titulo: string;
  descricao: string;
  tags: string[];
  detalhes: string;
  beneficios: string[];
};

export const SERVICOS: Servico[] = [
  {
    slug: "sistemas-web",
    icone: "\u25c8",
    titulo: "Sistemas Web Sob Medida",
    descricao: "Plataformas completas desenhadas para o seu processo. ERP, CRM, portais internos e paineis de gestao.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    detalhes: "Construimos sistemas web personalizados que se encaixam exatamente no processo da sua empresa, em vez de forcar sua operacao a se adaptar a um software generico. Do levantamento de requisitos ao deploy em producao, cuidamos de toda a arquitetura, banco de dados e interface.",
    beneficios: [
      "Arquitetura pensada para escalar com o seu negocio",
      "Interface intuitiva, sem curva de aprendizado desnecessaria",
      "Integracao com sistemas que voce ja usa",
      "Codigo documentado e de sua propriedade",
    ],
  },
  {
    slug: "marketplace",
    icone: "\u2b21",
    titulo: "Marketplaces & E-commerce",
    descricao: "Do MVP ao marketplace com pagamentos, multivendedor, logistica e analytics integrados.",
    tags: ["Stripe", "Prisma", "Next.js"],
    detalhes: "Desenvolvemos marketplaces e lojas virtuais completas, com suporte a multiplos vendedores, split de pagamento, gestao de estoque e logistica integrada. Ideal para empresas que querem lancar rapido e escalar com seguranca.",
    beneficios: [
      "Checkout otimizado para conversao",
      "Split de pagamento automatico entre vendedores",
      "Painel administrativo completo",
      "Integracao com meios de pagamento nacionais",
    ],
  },
  {
    slug: "agentes-ia",
    icone: "\u25ce",
    titulo: "Agentes de Inteligencia Artificial",
    descricao: "Automacao inteligente com LLMs: agentes que leem documentos, respondem clientes e tomam decisoes.",
    tags: ["OpenAI", "LangChain", "Python"],
    detalhes: "Criamos agentes de IA sob medida que automatizam tarefas repetitivas: leitura e classificacao de documentos, atendimento ao cliente, triagem de leads e tomada de decisao com base em regras de negocio reais.",
    beneficios: [
      "Reducao de custo operacional em tarefas repetitivas",
      "Atendimento 24/7 sem perder qualidade",
      "Integracao com seus sistemas e bases de dados atuais",
      "Modelos ajustados ao vocabulario do seu setor",
    ],
  },
  {
    slug: "saas",
    icone: "\u25a3",
    titulo: "SaaS & Plataformas Recorrentes",
    descricao: "Construimos o produto que voce vende como servico \u2014 multi-tenant, planos, cobrancas e escalabilidade desde o dia 1.",
    tags: ["SaaS", "Multi-tenant", "Stripe"],
    detalhes: "Do zero ao primeiro cliente pagante: construimos plataformas SaaS com arquitetura multi-tenant, gestao de planos e assinaturas, cobranca recorrente e painel de metricas para voce acompanhar o crescimento do seu produto.",
    beneficios: [
      "Arquitetura multi-tenant segura desde o inicio",
      "Cobranca recorrente e gestao de planos integrada",
      "Painel de metricas de crescimento (MRR, churn, etc.)",
      "Pronto para escalar sem reescrever o produto",
    ],
  },
  {
    slug: "consultoria",
    icone: "\u25d0",
    titulo: "Consultoria & Arquitetura",
    descricao: "Revisao de codigo legado, migracao de stack, definicao de arquitetura e mentoria tecnica para times.",
    tags: ["Arquitetura", "Review", "Mentoria"],
    detalhes: "Ajudamos empresas e times tecnicos a resolver problemas de arquitetura, revisar codigo legado, planejar migracoes de stack e estruturar boas praticas de desenvolvimento, com mentoria direta para o seu time.",
    beneficios: [
      "Diagnostico tecnico completo do seu sistema atual",
      "Plano de migracao sem parar a operacao",
      "Mentoria tecnica para o seu time interno",
      "Recomendacoes praticas, sem jargao desnecessario",
    ],
  },
  {
    slug: "mobile",
    icone: "\u2b1f",
    titulo: "Apps Mobile",
    descricao: "Aplicativos iOS e Android com React Native \u2014 uma base de codigo, dois mercados, sem compromisso na experiencia.",
    tags: ["React Native", "Expo", "TypeScript"],
    detalhes: "Desenvolvemos aplicativos moveis para iOS e Android a partir de uma unica base de codigo, reduzindo custo e tempo de desenvolvimento sem abrir mao da qualidade e performance nativa.",
    beneficios: [
      "Uma base de codigo para as duas plataformas",
      "Publicacao nas lojas (App Store e Google Play)",
      "Performance proxima do nativo",
      "Manutencao mais simples e barata a longo prazo",
    ],
  },
];
