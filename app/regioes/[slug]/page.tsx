import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { REGIOES } from "@/lib/regioes-data";
import { SERVICOS } from "@/lib/servicos-data";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export function generateStaticParams() {
  return REGIOES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const regiao = REGIOES.find((r) => r.slug === slug);
  if (!regiao) return {};

  return {
    title: `Desenvolvimento de Software em ${regiao.cidade} | STR Software`,
    description: regiao.introducao,
    openGraph: {
      title: `Desenvolvimento de Software em ${regiao.cidade} | STR Software`,
      description: regiao.introducao,
      type: "website",
    },
  };
}

const DIFERENCIAIS = [
  {
    num: "01",
    titulo: "Sem terceirização",
    texto: "Seu projeto é desenvolvido internamente. Você sabe quem escreve cada linha — sem repassar para freelancers anônimos.",
  },
  {
    num: "02",
    titulo: "Código que você herda",
    texto: "Entregamos repositório, documentação e transferência de conhecimento. Você nunca fica refém da nossa equipe.",
  },
  {
    num: "03",
    titulo: "Do MVP ao escala",
    texto: "Construímos para validar rápido e crescer sem reescrever. Arquitetura pensada desde o primeiro commit.",
  },
];

export default async function RegiaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const regiao = REGIOES.find((r) => r.slug === slug);
  if (!regiao) notFound();

  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
        {/* HERO */}
        <section className="relative pt-40 pb-20 overflow-hidden border-b border-white/5">
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <Link
              href="/#regioes"
              className="inline-flex items-center gap-2 text-white/32 text-xs font-mono tracking-widest uppercase hover:text-[#C8922A] transition-colors mb-8"
            >
              ← Todas as regiões
            </Link>
            <div className="inline-flex items-center gap-2 border border-[#C8922A]/30 px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-pulse" />
              <span className="text-[#C8922A] text-[10px] font-mono tracking-[0.25em] uppercase">{regiao.destaque}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Desenvolvimento de Software em <span className="text-[#C8922A]">{regiao.cidade}</span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed max-w-2xl">{regiao.introducao}</p>
          </div>
        </section>

        {/* SERVIÇOS DISPONÍVEIS */}
        <section className="py-20 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">O que fazemos</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12">
              Serviços disponíveis para empresas em {regiao.cidade}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
              {SERVICOS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/servicos/${s.slug}`}
                  className="group relative border border-white/8 p-7 bg-[#0d0d0d] hover:border-[#C8922A]/40 hover:bg-[#111] transition-all duration-300 block"
                >
                  <div className="text-[#C8922A] text-3xl mb-5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {s.icone}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3 leading-tight">{s.titulo}</h3>
                  <p className="text-white/38 text-sm leading-relaxed">{s.descricao}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section className="py-20 border-b border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-px bg-white/5">
              {DIFERENCIAIS.map(({ num, titulo, texto }) => (
                <div key={num} className="bg-[#0d0d0d] p-8">
                  <span className="text-[#C8922A]/25 text-5xl font-black block mb-6">{num}</span>
                  <h3 className="text-white font-bold text-lg mb-3">{titulo}</h3>
                  <p className="text-white/33 text-sm leading-relaxed">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C8922A]/6 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
              Vamos conversar sobre o seu projeto em {regiao.cidade}?
            </h2>
            <p className="text-white/40 mb-10">
              Sem custo, sem compromisso. Uma reunião de 30 minutos para entender o que você precisa.
            </p>
            <Link
              href="/#contato"
              className="inline-flex items-center gap-3 bg-[#C8922A] text-black font-bold px-10 py-5 hover:bg-[#E5A93A] transition-colors text-sm tracking-wide"
            >
              Falar com especialista <span>→</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
