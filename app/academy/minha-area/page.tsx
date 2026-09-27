import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AcademyLogoutButton } from "@/app/academy/_components/academy-logout-button";
import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

function nivelParaTexto(nivel: string) {
  switch (nivel) {
    case "APRENDIZ":
      return "Aprendiz";
    case "JUNIOR":
      return "Júnior";
    case "OPERACIONAL":
      return "Operacional";
    default:
      return nivel;
  }
}

export default async function AcademyMinhaAreaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACADEMY_SESSION_COOKIE)?.value;

  const aluno = await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    redirect("/academy/login");
  }

  const primeiroNome =
    aluno.nome.trim().split(/\s+/)[0] || "Aluno";

  /*
   * Segurança:
   * alunoId vem exclusivamente da sessão autenticada.
   * Nenhum identificador de aluno é recebido da URL ou do navegador.
   */
  const matriculas = await prisma.academyMatricula.findMany({
    where: {
      alunoId: aluno.id,
      status: {
        in: ["ATIVA", "CONCLUIDA"],
      },
      trilha: {
        ativo: true,
        statusEditorial: "PUBLICADA",
      },
    },
    orderBy: {
      matriculadoEm: "desc",
    },
    select: {
      id: true,
      status: true,
      matriculadoEm: true,
      concluidaEm: true,
      trilha: {
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
            orderBy: {
              ordem: "asc",
            },
            select: {
              id: true,
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
                },
              },
            },
          },
        },
      },
    },
  });

  const aulaIds = matriculas.flatMap((matricula) =>
    matricula.trilha.modulos.flatMap((modulo) =>
      modulo.aulas.map((aula) => aula.id),
    ),
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

  const aulasConcluidas = new Set(
    progressos.map((progresso) => progresso.aulaId),
  );

  const trilhas = matriculas.map((matricula) => {
    const idsDaTrilha = matricula.trilha.modulos.flatMap(
      (modulo) => modulo.aulas.map((aula) => aula.id),
    );

    const totalAulas = idsDaTrilha.length;
    const concluidas = idsDaTrilha.filter((id) =>
      aulasConcluidas.has(id),
    ).length;

    const percentual =
      totalAulas === 0
        ? 0
        : Math.round((concluidas / totalAulas) * 100);

    return {
      ...matricula,
      totalAulas,
      concluidas,
      percentual,
    };
  });

  const totalAulas = trilhas.reduce(
    (total, item) => total + item.totalAulas,
    0,
  );

  const totalConcluidas = trilhas.reduce(
    (total, item) => total + item.concluidas,
    0,
  );

  const progressoGeral =
    totalAulas === 0
      ? 0
      : Math.round((totalConcluidas / totalAulas) * 100);

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10 bg-[#f4f2ed]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <Link
            href="/academy/minha-area"
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-bold text-[#d4a13a]">
              A
            </span>

            <div>
              <div className="text-sm font-bold tracking-[0.16em]">
                STR ACADEMY
              </div>

              <div className="text-xs text-zinc-500">
                Área do aluno
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-600 sm:block">
              {aluno.nome}
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold">
              {primeiroNome.charAt(0).toUpperCase()}
            </span>

            <AcademyLogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
            Minha área
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Olá, {primeiroNome}.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Acompanhe suas trilhas, aulas e sua evolução
            dentro da STR Academy.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Trilhas
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {trilhas.length}
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {trilhas.length === 1
                ? "trilha disponível para você"
                : "trilhas disponíveis para você"}
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Progresso
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {progressoGeral}%
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {totalConcluidas} de {totalAulas} aulas concluídas
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Aulas concluídas
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {totalConcluidas}
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Seu progresso é individual e vinculado à sua conta.
            </p>
          </article>
        </div>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
              Formação
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Minhas trilhas
            </h2>
          </div>

          {trilhas.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-10">
              <h3 className="text-xl font-semibold">
                Nenhuma trilha disponível no momento
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Quando uma matrícula ativa estiver vinculada à sua
                conta e a trilha estiver publicada, ela aparecerá
                automaticamente aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {trilhas.map((matricula) => (
                <article
                  key={matricula.id}
                  className="rounded-3xl border border-black/10 bg-white p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6916]">
                        {nivelParaTexto(matricula.trilha.nivel)}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {matricula.trilha.titulo}
                      </h3>
                    </div>

                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                      {matricula.status === "CONCLUIDA"
                        ? "Concluída"
                        : "Em andamento"}
                    </span>
                  </div>

                  {matricula.trilha.descricao && (
                    <p className="mt-4 text-sm leading-6 text-zinc-600">
                      {matricula.trilha.descricao}
                    </p>
                  )}

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">
                        Progresso
                      </span>

                      <span className="text-zinc-500">
                        {matricula.percentual}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-[#b77b16]"
                        style={{
                          width: `${matricula.percentual}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      {matricula.concluidas} de{" "}
                      {matricula.totalAulas} aulas concluídas
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/academy/trilhas/${matricula.trilha.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      {matricula.percentual > 0
                        ? "Continuar trilha"
                        : "Começar trilha"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link
            href="/academy"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold transition hover:bg-zinc-50"
          >
            Página da Academy
          </Link>
        </div>
      </section>
    </main>
  );
}