"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Estado =
  | "PRONTO"
  | "ENVIANDO"
  | "SUCESSO"
  | "ERRO";

function AcademyVerificarEmailContent() {
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token")?.trim() ?? "";

  const tokenValido =
    /^[a-f0-9]{64}$/i.test(token);

  const [estado, setEstado] =
    useState<Estado>("PRONTO");

  const [mensagem, setMensagem] =
    useState<string>("");

  async function confirmarEmail() {
    if (!tokenValido) {
      setEstado("ERRO");
      setMensagem(
        "O link de verificacao e invalido.",
      );
      return;
    }

    if (estado === "ENVIANDO") {
      return;
    }

    setEstado("ENVIANDO");
    setMensagem("");

    try {
      const resposta = await fetch(
        "/api/academy/auth/verificar-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        },
      );

      const dados: unknown =
        await resposta.json();

      const mensagemResposta =
        typeof dados === "object" &&
        dados !== null &&
        "mensagem" in dados &&
        typeof dados.mensagem === "string"
          ? dados.mensagem
          : typeof dados === "object" &&
              dados !== null &&
              "erro" in dados &&
              typeof dados.erro === "string"
            ? dados.erro
            : null;

      if (!resposta.ok) {
        setEstado("ERRO");
        setMensagem(
          mensagemResposta ??
            "Nao foi possivel confirmar seu e-mail.",
        );
        return;
      }

      setEstado("SUCESSO");
      setMensagem(
        mensagemResposta ??
          "E-mail confirmado com sucesso.",
      );
    } catch (erro) {
      console.error(
        "[academy/verificar-email-page] falha na requisicao:",
        erro,
      );

      setEstado("ERRO");
      setMensagem(
        "Nao foi possivel concluir a verificacao. Tente novamente.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f2ed] px-4 py-16">
      <section className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm">
        <header className="bg-[#0d0d0d] px-8 py-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8922A]">
            STR Academy
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white">
            Verificacao de e-mail
          </h1>
        </header>

        <div className="px-8 py-8">
          {!tokenValido ? (
            <>
              <h2 className="text-xl font-semibold text-zinc-900">
                Link invalido
              </h2>

              <p className="mt-3 leading-7 text-zinc-600">
                O link de verificacao nao possui um token valido.
              </p>

              <Link
                href="/academy"
                className="mt-6 inline-flex rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Voltar para STR Academy
              </Link>
            </>
          ) : estado === "SUCESSO" ? (
            <>
              <h2 className="text-xl font-semibold text-zinc-900">
                E-mail confirmado
              </h2>

              <p className="mt-3 leading-7 text-zinc-600">
                {mensagem}
              </p>

              <Link
                href="/academy/login"
                className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Acessar minha conta
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-zinc-900">
                Confirme seu endereco de e-mail
              </h2>

              <p className="mt-3 leading-7 text-zinc-600">
                Para liberar seu acesso, confirme que este endereco de e-mail pertence a voce.
              </p>

              {estado === "ERRO" && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {mensagem}
                </div>
              )}

              <button
                type="button"
                onClick={confirmarEmail}
                disabled={estado === "ENVIANDO"}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {estado === "ENVIANDO"
                  ? "Confirmando..."
                  : "Confirmar meu e-mail"}
              </button>

              <p className="mt-5 text-xs leading-5 text-zinc-500">
                A verificacao somente sera realizada quando voce pressionar o botao acima.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AcademyVerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f2ed] px-4 py-16">
          <section className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm">
            <header className="bg-[#0d0d0d] px-8 py-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8922A]">
                STR Academy
              </p>

              <h1 className="mt-2 text-2xl font-bold text-white">
                Verificacao de e-mail
              </h1>
            </header>

            <div className="px-8 py-8">
              <p className="text-sm text-zinc-600">
                Carregando verificacao...
              </p>
            </div>
          </section>
        </main>
      }
    >
      <AcademyVerificarEmailContent />
    </Suspense>
  );
}