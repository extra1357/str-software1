import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quando contratar uma software house em vez de montar time interno",
  description: "Critérios objetivos para decidir entre terceirizar o desenvolvimento ou contratar desenvolvedores internamente. Análise de custos, riscos e cenários reais.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">

        <Link href="/" className="inline-flex items-center gap-2 text-[#C8922A] text-xs font-mono tracking-widest uppercase mb-12 hover:opacity-70 transition-opacity">
          ← STR Software
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">Estratégia</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">6 min de leitura</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">Abril 2025</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">
          Quando contratar uma software house em vez de montar um time interno
        </h1>

        <p className="text-white/50 text-lg leading-relaxed mb-16 border-l-2 border-[#C8922A]/40 pl-5">
          A decisão entre terceirizar o desenvolvimento ou contratar internamente tem resposta diferente dependendo do estágio, do orçamento e do tipo de demanda da sua empresa. Este artigo traz critérios objetivos — não opiniões.
        </p>

        <div className="prose prose-invert max-w-none space-y-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O cenário em 2025</h2>
            <p>
              O mercado de software no Brasil enfrenta um déficit estrutural de profissionais. A Brasscom estimou uma demanda de 797 mil talentos entre 2021 e 2025, com um déficit anual projetado de 106 mil profissionais por ano
              {" "}<a href="https://ssxdigital.com.br/5-motivos-para-escolher-uma-software-house-ao-inves-de-internalizar/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[SSX Digital]</a>.
              Isso torna a contratação interna mais cara, mais lenta e mais arriscada do que era há 5 anos.
            </p>
            <p className="mt-4">
              Ao mesmo tempo, o Panorama da Software House 2025 apontou que o modelo SaaS cresceu de 33,2% para 46,1% de adoção entre software houses — sinal de que o mercado está amadurecendo e entregando mais valor previsível
              {" "}<a href="https://blog.tecnospeed.com.br/mercado-de-ti-e-o-panorama-da-software-house-insights-tendencias-e-oportunidades-para-2025/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[TecnoSpeed]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Os custos ocultos do time interno</h2>
            <p>
              Montar um time interno de desenvolvimento mínimo — um líder técnico, dois desenvolvedores e um designer UX — exige investimento mensal acima de R$ 30 mil só em salários, sem contar encargos, infraestrutura e ferramentas
              {" "}<a href="https://www.salesforce.com/br/blog/dev-interno-ou-terceirizado/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Salesforce Brasil]</a>.
            </p>
            <p className="mt-4">
              Além do custo fixo, há o custo de ociosidade. Segundo análise do setor, 18% do orçamento de TI é perdido com capacidade ociosa em times internos quando não há demanda constante
              {" "}<a href="https://blog.codetech.software/2025/08/26/5-custos-ocultos-de-desenvolver-software-internamente-e-como-evitar-com-terceirizacao/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Codetech]</a>.
              Uma software house absorve esse risco — você paga pelo que usa.
            </p>
            <p className="mt-4">
              E há o custo de turnover. A rotatividade anual em equipes internas de TI chega a 25%, e cada demissão custa em média R$ 120 mil em recrutamento e onboarding
              {" "}<a href="https://blog.codetech.software/2025/08/26/5-custos-ocultos-de-desenvolver-software-internamente-e-como-evitar-com-terceirizacao/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Codetech]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quando a software house é a escolha certa</h2>
            <p>A terceirização faz sentido em cenários objetivos. Segundo análise do Jornal DCI e da CooperSystem, os principais são:</p>
            <ul className="list-none space-y-3 mt-4">
              {[
                "O time interno está sobrecarregado e não consegue absorver novas demandas sem comprometer qualidade",
                "Você precisa lançar um MVP rápido ou validar um produto antes de investir em equipe fixa",
                "Faltam especialistas em determinadas tecnologias (arquitetura cloud, QA, mobile)",
                "O projeto exige flexibilidade — mudanças frequentes de prioridade ou escopo",
                "O custo de manter equipe interna é alto e a empresa busca previsibilidade orçamentária",
                "A tecnologia não é o core business da empresa, mas é necessária para operar",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#C8922A] mt-0.5 flex-shrink-0">◈</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/40">
              Fontes: <a href="https://www.coopersystem.com.br/en/software-house/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">CooperSystem</a>, <a href="https://www.dci.com.br/tecnologia-e-games/software-house-ou-equipe-interna-como-escolher-a-melhor-opcao-para-seu-negocio/318515/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">DCI</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quando o time interno faz mais sentido</h2>
            <p>
              A equipe interna é mais adequada quando a tecnologia é o próprio produto da empresa — quando o diferencial competitivo está no software em si e não no que o software habilita. Também faz sentido quando há demanda contínua e previsível de desenvolvimento, onde a curva de aprendizado do produto é muito longa para um terceiro absorver com eficiência
              {" "}<a href="https://www.dci.com.br/tecnologia-e-games/software-house-ou-equipe-interna-como-escolher-a-melhor-opcao-para-seu-negocio/318515/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[DCI]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O modelo híbrido que está ganhando espaço</h2>
            <p>
              Cada vez mais empresas usam um time interno reduzido (arquiteto ou tech lead) que governa e especifica, enquanto a execução fica com uma software house parceira. Esse modelo captura o melhor dos dois mundos: controle estratégico interno com velocidade e custo de execução externo
              {" "}<a href="https://www.softdesign.com.br/blog/software-house/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[SoftDesign]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que avaliar antes de contratar uma software house</h2>
            <ul className="list-none space-y-3">
              {[
                "Portfólio com casos similares ao seu — não apenas screenshots, mas contexto e resultado",
                "Transparência sobre quem vai escrever seu código (sem subcontratação invisível)",
                "Entrega do repositório e documentação ao final — você precisa herdar o código",
                "Processo de comunicação claro — quem é seu ponto de contato e com qual frequência",
                "Cláusula de garantia pós-entrega para correção de bugs",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#C8922A] mt-0.5 flex-shrink-0">◈</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-white/10 pt-10">
            <p className="text-white/40 text-sm">
              Na STR Software desenvolvemos projetos como <a href="https://vibecarros.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">VibeCarros</a>, <a href="https://imobiliariaperto.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">ImobiliáriaPerto</a> e <a href="https://tributoimoveis.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">TributoImóveis</a> — você pode acessar e ver como funcionam. Se quiser conversar sobre o seu projeto, <a href="/#contato" className="text-[#C8922A] hover:opacity-70">fale com a gente</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
