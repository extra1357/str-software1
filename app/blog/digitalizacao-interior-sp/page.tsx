import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Por que empresas do interior de SP estão investindo em software próprio",
  description: "A digitalização do interior paulista atingiu nível histórico em 2025. Dados do Sebrae, padrões que observamos em projetos regionais e o que está mudando.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">

        <Link href="/" className="inline-flex items-center gap-2 text-[#C8922A] text-xs font-mono tracking-widest uppercase mb-12 hover:opacity-70 transition-opacity">
          ← STR Software
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">Mercado</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">5 min de leitura</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">Abril 2025</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">
          Por que empresas do interior de SP estão investindo em software próprio
        </h1>

        <p className="text-white/50 text-lg leading-relaxed mb-16 border-l-2 border-[#C8922A]/40 pl-5">
          A digitalização do interior paulista atingiu nível histórico em 2025. Dados do Sebrae mostram o que está mudando — e o que observamos em projetos em Sorocaba, Campinas e região.
        </p>

        <div className="prose prose-invert max-w-none space-y-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que os dados mostram</h2>
            <p>
              Em 2025, a digitalização dos pequenos negócios brasileiros atingiu nível histórico. Segundo pesquisa do Sebrae, 76% dos empreendedores — MEI, micro e pequenas empresas — usam computadores em suas atividades, crescimento de seis pontos percentuais desde 2022. O uso de softwares integrativos subiu 20 pontos percentuais desde 2018, chegando a 47% dos empreendimentos. O acesso à internet está praticamente universalizado: 98% dos empreendedores utilizam conexão própria ou de terceiros
              {" "}<a href="https://agenciasebrae.com.br/inovacao-e-tecnologia/digitalizacao-recorde-pequenos-negocios-no-brasil-atingem-nivel-historico-em-2025/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Agência Sebrae]</a>.
            </p>
            <p className="mt-4">
              Esses números não são concentrados na capital. O interior de São Paulo — Sorocaba, Campinas, Ribeirão Preto, Santos e cidades médias — representa uma fatia expressiva desse crescimento. São empresas industriais, distribuidoras, prestadoras de serviço e varejistas que antes dependiam de planilhas e processos manuais e agora buscam sistemas próprios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Por que software próprio e não um ERP genérico</h2>
            <p>
              A resposta mais comum que ouvimos em projetos no interior paulista é direta: os ERPs genéricos não se encaixam. Distribuidoras com lógica de comissão complexa, transportadoras com regras de frete por região, imobiliárias com processos de captação próprios — nenhum deles se adapta bem a sistemas feitos para todos.
            </p>
            <p className="mt-4">
              Software sob medida permite que o sistema se adapte ao processo da empresa — não o contrário. Isso gera menos treinamento, menos resistência do time e mais aderência no uso diário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O padrão que observamos em projetos regionais</h2>
            <p>Em projetos desenvolvidos pela STR Software para empresas de Sorocaba e região, identificamos três padrões recorrentes:</p>
            <ul className="list-none space-y-3 mt-4">
              {[
                { titulo: "Gestão de clientes ainda no WhatsApp", detalhe: "A maioria das empresas do interior usa WhatsApp como CRM informal. O primeiro sistema pedido quase sempre é uma forma de organizar isso — histórico de clientes, follow-up automatizado, alertas de renovação." },
                { titulo: "Processos financeiros em planilha", detalhe: "Fluxo de caixa, contas a pagar e DRE manual. O ganho imediato de um sistema próprio nessa área é visível em semanas — não meses." },
                { titulo: "Presença digital inexistente ou desatualizada", detalhe: "Empresas com 20 anos de mercado e sem site funcional ou com site estático desatualizado. O portal digital vira o cartão de visitas que credencia a empresa para novos mercados." },
              ].map((item, i) => (
                <li key={i} className="border border-white/8 p-5 bg-[#0d0d0d]">
                  <div className="text-white font-semibold mb-1">{item.titulo}</div>
                  <div className="text-white/45 text-sm">{item.detalhe}</div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">A vantagem de trabalhar com uma software house regional</h2>
            <p>
              Uma software house baseada em São Paulo e com projetos ativos em Sorocaba, Campinas e região entende o contexto local. O perfil do cliente do interior é diferente do da capital: decisão mais rápida, relacionamento mais direto, menos tolerância a burocracia e mais exigência por resultado prático.
            </p>
            <p className="mt-4">
              Projetos remotos funcionam bem — e foram a norma na STR Software desde o início. O que muda é a postura: menos apresentações formais, mais prototipagem rápida e entrega incremental.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que mudou para tornar isso possível agora</h2>
            <p>
              Três fatores convergiram para acelerar a digitalização do interior paulista. Primeiro, o custo de desenvolvimento caiu — frameworks modernos como Next.js e Prisma permitem entregar sistemas robustos com times menores. Segundo, a internet de qualidade chegou a cidades médias que antes tinham conectividade ruim. Terceiro, a pandemia forçou um salto de maturidade digital em empresas que nunca tinham precisado se preocupar com isso.
            </p>
            <p className="mt-4">
              O resultado: uma demanda represada de anos sendo executada agora, por empresas que finalmente têm orçamento, clareza do problema e disposição para investir.
            </p>
          </section>

          <section className="border-t border-white/10 pt-10">
            <p className="text-white/40 text-sm">
              A STR Software atende empresas de Sorocaba, Campinas, Santos, Ribeirão Preto e interior do estado de São Paulo com projetos 100% remotos. Veja projetos como <a href="https://vibecarros.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">VibeCarros</a> e <a href="https://imobiliariaperto.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">ImobiliáriaPerto</a>, ou <a href="/#contato" className="text-[#C8922A] hover:opacity-70">fale com a nossa equipe</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
