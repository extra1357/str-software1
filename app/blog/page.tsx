import Link from "next/link";
import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog | STR Software",
  description:
    "Conteúdo técnico sobre desenvolvimento de software, IA aplicada e estratégia digital para empresas paulistas.",
};

// Mesmos 3 posts que já existem e funcionam em /blog/[slug]. Mantido aqui
// como uma lista própria (em vez de importar de app/page.tsx) para não
// depender da home nem arriscar alterá-la.
const BLOG_POSTS = [
  {
    categoria: "Estratégia",
    titulo: "Quando contratar uma software house em vez de montar um time interno",
    resumo: "O dilema entre terceirizar e contratar internamente tem resposta diferente dependendo do estágio da empresa.",
    slug: "software-house-vs-time-interno",
    leitura: "6 min",
  },
  {
    categoria: "IA Aplicada",
    titulo: "Agentes de IA: o que funciona de verdade para PMEs",
    resumo: "Sem hype. Cases reais de automação com LLMs que geraram retorno para pequenas e médias empresas paulistas.",
    slug: "agentes-ia-pme-2025",
    leitura: "8 min",
  },
  {
    categoria: "Mercado",
    titulo: "Por que empresas do interior de SP estão investindo em software próprio",
    resumo: "A digitalização do interior paulista está acelerando. O padrão que observamos em nossos projetos regionais.",
    slug: "digitalizacao-interior-sp",
    leitura: "5 min",
  },
];

export default function BlogIndexPage() {
  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
        <section className="relative pt-40 pb-20 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">Conteúdo técnico</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Blog</h1>
            <p className="text-white/45 text-lg leading-relaxed max-w-2xl">
              Artigos sobre desenvolvimento de software, IA aplicada e o mercado de tecnologia para empresas
              paulistas — sem enrolação.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid">
              {BLOG_POSTS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group border-t border-white/10 pt-8 pb-8 last:border-b hover:border-[#C8922A]/30 transition-all block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">{p.categoria}</span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-white/28 text-[10px] font-mono">{p.leitura}</span>
                  </div>
                  <h2 className="text-white font-semibold text-2xl leading-snug mb-3 group-hover:text-[#E5A93A] transition-colors">
                    {p.titulo}
                  </h2>
                  <p className="text-white/38 text-base leading-relaxed max-w-2xl">{p.resumo}</p>
                  <span className="inline-flex items-center gap-2 text-[#C8922A] text-xs font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ler artigo <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
