"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";

function AcademyRedefinirSenhaContent() {
  const searchParams = useSearchParams();

  const [token] = useState(
    () => searchParams.get("token")?.trim() ?? "",
  );

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    window.history.replaceState(
      {},
      "",
      "/academy/redefinir-senha",
    );
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando || sucesso) {
      return;
    }

    setErro(null);

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setErro(
        "Este link de recuperacao e invalido. Solicite um novo link.",
      );
      return;
    }

    if (senha.length < 12 || senha.length > 128) {
      setErro("A senha deve ter entre 12 e 128 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas informadas nao sao iguais.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(
        "/api/academy/auth/redefinir-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            senha,
          }),
        },
      );

      const dados = await resposta.json().catch(() => null);

      if (resposta.status === 403) {
        setErro("Solicitacao nao autorizada.");
        return;
      }

      if (!resposta.ok) {
        setErro(
          dados?.erro ??
            "Nao foi possivel redefinir a senha.",
        );
        return;
      }

      setSenha("");
      setConfirmacao("");
      setSucesso(true);
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
              Criar nova senha
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Defina uma nova senha para sua conta Academy.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm"
          >
            {!token && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                Este link de recuperacao nao possui um token
                valido. Solicite um novo link.
              </div>
            )}

            {sucesso && (
              <div
                role="status"
                aria-live="polite"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
              >
                Sua senha foi redefinida. As sessoes anteriores
                foram invalidadas.
              </div>
            )}

            {erro && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {erro}
              </div>
            )}

            {!sucesso && (
              <>
                <div>
                  <label
                    htmlFor="senha"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Nova senha
                  </label>

                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    value={senha}
                    onChange={(event) =>
                      setSenha(event.target.value)
                    }
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    disabled={carregando || !token}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-[#b27a1d] focus:ring-2 focus:ring-[#b27a1d]/15 disabled:bg-zinc-100"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="confirmacao"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Confirmar nova senha
                  </label>

                  <input
                    id="confirmacao"
                    name="confirmacao"
                    type="password"
                    value={confirmacao}
                    onChange={(event) =>
                      setConfirmacao(event.target.value)
                    }
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    disabled={carregando || !token}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-[#b27a1d] focus:ring-2 focus:ring-[#b27a1d]/15 disabled:bg-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando || !token}
                  className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregando
                    ? "Redefinindo..."
                    : "Redefinir senha"}
                </button>
              </>
            )}

            <div className="mt-6 flex justify-center gap-4 text-sm">
              {sucesso ? (
                <Link
                  href="/academy/login"
                  className="font-semibold text-[#8a601c] hover:underline"
                >
                  Entrar com a nova senha
                </Link>
              ) : (
                <Link
                  href="/academy/recuperar-senha"
                  className="font-medium text-[#8a601c] hover:underline"
                >
                  Solicitar outro link
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function AcademyRedefinirSenhaFallback() {
  return (
    <main className="min-h-screen bg-[#f4f2ed] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-center text-sm text-zinc-600 shadow-sm">
          Carregando recuperacao de senha...
        </div>
      </div>
    </main>
  );
}

export default function AcademyRedefinirSenhaPage() {
  return (
    <Suspense fallback={<AcademyRedefinirSenhaFallback />}>
      <AcademyRedefinirSenhaContent />
    </Suspense>
  );
}