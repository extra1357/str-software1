"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  trilhaId: string;
};

export function AcademyMatricularButton({
  trilhaId,
}: Props) {
  const router = useRouter();

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function matricular() {
    if (enviando) {
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch(
        "/api/academy/matriculas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trilhaId,
          }),
        },
      );

      const dados = (await resposta.json()) as {
        ok?: boolean;
        erro?: string;
      };

      if (!resposta.ok) {
        setErro(
          dados.erro ??
            "Não foi possível realizar a matrícula.",
        );
        return;
      }

      router.push("/academy/minha-area");
      router.refresh();
    } catch {
      setErro(
        "Não foi possível realizar a matrícula.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={matricular}
        disabled={enviando}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Matriculando..." : "Matricular-se"}
      </button>

      {erro && (
        <p
          role="alert"
          className="mt-3 max-w-sm text-sm leading-6 text-red-700"
        >
          {erro}
        </p>
      )}
    </div>
  );
}