"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

type ErrosFormulario = {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

type EstadoEnvio =
  | "ocioso"
  | "enviando"
  | "sucesso"
  | "erro";

export default function AcademyCadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [erros, setErros] =
    useState<ErrosFormulario>({});

  const [mensagem, setMensagem] =
    useState<string | null>(null);

  const [estadoEnvio, setEstadoEnvio] =
    useState<EstadoEnvio>("ocioso");

  function validar(): boolean {
    const novosErros: ErrosFormulario = {};

    const nomeNormalizado = nome.trim();
    const emailNormalizado =
      email.trim().toLowerCase();

    if (nomeNormalizado.length < 2) {
      novosErros.nome =
        "Informe seu nome.";
    }

    if (
      !emailNormalizado ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailNormalizado,
      )
    ) {
      novosErros.email =
        "Informe um e-mail válido.";
    }

    if (senha.length < 12) {
      novosErros.senha =
        "Use pelo menos 12 caracteres.";
    }

    if (senha.length > 128) {
      novosErros.senha =
        "A senha deve ter no máximo 128 caracteres.";
    }

    if (confirmarSenha !== senha) {
      novosErros.confirmarSenha =
        "As senhas não coincidem.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (estadoEnvio === "enviando") {
      return;
    }

    setMensagem(null);
    setEstadoEnvio("ocioso");

    if (!validar()) {
      return;
    }

    const nomeNormalizado = nome.trim();
    const emailNormalizado =
      email.trim().toLowerCase();

    setEstadoEnvio("enviando");

    try {
      const resposta = await fetch(
        "/api/academy/auth/cadastro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeNormalizado,
            email: emailNormalizado,
            senha,
          }),
        },
      );

      let dados: {
        mensagem?: string;
        erro?: string;
      } = {};

      try {
        dados = await resposta.json();
      } catch {
        dados = {};
      }

      if (resposta.status === 202) {
        setEstadoEnvio("sucesso");

        setMensagem(
          dados.mensagem ??
            "Se os dados puderem ser utilizados, enviaremos as instruções de verificação para o e-mail informado.",
        );

        setSenha("");
        setConfirmarSenha("");

        return;
      }

      if (resposta.status === 400) {
        setEstadoEnvio("erro");

        setMensagem(
          "Revise os dados informados e tente novamente.",
        );

        return;
      }

      if (resposta.status === 403) {
        setEstadoEnvio("erro");

        setMensagem(
          "Não foi possível validar esta solicitação. Atualize a página e tente novamente.",
        );

        return;
      }

      if (resposta.status === 429) {
        setEstadoEnvio("erro");

        setMensagem(
          "Foram realizadas muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
        );

        return;
      }

      if (resposta.status === 503) {
        setEstadoEnvio("erro");

        setMensagem(
          "O cadastro está temporariamente indisponível. Tente novamente em alguns minutos.",
        );

        return;
      }

      setEstadoEnvio("erro");

      setMensagem(
        "Não foi possível concluir o cadastro. Tente novamente.",
      );
    } catch {
      setEstadoEnvio("erro");

      setMensagem(
        "Não foi possível comunicar com o servidor. Verifique sua conexão e tente novamente.",
      );
    }
  }

  const sucesso =
    estadoEnvio === "sucesso";

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10 bg-[#f4f2ed]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/academy"
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-bold text-[#d2a24a]">
              A
            </span>

            <div>
              <div className="text-sm font-bold tracking-[0.16em] text-zinc-950">
                STR ACADEMY
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Formação técnica
              </div>
            </div>
          </Link>

          <Link
            href="/academy"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            Voltar para a Academy
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-[#b77b16]/25 bg-[#b77b16]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b5b0b]">
            Sua jornada começa aqui
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl lg:text-6xl">
            Construa conhecimento com método.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-zinc-600 sm:text-lg">
            Crie sua conta para acessar as trilhas da
            STR Academy e evoluir da compreensão dos
            fundamentos até a operação de sistemas reais.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-bold text-zinc-700">
                01
              </div>

              <div>
                <h2 className="font-semibold text-zinc-950">
                  Aprenda os fundamentos
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Entenda o que acontece por trás do
                  código, do navegador ao deploy.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-bold text-zinc-700">
                02
              </div>

              <div>
                <h2 className="font-semibold text-zinc-950">
                  Pratique com contexto
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Desenvolvimento, infraestrutura,
                  diagnóstico e segurança conectados.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-bold text-zinc-700">
                03
              </div>

              <div>
                <h2 className="font-semibold text-zinc-950">
                  Evolua com evidência
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Progresso estruturado de Aprendiz a
                  Júnior e Operacional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a6815]">
                Criar conta
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
                Comece sua formação
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Preencha seus dados. Depois confirmaremos
                seu endereço de e-mail.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Nome
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  disabled={sucesso}
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  aria-invalid={Boolean(erros.nome)}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-[#faf9f6] px-4 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Seu nome"
                />

                {erros.nome && (
                  <p className="mt-2 text-sm text-red-700">
                    {erros.nome}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  disabled={sucesso}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  aria-invalid={Boolean(erros.email)}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-[#faf9f6] px-4 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="voce@exemplo.com"
                />

                {erros.email && (
                  <p className="mt-2 text-sm text-red-700">
                    {erros.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Senha
                </label>

                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={
                      mostrarSenha
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    disabled={sucesso}
                    value={senha}
                    onChange={(event) =>
                      setSenha(event.target.value)
                    }
                    aria-invalid={Boolean(erros.senha)}
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-[#faf9f6] px-4 pr-24 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Mínimo de 12 caracteres"
                  />

                  <button
                    type="button"
                    disabled={sucesso}
                    onClick={() =>
                      setMostrarSenha(
                        (valor) => !valor,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 disabled:cursor-not-allowed"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {mostrarSenha
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>

                {erros.senha ? (
                  <p className="mt-2 text-sm text-red-700">
                    {erros.senha}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Utilize pelo menos 12 caracteres.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Confirmar senha
                </label>

                <div className="relative">
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={
                      mostrarConfirmacao
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    maxLength={128}
                    disabled={sucesso}
                    value={confirmarSenha}
                    onChange={(event) =>
                      setConfirmarSenha(
                        event.target.value,
                      )
                    }
                    aria-invalid={Boolean(
                      erros.confirmarSenha,
                    )}
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-[#faf9f6] px-4 pr-24 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#b77b16] focus:ring-4 focus:ring-[#b77b16]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Repita sua senha"
                  />

                  <button
                    type="button"
                    disabled={sucesso}
                    onClick={() =>
                      setMostrarConfirmacao(
                        (valor) => !valor,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 disabled:cursor-not-allowed"
                    aria-label={
                      mostrarConfirmacao
                        ? "Ocultar confirmação da senha"
                        : "Mostrar confirmação da senha"
                    }
                  >
                    {mostrarConfirmacao
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>

                {erros.confirmarSenha && (
                  <p className="mt-2 text-sm text-red-700">
                    {erros.confirmarSenha}
                  </p>
                )}
              </div>

              {mensagem && (
                <div
                  role="status"
                  aria-live="polite"
                  className={
                    sucesso
                      ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
                      : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                  }
                >
                  {mensagem}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  estadoEnvio === "enviando" ||
                  sucesso
                }
                className="flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-950/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {estadoEnvio === "enviando"
                  ? "Enviando..."
                  : sucesso
                    ? "Verifique seu e-mail"
                    : "Criar minha conta"}
              </button>
            </form>

            <div className="mt-7 border-t border-zinc-200 pt-6 text-center">
              <p className="text-sm text-zinc-500">
                Já possui uma conta?{" "}
                <Link
                  href="/academy/login"
                  className="font-semibold text-zinc-950 underline decoration-[#c8922a] decoration-2 underline-offset-4"
                >
                  Entrar na Academy
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
            O acesso às aulas será liberado após a
            confirmação do endereço de e-mail.
          </p>
        </div>
      </section>
    </main>
  );
}