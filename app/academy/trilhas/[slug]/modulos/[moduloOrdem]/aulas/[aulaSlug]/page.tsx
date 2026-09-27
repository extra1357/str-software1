import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AcademyConcluirAulaButton } from "@/app/academy/_components/academy-concluir-aula-button";
import { AcademyConteudoRenderer } from "@/app/academy/_components/academy-conteudo-renderer";
import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
    moduloOrdem: string;
    aulaSlug: string;
  }>;
};

export default async function AcademyAulaPage({
  params,
}: Props) {
  const { slug, moduloOrdem, aulaSlug } = await params;

  const ordemModulo = Number(moduloOrdem);

  if (
    !Number.isInteger(ordemModulo) ||
    ordemModulo < 1
  ) {
    notFound();
  }

  const cookieStore = await cookies();
  const token =
    cookieStore.get(ACADEMY_SESSION_COOKIE)?.value;

  const aluno =
    await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    redirect("/academy/login");
  }

  /*
   * A identidade do aluno vem exclusivamente da sessao.
   * A pagina somente carrega uma trilha publicada/ativa
   * para a qual esse aluno possui matricula valida.
   */
  const matricula =
    await prisma.academyMatricula.findFirst({
      where: {
        alunoId: aluno.id,
        status: {
          in: ["ATIVA", "CONCLUIDA"],
        },
        trilha: {
          slug,
          ativo: true,
          statusEditorial: "PUBLICADA",
        },
      },
      select: {
        trilha: {
          select: {
            id: true,
            titulo: true,
            slug: true,
            modulos: {
              where: {
                ativo: true,
                statusEditorial: "PUBLICADA",
              },
              orderBy: {
                ordem: "asc",
              },
              select: {
                id: true,
                titulo: true,
                ordem: true,
                aulas: {
                  where: {
                    ativo: true,
                    statusEditorial: "PUBLICADA",
                  },
                  orderBy: {
                    ordem: "asc",
                  },
                  select: {
                    id: true,
                    titulo: true,
                    slug: true,
                    resumo: true,
                    conteudo: true,
                    conteudoEstruturado: true,
                    ordem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!matricula) {
    notFound();
  }

  /*
   * Mantemos a sequencia pedagogica completa para permitir
   * navegacao anterior/proxima inclusive entre modulos.
   *
   * A identidade da rota, entretanto, e o par:
   * modulo.ordem + aula.slug.
   */
  const aulas = matricula.trilha.modulos.flatMap(
    (modulo) =>
      modulo.aulas.map((aula) => ({
        ...aula,
        moduloId: modulo.id,
        moduloTitulo: modulo.titulo,
        moduloOrdem: modulo.ordem,
      })),
  );

  const indiceAtual = aulas.findIndex(
    (aula) =>
      aula.moduloOrdem === ordemModulo &&
      aula.slug === aulaSlug,
  );

  if (indiceAtual < 0) {
    notFound();
  }

  const aula = aulas[indiceAtual];

  const anterior =
    indiceAtual > 0
      ? aulas[indiceAtual - 1]
      : null;

  const proxima =
    indiceAtual < aulas.length - 1
      ? aulas[indiceAtual + 1]
      : null;

  const progresso =
    await prisma.academyProgressoAula.findUnique({
      where: {
        alunoId_aulaId: {
          alunoId: aluno.id,
          aulaId: aula.id,
        },
      },
      select: {
        concluida: true,
      },
    });

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-5 px-6 py-5 lg:px-8">
          <Link
            href={`/academy/trilhas/${slug}`}
            className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          >
            ← Voltar para a trilha
          </Link>

          {progresso?.concluida && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Aula concluída
            </span>
          )}
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6916]">
            Módulo {aula.moduloOrdem}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {aula.moduloTitulo}
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {aula.titulo}
          </h1>

          {aula.resumo && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
              {aula.resumo}
            </p>
          )}
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <AcademyConteudoRenderer
            conteudoEstruturado={aula.conteudoEstruturado}
            conteudoLegado={aula.conteudo}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Progresso da aula
          </p>

          <AcademyConcluirAulaButton
            aulaId={aula.id}
            concluidaInicial={
              progresso?.concluida ?? false
            }
          />
        </section>

        <nav className="mt-8 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-2">
          <div>
            {anterior && (
              <Link
                href={`/academy/trilhas/${slug}/modulos/${anterior.moduloOrdem}/aulas/${anterior.slug}`}
                className="block rounded-2xl border border-black/10 bg-white p-5 transition hover:bg-zinc-50"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Aula anterior
                </span>

                <span className="mt-2 block font-semibold">
                  ← {anterior.titulo}
                </span>
              </Link>
            )}
          </div>

          <div>
            {proxima && (
              <Link
                href={`/academy/trilhas/${slug}/modulos/${proxima.moduloOrdem}/aulas/${proxima.slug}`}
                className="block rounded-2xl border border-black/10 bg-white p-5 text-right transition hover:bg-zinc-50"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Próxima aula
                </span>

                <span className="mt-2 block font-semibold">
                  {proxima.titulo} →
                </span>
              </Link>
            )}
          </div>
        </nav>
      </article>
    </main>
  );
}