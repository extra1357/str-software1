import Link from "next/link";

import { AcademyLogoutButton } from "@/app/academy/_components/academy-logout-button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";

export default async function AcademyMinhaAreaPage() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      ACADEMY_SESSION_COOKIE,
    )?.value;

  const aluno =
    await obterAcademyAlunoPorToken(
      token,
    );

  if (!aluno) {
    redirect("/academy/login");
  }

  const primeiroNome =
    aluno.nome
      .trim()
      .split(/\s+/)[0] ||
    "Aluno";

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
              {primeiroNome
                .charAt(0)
                .toUpperCase()}
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
            Este é o seu espaço de aprendizagem.
            Aqui você acompanhará suas trilhas,
            aulas e evolução dentro da STR Academy.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Trilhas
            </p>

            <p className="mt-4 text-3xl font-semibold">
              —
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Suas trilhas matriculadas aparecerão
              aqui.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Progresso
            </p>

            <p className="mt-4 text-3xl font-semibold">
              —
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              O avanço nas aulas será acompanhado
              por esta área.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Nível atual
            </p>

            <p className="mt-4 text-xl font-semibold">
              Em preparação
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Aprendiz, Júnior e Operacional serão
              vinculados à sua evolução.
            </p>
          </article>
        </div>

        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
                Formação
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Suas trilhas aparecerão aqui
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Quando as matrículas e os conteúdos
                publicados pelo CMS estiverem
                vinculados à sua conta, esta área
                será preenchida automaticamente.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-dashed border-[#b77b16]/40 bg-[#b77b16]/5 px-6 py-5 text-center">
              <p className="text-sm font-semibold text-[#8b6219]">
                Ambiente preparado
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Conteúdos em breve
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
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