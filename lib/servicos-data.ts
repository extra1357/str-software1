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
    descricao: "Plataformas completas desenhadas para o seu processo. ERP, CRM, portais internos e painéis de gestão.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    detalhes: "Construímos sistemas web personalizados que se encaixam exatamente no processo da sua empresa, em vez de forçar sua operação a se adaptar a um software genérico. Do levantamento de requisitos ao deploy em produção, cuidamos de toda a arquitetura, banco de dados e interface.",
    beneficios: [
      "Arquitetura pensada para escalar com o seu negócio",
      "Interface intuitiva, sem curva de aprendizado desnecessária",
      "Integração com sistemas que você já usa",
      "Código documentado e de sua propriedade",
    ],
  },
  {
    slug: "marketplace",
    icone: "\u2b21",
    titulo: "Marketplaces & E-commerce",
    descricao: "Do MVP ao marketplace com pagamentos, multivendedor, logística e analytics integrados.",
    tags: ["Stripe", "Prisma", "Next.js"],
    detalhes: "Desenvolvemos marketplaces e lojas virtuais completas, com suporte a múltiplos vendedores, split de pagamento, gestão de estoque e logística integrada. Ideal para empresas que querem lançar rápido e escalar com segurança.",
    beneficios: [
      "Checkout otimizado para conversão",
      "Split de pagamento automático entre vendedores",
      "Painel administrativo completo",
      "Integração com meios de pagamento nacionais",
    ],
  },
  {
    slug: "agentes-ia",
    icone: "\u25ce",
    titulo: "Agentes de Inteligência Artificial",
    descricao: "Automação inteligente com LLMs: agentes que leem documentos, respondem clientes e tomam decisões.",
    tags: ["OpenAI", "LangChain", "Python"],
    detalhes: "Criamos agentes de IA sob medida que automatizam tarefas repetitivas: leitura e classificação de documentos, atendimento ao cliente, triagem de leads e tomada de decisão com base em regras de negócio reais.",
    beneficios: [
      "Redução de custo operacional em tarefas repetitivas",
      "Atendimento 24/7 sem perder qualidade",
      "Integração com seus sistemas e bases de dados atuais",
      "Modelos ajustados ao vocabulário do seu setor",
    ],
  },
  {
    slug: "saas",
    icone: "\u25a3",
    titulo: "SaaS & Plataformas Recorrentes",
    descricao: "Construímos o produto que você vende como serviço \u2014 multi-tenant, planos, cobranças e escalabilidade desde o dia 1.",
    tags: ["SaaS", "Multi-tenant", "Stripe"],
    detalhes: "Do zero ao primeiro cliente pagante: construímos plataformas SaaS com arquitetura multi-tenant, gestão de planos e assinaturas, cobrança recorrente e painel de métricas para você acompanhar o crescimento do seu produto.",
    beneficios: [
      "Arquitetura multi-tenant segura desde o início",
      "Cobrança recorrente e gestão de planos integrada",
      "Painel de métricas de crescimento (MRR, churn, etc.)",
      "Pronto para escalar sem reescrever o produto",
    ],
  },
  {
    slug: "consultoria",
    icone: "\u25d0",
    titulo: "Consultoria & Arquitetura",
    descricao: "Revisão de código legado, migração de stack, definição de arquitetura e mentoria técnica para times.",
    tags: ["Arquitetura", "Review", "Mentoria"],
    detalhes: "Ajudamos empresas e times técnicos a resolver problemas de arquitetura, revisar código legado, planejar migrações de stack e estruturar boas práticas de desenvolvimento, com mentoria direta para o seu time.",
    beneficios: [
      "Diagnóstico técnico completo do seu sistema atual",
      "Plano de migração sem parar a operação",
      "Mentoria técnica para o seu time interno",
      "Recomendações práticas, sem jargão desnecessário",
    ],
  },
  {
    slug: "mobile",
    icone: "\u2b1f",
    titulo: "Apps Mobile",
    descricao: "Aplicativos iOS e Android com React Native \u2014 uma base de código, dois mercados, sem compromisso na experiência.",
    tags: ["React Native", "Expo", "TypeScript"],
    detalhes: "Desenvolvemos aplicativos móveis para iOS e Android a partir de uma única base de código, reduzindo custo e tempo de desenvolvimento sem abrir mão da qualidade e performance nativa.",
    beneficios: [
      "Uma base de código para as duas plataformas",
      "Publicação nas lojas (App Store e Google Play)",
      "Performance próxima do nativo",
      "Manutenção mais simples e barata a longo prazo",
    ],
  },
];