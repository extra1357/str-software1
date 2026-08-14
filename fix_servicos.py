import os

# ---------- lib/servicos-data.ts ----------
servicos_data = r'''export type Servico = {
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
'''

# ---------- app/servicos/[slug]/page.tsx ----------
servico_page = r'''import { SERVICOS } from "../../../lib/servicos-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SERVICOS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const servico = SERVICOS.find((s) => s.slug === params.slug);
  if (!servico) return {};
  return {
    title: `${servico.titulo} | STR Software`,
    description: servico.descricao,
  };
}

export default function ServicoPage({ params }: { params: { slug: string } }) {
  const servico = SERVICOS.find((s) => s.slug === params.slug);
  if (!servico) return notFound();

  return (
    <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link href="/#servicos" className="text-white/38 text-sm hover:text-[#C8922A] transition-colors">
          &larr; Voltar para servicos
        </Link>

        <div className="text-[#C8922A] text-5xl mt-8 mb-6">{servico.icone}</div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{servico.titulo}</h1>

        <p className="text-white/45 text-lg leading-relaxed mb-8">{servico.descricao}</p>

        <div className="flex flex-wrap gap-2 mb-12">
          {servico.tags.map((t) => (
            <span key={t} className="text-[10px] text-white/28 border border-white/10 px-2 py-0.5 font-mono tracking-widest uppercase">
              {t}
            </span>
          ))}
        </div>

        <div className="border-t border-white/8 pt-10 mb-10">
          <p className="text-white/60 text-base leading-relaxed">{servico.detalhes}</p>
        </div>

        <div className="border-t border-white/8 pt-10">
          <h2 className="text-xl font-bold mb-6">O que voce ganha</h2>
          <ul className="space-y-4">
            {servico.beneficios.map((b) => (
              <li key={b} className="flex items-start gap-3 text-white/55 text-sm leading-relaxed">
                <span className="text-[#C8922A] mt-0.5">&#10003;</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/8 pt-10 mt-12">
          <a
            href="/#contato"
            className="inline-flex items-center gap-3 bg-[#C8922A] text-black font-bold px-8 py-4 hover:bg-[#E5A93A] transition-colors text-sm tracking-wide"
          >
            Falar com especialista &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
'''

base = r"C:\str_software\str-software"

os.makedirs(os.path.join(base, "lib"), exist_ok=True)
with open(os.path.join(base, "lib", "servicos-data.ts"), "w", encoding="utf-8") as f:
    f.write(servicos_data)

servico_dir = os.path.join(base, "app", "servicos", "[slug]")
os.makedirs(servico_dir, exist_ok=True)
with open(os.path.join(servico_dir, "page.tsx"), "w", encoding="utf-8") as f:
    f.write(servico_page)

print("Criado: lib/servicos-data.ts")
print("Criado: app/servicos/[slug]/page.tsx")
print("Rotas geradas para os slugs:", [s for s in ["sistemas-web","marketplace","agentes-ia","saas","consultoria","mobile"]])
