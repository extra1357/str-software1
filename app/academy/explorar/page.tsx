import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AcademyMatricularButton } from "@/app/academy/_components/academy-matricular-button";
import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

function nivelParaTexto(
  nivel: "APRENDIZ" | "JUNIOR" | "OPERACIONAL",
) {
  switch (nivel) {
    case "APRENDIZ":
      return "Aprendiz";
    case "JUNIOR":
      return "Júnior";
    case "OPERACIONAL":
      return "Operacional";
  }
}

export default async function AcademyExplorarPage() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(ACADEMY_SESSION_COOKIE)?.value;

  const aluno = await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    redirect("/academy/login");
  }

  const trilhas = await prisma.academyTrilha.findMany({
    where: {
      ativo: true,
      statusEditorial: "PUBLICADA",
      acesso: {
        in: ["PUBLICA", "ALUNOS"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      nivel: true,
      modulos: {
        where: {
          ativo: true,
          statusEditorial: "PUBLICADA",
        },
        select: {
          id: true,
          aulas: {
            where: {
              ativo: true,
              statusEditorial: "PUBLICADA",
            },
            select: {
              id: true,
            },
          },
        },
      },
      matriculas: {
        where: {
          alunoId: aluno.id,
          status: {
            in: ["ATIVA", "CONCLUIDA"],
          },
        },
        select: {
          id: true,
          status: true,
        },
        take: 1,
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10 bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-5 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
              STR Academy
            </p>
            <p className="mt-1 font-semibold">
              Explorar trilhas
            </p>
          </div>

          <Link
            href="/academy/minha-area"
            className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          >
            Minha área
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
            Formação
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Escolha sua próxima trilha
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            Explore as formações disponíveis e matricule-se
            nas trilhas que deseja estudar.
          </p>
        </div>

        {trilhas.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 sm:p-10">
            <h2 className="text-xl font-semibold">
              Nenhuma trilha disponível
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Novas trilhas aparecerão aqui quando forem
              publicadas pela STR Academy.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {trilhas.map((trilha) => {
              const totalModulos = trilha.modulos.length;

              const totalAulas = trilha.modulos.reduce(
                (total, modulo) =>
                  total + modulo.aulas.length,
                0,
              );

              const matricula = trilha.matriculas[0] ?? null;

              return (
                <article
                  key={trilha.id}
                  className="rounded-3xl border border-black/10 bg-white p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6916]">
                        {nivelParaTexto(trilha.nivel)}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        {trilha.titulo}
                      </h2>
                    </div>

                    {matricula && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Matriculado
                      </span>
                    )}
                  </div>

                  {trilha.descricao && (
                    <p className="mt-4 text-sm leading-6 text-zinc-600">
                      {trilha.descricao}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-500">
                    <span>
                      {totalModulos}{" "}
                      {totalModulos === 1
                        ? "módulo"
                        : "módulos"}
                    </span>

                    <span aria-hidden="true">•</span>

                    <span>
                      {totalAulas}{" "}
                      {totalAulas === 1 ? "aula" : "aulas"}
                    </span>
                  </div>

                  <div className="mt-7">
                    {matricula ? (
                      <Link
                        href={`/academy/trilhas/${trilha.slug}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                      >
                        Acessar trilha
                      </Link>
                    ) : (
                      <AcademyMatricularButton
                        trilhaId={trilha.id}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/academy/minha-area"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50"
          >
            Voltar para Minha Área
          </Link>
        </div>
      </section>
    </main>
  );
}