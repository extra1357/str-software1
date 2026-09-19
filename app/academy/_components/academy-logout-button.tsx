"use client";

import { useState } from "react";

export function AcademyLogoutButton() {
  const [saindo, setSaindo] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function sair() {
    if (saindo) {
      return;
    }

    setSaindo(true);
    setErro("");

    try {
      const response = await fetch(
        "/api/academy/auth/logout",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        setErro(
          "Não foi possível encerrar a sessão.",
        );

        setSaindo(false);

        return;
      }

      window.location.replace(
        "/academy/login",
      );
    } catch {
      setErro(
        "Não foi possível conectar ao servidor.",
      );

      setSaindo(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {erro && (
        <span
          role="alert"
          className="hidden text-xs text-red-700 md:block"
        >
          {erro}
        </span>
      )}

      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saindo
          ? "Saindo..."
          : "Sair"}
      </button>
    </div>
  );
}