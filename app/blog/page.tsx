import Link from "next/link";
import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | STR Software",
  description:
    "Conteúdo técnico sobre desenvolvimento de software, IA aplicada e estratégia digital para empresas paulistas.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLICADO",
    },
    orderBy: [
      {
        publicadoEm: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      categoria: true,
      titulo: true,
      resumo: true,
      slug: true,
      leituraMinutos: true,
    },
  });

  return (
    <>
      <SiteNavbar />
      <main
        className="min-h-screen bg-[#080808] text-white"
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        <section className="relative pt-40 pb-20 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">
              Conteúdo técnico
            </p>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Blog
            </h1>

            <p className="text-white/45 text-lg leading-relaxed max-w-2xl">
              Artigos sobre desenvolvimento de software, IA aplicada e o mercado
              de tecnologia para empresas paulistas — sem enrolação.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid">
              {posts.length === 0 ? (
                <p className="text-white/40">
                  Nenhuma publicação disponível no momento.
                </p>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group border-t border-white/10 pt-8 pb-8 last:border-b hover:border-[#C8922A]/30 transition-all block"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">
                        {post.categoria}
                      </span>

                      {post.leituraMinutos ? (
                        <>
                          <span className="text-white/20 text-[10px]">·</span>
                          <span className="text-white/28 text-[10px] font-mono">
                            {post.leituraMinutos} min
                          </span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="text-white font-semibold text-2xl leading-snug mb-3 group-hover:text-[#E5A93A] transition-colors">
                      {post.titulo}
                    </h2>

                    <p className="text-white/38 text-base leading-relaxed max-w-2xl">
                      {post.resumo}
                    </p>

                    <span className="inline-flex items-center gap-2 text-[#C8922A] text-xs font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ler artigo
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        →
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}