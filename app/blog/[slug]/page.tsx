import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function buscarPostPublicado(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: "PUBLICADO",
    },
  });
}

function formatarData(data: Date | null) {
  if (!data) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await buscarPostPublicado(slug);

  if (!post) {
    return {
      title: "Publicação não encontrada | STR Software",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    post.canonical ||
    `https://strsoftware.com.br/blog/${post.slug}`;

  return {
    title: post.seoTitle || post.titulo,
    description: post.seoDescription || post.resumo,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.seoTitle || post.titulo,
      description: post.seoDescription || post.resumo,
      url: canonical,
      type: "article",
      publishedTime:
        post.publicadoEm?.toISOString(),
      images: post.imagemCapa
        ? [
            {
              url: post.imagemCapa,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const post = await buscarPostPublicado(slug);

  if (!post) {
    notFound();
  }

  const dataPublicacao = formatarData(post.publicadoEm);

  return (
    <main
      className="min-h-screen bg-[#080808] text-white"
      style={{
        fontFamily: "var(--font-sora), sans-serif",
      }}
    >
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link
          href="/blog"
          className="mb-12 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C8922A] transition-opacity hover:opacity-70"
        >
          ← Blog STR Software
        </Link>

        <header>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8922A]">
              {post.categoria}
            </span>

            {post.leituraMinutos ? (
              <>
                <span className="text-[10px] text-white/20">
                  ·
                </span>

                <span className="text-[10px] font-mono text-white/30">
                  {post.leituraMinutos} min de leitura
                </span>
              </>
            ) : null}

            {dataPublicacao ? (
              <>
                <span className="text-[10px] text-white/20">
                  ·
                </span>

                <span className="text-[10px] font-mono capitalize text-white/30">
                  {dataPublicacao}
                </span>
              </>
            ) : null}
          </div>

          <h1 className="mb-8 text-4xl font-black leading-tight tracking-tighter md:text-5xl">
            {post.titulo}
          </h1>

          <p className="mb-16 border-l-2 border-[#C8922A]/40 pl-5 text-lg leading-relaxed text-white/50">
            {post.resumo}
          </p>
        </header>

        {post.imagemCapa ? (
          <div className="mb-14 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={post.imagemCapa}
              alt=""
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div className="text-white/70">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="mb-4 mt-10 text-2xl font-bold text-white">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="mb-3 mt-8 text-xl font-bold text-white">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="mb-4 leading-relaxed">
                  {children}
                </p>
              ),

              ul: ({ children }) => (
                <ul className="mb-6 mt-4 list-disc space-y-3 pl-6">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="mb-6 mt-4 list-decimal space-y-3 pl-6">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="pl-1 leading-relaxed">
                  {children}
                </li>
              ),

              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),

              a: ({ href, children }) => {
                const externo =
                  typeof href === "string" &&
                  /^https?:\/\//.test(href);

                return (
                  <a
                    href={href}
                    target={externo ? "_blank" : undefined}
                    rel={
                      externo
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-[#C8922A] underline transition-opacity hover:opacity-70"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {post.conteudo}
          </ReactMarkdown>
        </div>

        {post.ctaTexto && post.ctaUrl ? (
          <section className="mt-14 border-t border-white/10 pt-10">
            <p className="text-sm leading-relaxed text-white/40">
              Quer conversar sobre seu projeto?{" "}
              <Link
                href={post.ctaUrl}
                className="text-[#C8922A] transition-opacity hover:opacity-70"
              >
                {post.ctaTexto}
              </Link>
              .
            </p>
          </section>
        ) : null}
      </article>
    </main>
  );
}