"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClienteLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await fetch("/api/cliente/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Nao foi possivel entrar.");
        setCarregando(false);
        return;
      }

      router.push("/cliente/dashboard");
      router.refresh();
    } catch (erroRequisicao) {
      console.error("[cliente/login/page] falha na requisicao:", erroRequisicao);
      setErro("Falha de conexao. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Area do <span className="text-blue-500">Cliente</span>
        </h1>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {erro}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-slate-400 mb-2">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm text-slate-400 mb-2">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <a
          href="/cliente/recuperar-senha"
          className="block text-right text-sm text-blue-400 hover:text-blue-300 transition"
        >
          Esqueci minha senha
        </a>

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <a href="/" className="block text-center text-sm text-slate-400 hover:text-white transition mt-4">
          Voltar para o site
        </a>
      </form>
    </main>
  );
}
