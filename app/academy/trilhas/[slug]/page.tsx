import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AcademyTrilhaPage({
  params,
}: Props) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ACADEMY_SESSION_COOKIE)?.value;
  const aluno = await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    redirect("/academy/login");
  }

  /*
   * A matrícula é a autorização.
   * O alunoId vem exclusivamente da sessão.
   */
  const matricula = await prisma.academyMatricula.findFirst({
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
      id: true,
      status: true,
      trilha: {
        select: {
          id: true,
          titulo: true,
          descricao: true,
          nivel: true,
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
              descricao: true,
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

  const aulaIds = matricula.trilha.modulos.flatMap((modulo) =>
    modulo.aulas.map((aula) => aula.id),
  );

  const progressos =
    aulaIds.length > 0
      ? await prisma.academyProgressoAula.findMany({
          where: {
            alunoId: aluno.id,
            aulaId: {
              in: aulaIds,
            },
            concluida: true,
          },
          select: {
            aulaId: true,
          },
        })
      : [];

  const concluidas = new Set(
    progressos.map((progresso) => progresso.aulaId),
  );

  const totalAulas = aulaIds.length;
  const totalConcluidas = concluidas.size;

  const percentual =
    totalAulas === 0
      ? 0
      : Math.round((totalConcluidas / totalAulas) * 100);

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-5 lg:px-8">
          <Link
            href="/academy/minha-area"
            className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          >
            ← Minha área
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
            Trilha de aprendizagem
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {matricula.trilha.titulo}
          </h1>

          {matricula.trilha.descricao && (
            <p className="mt-4 text-base leading-7 text-zinc-600">
              {matricula.trilha.descricao}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Seu progresso
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {totalConcluidas} de {totalAulas} aulas concluídas
              </p>
            </div>

            <strong className="text-xl">
              {percentual}%
            </strong>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-[#b77b16]"
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {matricula.trilha.modulos.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-7">
              <p className="text-sm text-zinc-600">
                Nenhum módulo publicado nesta trilha.
              </p>
            </div>
          ) : (
            matricula.trilha.modulos.map((modulo) => (
              <section
                key={modulo.id}
                className="rounded-3xl border border-black/10 bg-white p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6916]">
                  Módulo {modulo.ordem}
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {modulo.titulo}
                </h2>

                {modulo.descricao && (
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {modulo.descricao}
                  </p>
                )}

                <div className="mt-6 divide-y divide-black/10 border-t border-black/10">
                  {modulo.aulas.length === 0 ? (
                    <p className="py-5 text-sm text-zinc-500">
                      Nenhuma aula publicada neste módulo.
                    </p>
                  ) : (
                    modulo.aulas.map((aula) => {
                      const concluida = concluidas.has(aula.id);

                      return (
                        <Link
                          key={aula.id}
                          href={`/academy/trilhas/${slug}/modulos/${modulo.ordem}/aulas/${aula.slug}`}
                          className="flex items-center justify-between gap-5 py-5 transition hover:opacity-70"
                        >
                          <div>
                            <p className="font-semibold">
                              {aula.ordem}. {aula.titulo}
                            </p>

                            {aula.resumo && (
                              <p className="mt-1 text-sm leading-6 text-zinc-500">
                                {aula.resumo}
                              </p>
                            )}
                          </div>

                          <span
                            className={
                              concluida
                                ? "shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                                : "shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600"
                            }
                          >
                            {concluida
                              ? "Concluída"
                              : "Abrir aula"}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      </section>
    </main>
  );
}