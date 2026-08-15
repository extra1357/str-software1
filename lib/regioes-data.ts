export type Regiao = {
  slug: string;
  cidade: string;
  introducao: string;
  destaque: string;
};

// IMPORTANTE: a ordem desta lista é a mesma usada na home (app/page.tsx) e
// no rodapé (components/SiteFooter.tsx, que mostra os 6 primeiros). Não
// reordenar sem atualizar os dois lugares.
export const REGIOES: Regiao[] = [
  {
    slug: "sao-paulo",
    cidade: "São Paulo Capital",
    introducao:
      "Atendemos empresas na capital paulista com reuniões presenciais quando fizer sentido para o projeto, e um time dedicado ao seu sistema no restante do tempo. Sistemas web, marketplaces e agentes de IA para negócios que não podem esperar.",
    destaque: "Reuniões presenciais disponíveis na capital",
  },
  {
    slug: "grande-sp",
    cidade: "Grande São Paulo",
    introducao:
      "Empresas da região metropolitana de São Paulo contam com o mesmo padrão técnico e a mesma proximidade de quem está no centro da capital — projetos remotos, com reuniões periódicas ajustadas à rotina do seu time.",
    destaque: "Cobertura de toda a região metropolitana",
  },
  {
    slug: "sorocaba",
    cidade: "Sorocaba",
    introducao:
      "Sorocaba tem um polo industrial e comercial forte, e cada vez mais empresas da região estão digitalizando processos internos e criando plataformas próprias em vez de depender de planilhas e sistemas genéricos. Ajudamos nessa transição.",
    destaque: "Foco em digitalização de processos industriais e comerciais",
  },
  {
    slug: "campinas",
    cidade: "Campinas",
    introducao:
      "Campinas concentra um ecossistema de tecnologia forte no interior paulista. Trabalhamos com empresas da região em projetos que vão de sistemas internos a plataformas SaaS completas, com o mesmo rigor técnico de quem está na capital.",
    destaque: "Presença ativa no polo tecnológico de Campinas",
  },
  {
    slug: "ribeirao-preto",
    cidade: "Ribeirão Preto",
    introducao:
      "Ribeirão Preto e região concentram forte presença do agronegócio e de empresas em expansão. Desenvolvemos sistemas sob medida para operações que precisam de controle real sobre seus processos — do campo à gestão financeira.",
    destaque: "Experiência com operações ligadas ao agronegócio",
  },
  {
    slug: "santos",
    cidade: "Santos",
    introducao:
      "Empresas na Baixada Santista, incluindo negócios ligados à logística portuária e comércio, contam conosco para sistemas web e automações que resolvem gargalos operacionais reais, com acompanhamento remoto constante.",
    destaque: "Atendimento a negócios ligados ao setor portuário e logístico",
  },
  {
    slug: "interior-sp",
    cidade: "Interior de São Paulo",
    introducao:
      "Atendemos empresas em todo o interior paulista — de cidades médias a polos industriais menores — com projetos 100% remotos e reuniões periódicas por vídeo. Distância não é motivo para abrir mão de um sistema bem construído.",
    destaque: "Cobertura de todo o interior do estado",
  },
  {
    slug: "brasil",
    cidade: "Todo o Brasil",
    introducao:
      "Trabalhamos com empresas em qualquer estado do país. Todo o processo é remoto, com reuniões periódicas por vídeo, comunicação constante e entregas incrementais — para que você acompanhe o projeto de perto mesmo à distância.",
    destaque: "Projetos 100% remotos em qualquer estado do Brasil",
  },
];
