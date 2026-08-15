import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICOS } from "@/lib/servicos-data";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

// Gera as 6 páginas de serviço estaticamente no build (uma para cada
// item de SERVICOS), a partir do slug já definido em lib/servicos-data.ts.
export function generateStaticParams() {
  return SERVICOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servico = SERVICOS.find((s) => s.slug === slug);
  if (!servico) return {};

  return {
    title: `${servico.titulo} | STR Software`,
    description: servico.descricao,
    openGraph: {
      title: `${servico.titulo} | STR Software`,
      description: servico.descricao,
      type: "website",
    },
  };
}

export default async function ServicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servico = SERVICOS.find((s) => s.slug === slug);
  if (!servico) notFound();

  const outrosServicos = SERVICOS.filter((s) => s.slug !== servico.slug).slice(0, 3);

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
              href="/#servicos"
              className="inline-flex items-center gap-2 text-white/32 text-xs font-mono tracking-widest uppercase hover:text-[#C8922A] transition-colors mb-8"
            >
              ← Todos os serviços
            </Link>
            <div className="text-[#C8922A] text-5xl mb-6">{servico.icone}</div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">{servico.titulo}</h1>
            <p className="text-white/45 text-lg leading-relaxed max-w-2xl mb-8">{servico.descricao}</p>
            <div className="flex flex-wrap gap-2">
              {servico.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-white/40 border border-white/15 px-2.5 py-1 font-mono tracking-widest uppercase"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE ENTREGAMOS */}
        <section className="py-20 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-4">O que entregamos</p>
            <p className="text-white/55 text-lg leading-relaxed max-w-3xl">{servico.detalhes}</p>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="py-20 border-b border-white/5 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-8">Benefícios</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {servico.beneficios.map((b) => (
                <div key={b} className="flex items-start gap-3 border border-white/8 bg-[#0d0d0d] p-5">
                  <span className="text-[#C8922A] text-lg leading-none mt-0.5">✓</span>
                  <span className="text-white/60 text-sm leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUTROS SERVIÇOS */}
        <section className="py-20 border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-8">Outros serviços</p>
            <div className="grid sm:grid-cols-3 gap-px bg-white/5">
              {outrosServicos.map((s) => (
                <Link
                  key={s.slug}
                  href={`/servicos/${s.slug}`}
                  className="group bg-[#0d0d0d] p-6 hover:bg-[#111] transition-colors block"
                >
                  <div className="text-[#C8922A] text-2xl mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    {s.icone}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{s.titulo}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{s.descricao}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C8922A]/6 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
              Quer conversar sobre {servico.titulo.toLowerCase()}?
            </h2>
            <p className="text-white/40 mb-10">
              Sem custo, sem compromisso. Uma reunião de 30 minutos para entender seu projeto.
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
