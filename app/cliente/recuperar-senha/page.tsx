"use client";

import { useState } from "react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();

    setMensagem(null);
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await fetch("/api/cliente/auth/recuperar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível processar a solicitação.");
        return;
      }

      setMensagem(
        dados.mensagem ||
          "Se existir uma conta ativa com este e-mail, enviaremos as instruções para redefinir a senha.",
      );
    } catch (erroRequisicao) {
      console.error(
        "[cliente/recuperar-senha] falha na requisição:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Recuperar <span className="text-blue-500">senha</span>
        </h1>

        <p className="text-sm text-slate-400 text-center">
          Informe o e-mail cadastrado na sua Área do Cliente.
        </p>

        {mensagem && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm text-center">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {erro}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm text-slate-400 mb-2"
          >
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50"
        >
          {carregando ? "Enviando..." : "Enviar link de recuperação"}
        </button>

        <a
          href="/cliente/login"
          className="block text-center text-sm text-slate-400 hover:text-white transition"
        >
          Voltar para o login
        </a>
      </form>
    </main>
  );
}