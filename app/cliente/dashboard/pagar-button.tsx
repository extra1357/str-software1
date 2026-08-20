"use client";

import { useState } from "react";

export default function PagarButton({ faturaId }: { faturaId: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handlePagar() {
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/cliente/faturas/${faturaId}/checkout`, {
        method: "POST",
      });
      const dados = await resposta.json();

      if (!resposta.ok || !dados.url) {
        setErro(dados.erro || "Nao foi possivel iniciar o pagamento.");
        setCarregando(false);
        return;
      }

      window.location.href = dados.url;
    } catch (erroRequisicao) {
      console.error("[pagar-button] falha na requisicao:", erroRequisicao);
      setErro("Falha de conexao.");
      setCarregando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePagar}
        disabled={carregando}
        className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded px-3 py-1 disabled:opacity-50"
      >
        {carregando ? "Aguarde..." : "Pagar"}
      </button>
      {erro && <p className="text-red-400 text-xs mt-1">{erro}</p>}
    </div>
  );
}
