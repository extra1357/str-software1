"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Nivel = "APRENDIZ" | "JUNIOR" | "OPERACIONAL";
type Acesso = "PUBLICA" | "ALUNOS" | "INTERNA";
type StatusEditorial = "RASCUNHO" | "PUBLICADA" | "ARQUIVADA";

type Trilha = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  nivel: Nivel;
  acesso: Acesso;
  statusEditorial: StatusEditorial;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    modulos: number;
    matriculas: number;
  };
};

type Formulario = {
  titulo: string;
  slug: string;
  descricao: string;
  nivel: Nivel;
  acesso: Acesso;
  statusEditorial: StatusEditorial;
  ativo: boolean;
};

const FORMULARIO_VAZIO: Formulario = {
  titulo: "",
  slug: "",
  descricao: "",
  nivel: "APRENDIZ",
  acesso: "ALUNOS",
  statusEditorial: "RASCUNHO",
  ativo: true,
};

function gerarSlug(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function rotuloNivel(nivel: Nivel) {
  const rotulos: Record<Nivel, string> = {
    APRENDIZ: "Aprendiz",
    JUNIOR: "Júnior",
    OPERACIONAL: "Operacional",
  };

  return rotulos[nivel];
}

function rotuloAcesso(acesso: Acesso) {
  const rotulos: Record<Acesso, string> = {
    PUBLICA: "Pública",
    ALUNOS: "Alunos cadastrados",
    INTERNA: "Uso interno",
  };

  return rotulos[acesso];
}

function rotuloStatus(status: StatusEditorial) {
  const rotulos: Record<StatusEditorial, string> = {
    RASCUNHO: "Rascunho",
    PUBLICADA: "Publicada",
    ARQUIVADA: "Arquivada",
  };

  return rotulos[status];
}

export default function AcademyTrilhasAdmin() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [formulario, setFormulario] =
    useState<Formulario>(FORMULARIO_VAZIO);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarTrilhas = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/admin/academy/trilhas", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.erro || "Não foi possível carregar as trilhas.",
        );
      }

      setTrilhas(Array.isArray(dados.trilhas) ? dados.trilhas : []);
    } catch (error) {
      console.error(
        "[ACADEMY][CMS][TRILHAS][UI][CARREGAR][ERRO]",
        error,
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Falha inesperada ao carregar as trilhas.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarTrilhas();
  }, [carregarTrilhas]);

  function alterar<K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K],
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function alterarTitulo(valor: string) {
    setFormulario((anterior) => ({
      ...anterior,
      titulo: valor,
      slug: slugManual ? anterior.slug : gerarSlug(valor),
    }));
  }

  function alterarSlug(valor: string) {
    setSlugManual(true);
    alterar("slug", gerarSlug(valor));
  }

  function novaTrilha() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VAZIO);
    setSlugManual(false);
    setErro("");
    setSucesso("");
  }

  function editarTrilha(trilha: Trilha) {
    setEditandoId(trilha.id);
    setSlugManual(true);

    setFormulario({
      titulo: trilha.titulo,
      slug: trilha.slug,
      descricao: trilha.descricao ?? "",
      nivel: trilha.nivel,
      acesso: trilha.acesso,
      statusEditorial: trilha.statusEditorial,
      ativo: trilha.ativo,
    });

    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSalvando(true);
    setErro("");
    setSucesso("");

    const operacao = editandoId ? "ATUALIZAR" : "CRIAR";

    console.info(
      `[ACADEMY][CMS][TRILHAS][UI][${operacao}][INICIO]`,
      {
        id: editandoId,
        slug: formulario.slug,
      },
    );

    try {
      const endpoint = editandoId
        ? `/api/admin/academy/trilhas/${editandoId}`
        : "/api/admin/academy/trilhas";

      const response = await fetch(endpoint, {
        method: editandoId ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.erro || "Não foi possível salvar a trilha.",
        );
      }

      console.info(
        `[ACADEMY][CMS][TRILHAS][UI][${operacao}][OK]`,
        {
          id: dados.trilha?.id,
          slug: dados.trilha?.slug,
        },
      );

      setSucesso(
        editandoId
          ? "Trilha atualizada com sucesso."
          : "Trilha criada com sucesso.",
      );

      setEditandoId(null);
      setFormulario(FORMULARIO_VAZIO);
      setSlugManual(false);

      await carregarTrilhas();
    } catch (error) {
      console.error(
        `[ACADEMY][CMS][TRILHAS][UI][${operacao}][ERRO]`,
        error,
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Falha inesperada ao salvar a trilha.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
              Trilhas
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              {editandoId ? "Editar trilha" : "Nova trilha"}
            </h3>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Organize o percurso educacional que depois receberá
              módulos e aulas.
            </p>
          </div>

          {editandoId ? (
            <button
              type="button"
              onClick={novaTrilha}
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancelar edição
            </button>
          ) : null}
        </div>

        {erro ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            {erro}
          </div>
        ) : null}

        {sucesso ? (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
          >
            {sucesso}
          </div>
        ) : null}

        <form
          onSubmit={salvar}
          className="mt-6 grid gap-5 lg:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Título
            </span>

            <input
              required
              minLength={3}
              maxLength={160}
              value={formulario.titulo}
              onChange={(event) => alterarTitulo(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-blue-500/60"
              placeholder="Ex.: Fundamentos de Desenvolvimento"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Endereço da trilha
            </span>

            <input
              required
              maxLength={180}
              value={formulario.slug}
              onChange={(event) => alterarSlug(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 font-mono text-sm text-white outline-none transition focus:border-blue-500/60"
              placeholder="fundamentos-de-desenvolvimento"
            />

            <span className="block text-xs text-slate-500">
              Usado no endereço da página. Letras minúsculas, números
              e hífens.
            </span>
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-300">
              Descrição
            </span>

            <textarea
              rows={4}
              maxLength={2000}
              value={formulario.descricao}
              onChange={(event) =>
                alterar("descricao", event.target.value)
              }
              className="w-full resize-y rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-blue-500/60"
              placeholder="Explique o objetivo e o conteúdo geral da trilha."
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Nível
            </span>

            <select
              value={formulario.nivel}
              onChange={(event) =>
                alterar("nivel", event.target.value as Nivel)
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white"
            >
              <option value="APRENDIZ">Aprendiz</option>
              <option value="JUNIOR">Júnior</option>
              <option value="OPERACIONAL">Operacional</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Visibilidade
            </span>

            <select
              value={formulario.acesso}
              onChange={(event) =>
                alterar("acesso", event.target.value as Acesso)
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white"
            >
              <option value="PUBLICA">Pública</option>
              <option value="ALUNOS">Alunos cadastrados</option>
              <option value="INTERNA">Uso interno</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Status editorial
            </span>

            <select
              value={formulario.statusEditorial}
              onChange={(event) =>
                alterar(
                  "statusEditorial",
                  event.target.value as StatusEditorial,
                )
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white"
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="ARQUIVADA">Arquivada</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900 px-4 py-3">
            <input
              type="checkbox"
              checked={formulario.ativo}
              onChange={(event) =>
                alterar("ativo", event.target.checked)
              }
              className="h-4 w-4"
            />

            <span>
              <span className="block text-sm font-semibold text-white">
                Trilha ativa
              </span>

              <span className="block text-xs text-slate-500">
                Desative para retirar a trilha da operação sem
                excluí-la.
              </span>
            </span>
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando
                ? "Salvando..."
                : editandoId
                  ? "Salvar alterações"
                  : "Criar trilha"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">
              Trilhas cadastradas
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {trilhas.length} trilha(s) encontrada(s).
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarTrilhas()}
            disabled={carregando}
            className="w-fit rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
          >
            {carregando ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregando ? (
          <p className="mt-6 text-sm text-slate-400">
            Carregando trilhas...
          </p>
        ) : trilhas.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">
              Nenhuma trilha cadastrada.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {trilhas.map((trilha) => (
              <article
                key={trilha.id}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-white">
                        {trilha.titulo}
                      </h4>

                      {!trilha.ativo ? (
                        <span className="rounded-full border border-red-500/30 bg-red-950/30 px-2 py-1 text-xs font-bold text-red-300">
                          Inativa
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 break-all font-mono text-xs text-slate-500">
                      /academy/trilhas/{trilha.slug}
                    </p>

                    {trilha.descricao ? (
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
                        {trilha.descricao}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                        {rotuloNivel(trilha.nivel)}
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                        {rotuloAcesso(trilha.acesso)}
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                        {rotuloStatus(trilha.statusEditorial)}
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-400">
                        {trilha._count?.modulos ?? 0} módulo(s)
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-400">
                        {trilha._count?.matriculas ?? 0} matrícula(s)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => editarTrilha(trilha)}
                    className="shrink-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
                  >
                    Editar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}