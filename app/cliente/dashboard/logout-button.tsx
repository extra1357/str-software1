"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    setSaindo(true);
    try {
      await fetch("/api/cliente/auth/logout", { method: "POST" });
    } catch (erro) {
      console.error("[logout-button] falha ao encerrar sessao:", erro);
    }
    router.push("/cliente/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={saindo}
      className="text-sm text-slate-400 hover:text-white transition border border-white/10 rounded px-4 py-2 disabled:opacity-50"
    >
      {saindo ? "Saindo..." : "Sair"}
    </button>
  );
}
