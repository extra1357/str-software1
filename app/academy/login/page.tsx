"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type EstadoLogin =
  | "ocioso"
  | "enviando"
  | "erro";

export default function AcademyLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [estado, setEstado] =
    useState<EstadoLogin>("ocioso");

  const [mensagem, setMensagem] =
    useState("");

  async function fazerLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (estado === "enviando") {
      return;
    }

    const emailNormalizado =
      email.trim().toLowerCase();

    if (!emailNormalizado || !senha) {
      setEstado("erro");
      setMensagem(
        "Informe seu e-mail e sua senha.",
      );
      return;
    }

    setEstado("enviando");
    setMensagem("");

    try {
      const response = await fetch(
        "/api/academy/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: emailNormalizado,
            senha,
          }),
        },
      );

      const dados = (await response
        .json()
        .catch(() => null)) as
        | {
            mensagem?: string;
            erro?: string;
          }
        | null;

      if (response.status === 200) {
        /*
         * A API gravou o cookie HttpOnly.
         * A senha nao e armazenada no cliente.
         */
        setSenha("");

        window.location.assign(
          "/academy/minha-area",
        );

        return;
      }

      setEstado("erro");

      if (response.status === 401) {
        setMensagem(
          "E-mail ou senha inválidos.",
        );
        return;
      }

      if (response.status === 429) {
        setMensagem(
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        );
        return;
      }

      if (response.status === 403) {
        setMensagem(
          "Não foi possível validar esta solicitação.",
        );
        return;
      }

      if (response.status === 503) {
        setMensagem(
          "Login temporariamente indisponível. Tente novamente em alguns instantes.",
        );
        return;
      }

      setMensagem(
        dados?.erro ||
          "Não foi possível realizar o login.",
      );
    } catch {
      setEstado("erro");
      setMensagem(
        "Não foi possível conectar ao servidor.",
      );
    }
  }

  const enviando =
    estado === "enviando";

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10 bg-[#f4f2ed]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/academy"
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
                Formação técnica aplicada
              </div>
            </div>
          </Link>

          <Link
            href="/academy"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            Voltar para Academy
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-14 px-6 py-14 lg:grid-cols-[1fr_460px] lg:px-8">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-[#c8922a]/30 bg-[#c8922a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b6219]">
            Área do aluno
          </div>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Continue de onde
            <span className="block text-[#9a6916]">
              você parou.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600">
            Acesse sua área para acompanhar
            trilhas, conteúdos e sua evolução
            dentro da STR Academy.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-bold">
                01
              </span>

              <div>
                <h2 className="font-semibold">
                  Aprendizado estruturado
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Conteúdo organizado por
                  trilhas, módulos e aulas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-bold">
                02
              </span>

              <div>
                <h2 className="font-semibold">
                  Evolução acompanhada
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Seu progresso permanece
                  associado à sua conta.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-bold">
                03
              </span>

              <div>
                <h2 className="font-semibold">
                  Método aplicado
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Aprenda desenvolvimento,
                  diagnóstico e engenharia
                  com prática controlada.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.07)] sm:p-9">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6916]">
              Login
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Acesse sua conta
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Entre com o e-mail e a senha
              utilizados no seu cadastro.
            </p>
          </div>

          <form
            onSubmit={fazerLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                disabled={enviando}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:bg-zinc-100"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium"
                >
                  Senha
                </label>

                <Link
                  href="/academy/recuperar-senha"
                  className="text-xs font-semibold text-[#8b6219] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  value={senha}
                  disabled={enviando}
                  onChange={(event) =>
                    setSenha(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-20 text-sm outline-none transition focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:bg-zinc-100"
                />

                <button
                  type="button"
                  disabled={enviando}
                  onClick={() =>
                    setMostrarSenha(
                      (atual) => !atual,
                    )
                  }
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-zinc-500 hover:text-zinc-950 disabled:opacity-50"
                >
                  {mostrarSenha
                    ? "Ocultar"
                    : "Mostrar"}
                </button>
              </div>
            </div>

            {mensagem && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {enviando
                ? "Entrando..."
                : "Acessar minha conta"}
            </button>
          </form>

          <div className="mt-7 border-t border-zinc-200 pt-6 text-center">
            <p className="text-sm text-zinc-500">
              Ainda não possui uma conta?{" "}
              <Link
                href="/academy/cadastro"
                className="font-semibold text-[#8b6219] hover:underline"
              >
                Criar cadastro
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}