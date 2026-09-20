"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type StatusEditorial = "RASCUNHO" | "PUBLICADA" | "ARQUIVADA";

type Modulo = {
  id: string;
  titulo: string;
  descricao: string | null;
  statusEditorial: StatusEditorial;
  ordem: number;
  ativo: boolean;
  _count?: {
    aulas: number;
  };
};

type TrilhaDetalhe = {
  id: string;
  titulo: string;
  slug: string;
  modulos: Modulo[];
};

type FormularioModulo = {
  titulo: string;
  descricao: string;
  ordem: number;
  statusEditorial: StatusEditorial;
  ativo: boolean;
};

type Props = {
  trilhaId: string;
  onFechar: () => void;
};

function formularioInicial(ordem: number): FormularioModulo {
  return {
    titulo: "",
    descricao: "",
    ordem,
    statusEditorial: "RASCUNHO",
    ativo: true,
  };
}

function proximaOrdem(modulos: Modulo[]) {
  if (modulos.length === 0) {
    return 1;
  }

  return Math.max(...modulos.map((modulo) => modulo.ordem)) + 1;
}

function rotuloStatus(status: StatusEditorial) {
  switch (status) {
    case "PUBLICADA":
      return "Publicado";
    case "ARQUIVADA":
      return "Arquivado";
    default:
      return "Rascunho";
  }
}

