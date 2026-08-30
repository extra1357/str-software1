"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();

    setErro(null);

    if (!token) {
      setErro(
        "Este link de recuperação é inválido. Solicite um novo link.",
      );
      return;
    }

    if (senha.length < 12 || senha.length > 128) {
      setErro("A senha deve ter entre 12 e 128 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas informadas não são iguais.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(
        "/api/cliente/auth/redefinir-senha",
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

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.erro ||
            "Não foi possível redefinir a senha.",
        );
        return;
      }

      setSenha("");
      setConfirmacao("");
      setSucesso(true);
    } catch (erroRequisicao) {
      console.error(
        "[cliente/redefinir-senha] falha na requisição:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
        <div className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-5 text-center">
          <h1 className="text-2xl font-bold">
            Senha <span className="text-blue-500">redefinida</span>
          </h1>

          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
            Sua senha foi alterada com sucesso.
          </div>

          <p className="text-sm text-slate-400">
            Por segurança, faça login novamente utilizando a nova senha.
          </p>

          <a
            href="/cliente/login"
            className="block w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
          >
            Ir para o login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Nova <span className="text-blue-500">senha</span>
        </h1>

        <p className="text-sm text-slate-400 text-center">
          Escolha uma nova senha com pelo menos 12 caracteres.
        </p>

        {!token && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            Link de recuperação inválido. Solicite um novo link.
          </div>
        )}

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {erro}
          </div>
        )}

        <div>
          <label
            htmlFor="senha"
            className="block text-sm text-slate-400 mb-2"
          >
            Nova senha
          </label>

          <input
            id="senha"
            name="senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmacao"
            className="block text-sm text-slate-400 mb-2"
          >
            Confirmar nova senha
          </label>

          <input
            id="confirmacao"
            name="confirmacao"
            type="password"
            value={confirmacao}
            onChange={(evento) =>
              setConfirmacao(evento.target.value)
            }
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={carregando || !token}
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50"
        >
          {carregando
            ? "Redefinindo..."
            : "Redefinir senha"}
        </button>

        <a
          href="/cliente/recuperar-senha"
          className="block text-center text-sm text-slate-400 hover:text-white transition"
        >
          Solicitar outro link
        </a>
      </form>
    </main>
  );
}