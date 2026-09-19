"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AcademyRecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro(null);
    setMensagem(null);

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || emailNormalizado.length > 254) {
      setErro("Informe um e-mail valido.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(
        "/api/academy/auth/recuperar-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailNormalizado,
          }),
        },
      );

      const dados = await resposta.json().catch(() => null);

      if (resposta.status === 403) {
        setErro("Solicitacao nao autorizada.");
        return;
      }

      if (resposta.status === 503) {
        setErro(
          "O servico esta temporariamente indisponivel. Tente novamente.",
        );
        return;
      }

      if (!resposta.ok) {
        setErro(
          "Nao foi possivel processar a solicitacao. Tente novamente.",
        );
        return;
      }

      setMensagem(
        dados?.mensagem ??
          "Se existir uma conta Academy ativa e verificada com este e-mail, enviaremos as instrucoes para redefinir a senha.",
      );
    } catch {
      setErro(
        "Nao foi possivel conectar ao servico. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f2ed] px-6 py-12 text-zinc-800">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/academy"
              className="text-sm font-bold tracking-[0.18em] text-[#9a6a18]"
            >
              STR ACADEMY
            </Link>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900">
              Recuperar senha
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Informe o e-mail utilizado na sua conta Academy.
              Se a conta estiver disponível, enviaremos um link
              seguro para criar uma nova senha.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm"
          >
            {mensagem && (
              <div
                role="status"
                aria-live="polite"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
              >
                {mensagem}
              </div>
            )}

            {erro && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </div>
            )}

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={254}
              required
              disabled={carregando}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-[#b27a1d] focus:ring-2 focus:ring-[#b27a1d]/15 disabled:bg-zinc-100"
            />

            <button
              type="submit"
              disabled={carregando}
              className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando
                ? "Enviando..."
                : "Enviar link de recuperacao"}
            </button>

            <div className="mt-6 text-center">
              <Link
                href="/academy/login"
                className="text-sm font-medium text-[#8a601c] hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}