export default function AcademyModulosAdmin({
  trilhaId,
  onFechar,
}: Props) {
  const [trilha, setTrilha] = useState<TrilhaDetalhe | null>(null);
  const [formulario, setFormulario] = useState<FormularioModulo>(
    formularioInicial(1),
  );
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarTrilha = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `/api/admin/academy/trilhas/${encodeURIComponent(trilhaId)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel carregar os modulos.",
        );
      }

      const trilhaRecebida = dados?.trilha as TrilhaDetalhe | undefined;

      if (!trilhaRecebida) {
        throw new Error("Resposta invalida ao carregar a trilha.");
      }

      setTrilha(trilhaRecebida);

      if (!editandoId) {
        setFormulario(
          formularioInicial(proximaOrdem(trilhaRecebida.modulos ?? [])),
        );
      }

      console.info(
        `[ACADEMY][CMS][MODULOS][UI][CARREGAR][OK] trilha=${trilhaId} total=${trilhaRecebida.modulos?.length ?? 0}`,
      );
    } catch (falha) {
      const mensagem =
        falha instanceof Error
          ? falha.message
          : "Nao foi possivel carregar os modulos.";

      console.error(
        `[ACADEMY][CMS][MODULOS][UI][CARREGAR][ERRO] trilha=${trilhaId}`,
        falha,
      );

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [trilhaId]);

  useEffect(() => {
    void carregarTrilha();
  }, [carregarTrilha]);

  function novoModulo() {
    const modulos = trilha?.modulos ?? [];

    setEditandoId(null);
    setFormulario(formularioInicial(proximaOrdem(modulos)));
    setErro("");
    setSucesso("");
  }

  function editarModulo(modulo: Modulo) {
    setEditandoId(modulo.id);

    setFormulario({
      titulo: modulo.titulo,
      descricao: modulo.descricao ?? "",
      ordem: modulo.ordem,
      statusEditorial: modulo.statusEditorial,
      ativo: modulo.ativo,
    });

    setErro("");
    setSucesso("");
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (salvando) {
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    const operacao = editandoId ? "ATUALIZAR" : "CRIAR";

    console.info(
      `[ACADEMY][CMS][MODULOS][UI][${operacao}][INICIO] trilha=${trilhaId} modulo=${editandoId ?? "novo"}`,
    );

    try {
      const url = editandoId
        ? `/api/admin/academy/modulos/${encodeURIComponent(editandoId)}`
        : `/api/admin/academy/trilhas/${encodeURIComponent(trilhaId)}/modulos`;

      const resposta = await fetch(url, {
        method: editandoId ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          ordem: formulario.ordem,
          statusEditorial: formulario.statusEditorial,
          ativo: formulario.ativo,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel salvar o modulo.",
        );
      }

      console.info(
        `[ACADEMY][CMS][MODULOS][UI][${operacao}][OK] trilha=${trilhaId} modulo=${dados?.modulo?.id ?? editandoId ?? "novo"}`,
      );

      setSucesso(
        editandoId
          ? "Modulo atualizado com sucesso."
          : "Modulo criado com sucesso.",
      );

      setEditandoId(null);

      const respostaAtualizada = await fetch(
        `/api/admin/academy/trilhas/${encodeURIComponent(trilhaId)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const dadosAtualizados = await respostaAtualizada.json().catch(
        () => null,
      );

      if (!respostaAtualizada.ok || !dadosAtualizados?.trilha) {
        throw new Error(
          dadosAtualizados?.erro ||
            "Modulo salvo, mas a lista nao pôde ser atualizada.",
        );
      }

      const atualizada = dadosAtualizados.trilha as TrilhaDetalhe;

      setTrilha(atualizada);
      setFormulario(
        formularioInicial(proximaOrdem(atualizada.modulos ?? [])),
      );
    } catch (falha) {
      const mensagem =
        falha instanceof Error
          ? falha.message
          : "Nao foi possivel salvar o modulo.";

      console.error(
        `[ACADEMY][CMS][MODULOS][UI][${operacao}][ERRO] trilha=${trilhaId} modulo=${editandoId ?? "novo"}`,
        falha,
      );

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
            STR Academy
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">
            Modulos da trilha
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {trilha
              ? `Trilha: ${trilha.titulo}`
              : "Carregando trilha..."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={novoModulo}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-400/20"
          >
            Novo modulo
          </button>

          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/5"
          >
            Voltar para trilhas
          </button>
        </div>
      </div>

      {erro ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      ) : null}

      {sucesso ? (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {sucesso}
        </div>
      ) : null}

      <form
        onSubmit={salvar}
        className="mt-6 grid gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div>
          <h4 className="text-lg font-bold text-white">
            {editandoId ? "Editar modulo" : "Novo modulo"}
          </h4>

          <p className="mt-1 text-sm text-slate-400">
            O modulo organiza um conjunto de aulas dentro desta trilha.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Titulo
          <input
            type="text"
            required
            minLength={3}
            maxLength={160}
            value={formulario.titulo}
            onChange={(evento) =>
              setFormulario((atual) => ({
                ...atual,
                titulo: evento.target.value,
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            placeholder="Ex.: Fundamentos da Web"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Descricao
          <textarea
            maxLength={2000}
            rows={4}
            value={formulario.descricao}
            onChange={(evento) =>
              setFormulario((atual) => ({
                ...atual,
                descricao: evento.target.value,
              }))
            }
            className="resize-y rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            placeholder="Explique o que o aluno aprendera neste modulo."
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            Ordem
            <input
              type="number"
              required
              min={1}
              max={9999}
              value={formulario.ordem}
              onChange={(evento) =>
                setFormulario((atual) => ({
                  ...atual,
                  ordem: Number(evento.target.value),
                }))
              }
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            Status editorial
            <select
              value={formulario.statusEditorial}
              onChange={(evento) =>
                setFormulario((atual) => ({
                  ...atual,
                  statusEditorial:
                    evento.target.value as StatusEditorial,
                }))
              }
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADA">Publicado</option>
              <option value="ARQUIVADA">Arquivado</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
          <input
            type="checkbox"
            checked={formulario.ativo}
            onChange={(evento) =>
              setFormulario((atual) => ({
                ...atual,
                ativo: evento.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          Modulo ativo
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando
              ? "Salvando..."
              : editandoId
                ? "Salvar alteracoes"
                : "Criar modulo"}
          </button>

          {editandoId ? (
            <button
              type="button"
              onClick={novoModulo}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5"
            >
              Cancelar edicao
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h4 className="text-lg font-black text-white">
              Modulos cadastrados
            </h4>
            <p className="mt-1 text-sm text-slate-400">
              Os modulos aparecem na ordem definida abaixo.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {trilha?.modulos?.length ?? 0} modulo(s)
          </span>
        </div>

        {carregando ? (
          <p className="mt-5 text-sm text-slate-400">
            Carregando modulos...
          </p>
        ) : !trilha?.modulos?.length ? (
          <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
            Nenhum modulo cadastrado nesta trilha.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {trilha.modulos.map((modulo) => (
              <article
                key={modulo.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                      Ordem {modulo.ordem}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                      {rotuloStatus(modulo.statusEditorial)}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                      {modulo.ativo ? "Ativo" : "Inativo"}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                      {modulo._count?.aulas ?? 0} aula(s)
                    </span>
                  </div>

                  <h5 className="mt-3 text-base font-black text-white">
                    {modulo.titulo}
                  </h5>

                  {modulo.descricao ? (
                    <p className="mt-1 text-sm text-slate-400">
                      {modulo.descricao}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => editarModulo(modulo)}
                  className="shrink-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
                >
                  Editar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}