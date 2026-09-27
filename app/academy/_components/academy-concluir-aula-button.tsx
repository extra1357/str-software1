"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  aulaId: string;
  concluidaInicial: boolean;
};

export function AcademyConcluirAulaButton({
  aulaId,
  concluidaInicial,
}: Props) {
  const router = useRouter();

  const [concluida, setConcluida] =
    useState(concluidaInicial);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  async function concluir() {
    if (concluida || salvando) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const resposta = await fetch(
        "/api/academy/progresso",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aulaId,
          }),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          "Nao foi possivel registrar o progresso.",
        );
      }

      setConcluida(true);

      /*
       * Atualiza Server Components:
       * trilha, progresso e estado da aula passam a refletir o banco.
       */
      router.refresh();
    } catch (erroDesconhecido) {
      console.error(
        "[academy-progresso] falha ao concluir aula:",
        erroDesconhecido,
      );

      setErro(
        "Não foi possível concluir a aula. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (concluida) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-800">
          Aula concluída
        </p>

        <p className="mt-1 text-sm text-emerald-700">
          Seu progresso foi registrado.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={concluir}
        disabled={salvando}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salvando
          ? "Salvando progresso..."
          : "Concluir aula"}
      </button>

      {erro && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-red-700"
        >
          {erro}
        </p>
      )}
    </div>
  );
}