"use client";

import AcademyConteudoEditor from "./academy-conteudo-editor";
import {
  academyConteudoEstruturadoSchema,
  conteudoEstruturadoParaTexto,
  criarConteudoEstruturadoVazio,
  type AcademyConteudoEstruturado,
} from "@/lib/academy-conteudo";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type StatusEditorial =
  | "RASCUNHO"
  | "PUBLICADA"
  | "ARQUIVADA";

type Aula = {
  id: string;
  moduloId: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  conteudoEstruturado: unknown | null;
  ordem: number;
  statusEditorial: StatusEditorial;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

type ModuloDetalhe = {
  id: string;
  trilhaId: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  statusEditorial: StatusEditorial;
  ativo: boolean;
  trilha: {
    id: string;
    titulo: string;
  };
  aulas: Aula[];
};

type FormularioAula = {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  conteudoEstruturado: AcademyConteudoEstruturado;
  modoLegado: boolean;
  ordem: number;
  statusEditorial: StatusEditorial;
  ativo: boolean;
};

type Props = {
  moduloId: string;
  onFechar: () => void;
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

function proximaOrdem(aulas: Aula[]) {
  if (aulas.length === 0) {
    return 1;
  }

  return Math.max(...aulas.map((aula) => aula.ordem)) + 1;
}

function formularioInicial(ordem: number): FormularioAula {
  return {
    titulo: "",
    slug: "",
    resumo: "",
    conteudo: "",
    conteudoEstruturado: criarConteudoEstruturadoVazio(),
    modoLegado: false,
    ordem,
    statusEditorial: "RASCUNHO",
    ativo: true,
  };
}

export default function AcademyAulasAdmin({
  moduloId,
  onFechar,
}: Props) {
  const [modulo, setModulo] =
    useState<ModuloDetalhe | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioAula>(
      formularioInicial(1),
    );

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [slugAlteradoManual, setSlugAlteradoManual] =
    useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [sucesso, setSucesso] =
    useState<string | null>(null);

  const carregarModulo = useCallback(async () => {
    console.info("[ACADEMY][CMS][AULAS][UI] Carregando modulo", {
      moduloId,
    });

    setCarregando(true);
    setErro(null);

    try {
      const resposta = await fetch(
        `/api/admin/academy/modulos/${moduloId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel carregar o modulo.",
        );
      }

      const moduloCarregado =
        dados.modulo as ModuloDetalhe;

      setModulo(moduloCarregado);

      console.info("[ACADEMY][CMS][AULAS][UI] Modulo carregado", {
        moduloId,
        totalAulas: moduloCarregado.aulas.length,
      });

      return moduloCarregado;
    } catch (falha) {
      console.error(
        "[ACADEMY][CMS][AULAS][UI] Falha ao carregar modulo",
        falha,
      );

      setErro(
        falha instanceof Error
          ? falha.message
          : "Nao foi possivel carregar o modulo.",
      );

      return null;
    } finally {
      setCarregando(false);
    }
  }, [moduloId]);

  useEffect(() => {
    void carregarModulo();
  }, [carregarModulo]);

  function novaAula() {
    const ordem = proximaOrdem(modulo?.aulas ?? []);

    setEditandoId(null);
    setSlugAlteradoManual(false);
    setFormulario(formularioInicial(ordem));
    setErro(null);
    setSucesso(null);
  }

  function editarAula(aula: Aula) {
    setEditandoId(aula.id);
    setSlugAlteradoManual(true);

    const documento = academyConteudoEstruturadoSchema.safeParse(
      aula.conteudoEstruturado,
    );

    setFormulario({
      titulo: aula.titulo,
      slug: aula.slug,
      resumo: aula.resumo ?? "",
      conteudo: aula.conteudo,
      conteudoEstruturado: documento.success
        ? documento.data
        : criarConteudoEstruturadoVazio(),
      modoLegado: !documento.success,
      ordem: aula.ordem,
      statusEditorial: aula.statusEditorial,
      ativo: aula.ativo,
    });

    setErro(null);
    setSucesso(null);

    console.info("[ACADEMY][CMS][AULAS][UI] Editando aula", {
      aulaId: aula.id,
      moduloId,
    });
  }

  function alterarTitulo(valor: string) {
    setFormulario((atual) => ({
      ...atual,
      titulo: valor,
      slug: slugAlteradoManual
        ? atual.slug
        : gerarSlug(valor),
    }));
  }

  function converterConteudoLegado() {
    const textoLegado = formulario.conteudo.trim();

    if (!textoLegado) {
      setErro("Nao existe conteudo legado para converter.");
      return;
    }

    setErro(null);
    setSucesso(null);

    setFormulario((atual) => ({
      ...atual,
      conteudoEstruturado: {
        versao: 1,
        blocos: [
          {
            id:
              typeof crypto !== "undefined" &&
              typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `bloco-${Date.now()}`,
            tipo: "PARAGRAFO",
            texto: atual.conteudo,
          },
        ],
      },
      modoLegado: false,
    }));

    console.info(
      "[ACADEMY][CMS][AULAS][UI] Conteudo legado preparado para editor visual",
      {
        aulaId: editandoId,
        moduloId,
      },
    );

    setSucesso(
      "Conteudo carregado no editor visual. Revise os blocos e salve a aula para concluir a conversao.",
    );
  }
  async function salvarAula(evento: FormEvent) {
    evento.preventDefault();

    setErro(null);
    setSucesso(null);

    const payload = {
      titulo: formulario.titulo.trim(),
      slug: formulario.slug.trim(),
      resumo: formulario.resumo.trim() || null,
      conteudo: formulario.modoLegado
        ? formulario.conteudo.trim()
        : conteudoEstruturadoParaTexto(
            formulario.conteudoEstruturado,
          ),
      conteudoEstruturado: formulario.modoLegado
        ? undefined
        : formulario.conteudoEstruturado,
      ordem: Number(formulario.ordem),
      statusEditorial: formulario.statusEditorial,
      ativo: formulario.ativo,
    };

    if (payload.titulo.length < 3) {
      setErro("Informe um titulo com pelo menos 3 caracteres.");
      return;
    }

    if (!payload.slug) {
      setErro("Informe um slug valido.");
      return;
    }

    if (!payload.conteudo) {
      setErro("Informe o conteudo da aula.");
      return;
    }

    if (
      !Number.isInteger(payload.ordem) ||
      payload.ordem < 1
    ) {
      setErro("Informe uma ordem valida.");
      return;
    }

    const editando = Boolean(editandoId);

    const url = editando
      ? `/api/admin/academy/aulas/${editandoId}`
      : `/api/admin/academy/modulos/${moduloId}/aulas`;

    const metodo = editando ? "PATCH" : "POST";

    console.info("[ACADEMY][CMS][AULAS][UI] Salvando aula", {
      moduloId,
      aulaId: editandoId,
      metodo,
    });

    setSalvando(true);

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel salvar a aula.",
        );
      }

      console.info("[ACADEMY][CMS][AULAS][UI] Aula salva", {
        moduloId,
        aulaId: dados?.aula?.id,
        metodo,
      });

      const moduloAtualizado = await carregarModulo();

      if (!moduloAtualizado) {
        throw new Error(
          "A aula foi salva, mas nao foi possivel atualizar a lista.",
        );
      }

      setEditandoId(null);
      setSlugAlteradoManual(false);

      setFormulario(
        formularioInicial(
          proximaOrdem(moduloAtualizado.aulas),
        ),
      );

      setSucesso(
        editando
          ? "Aula atualizada com sucesso."
          : "Aula criada com sucesso.",
      );
    } catch (falha) {
      console.error(
        "[ACADEMY][CMS][AULAS][UI] Falha ao salvar aula",
        falha,
      );

      setErro(
        falha instanceof Error
          ? falha.message
          : "Nao foi possivel salvar a aula.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando && !modulo) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Voltar para modulos
        </button>

        <p className="text-sm text-slate-400">
          Carregando aulas...
        </p>
      </section>
    );
  }

  if (!modulo) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Voltar para modulos
        </button>

        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {erro || "Modulo nao encontrado."}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            STR Academy / Conteudo
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Aulas de {modulo.titulo}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Trilha: {modulo.trilha.titulo}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={novaAula}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Nova aula
          </button>

          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Voltar para modulos
          </button>
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-300">
          {sucesso}
        </div>
      )}

      <form
        onSubmit={salvarAula}
        className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">
            {editandoId ? "Editar aula" : "Nova aula"}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Cadastre e organize o conteudo da aula utilizando o editor visual por blocos.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              Titulo
            </span>

            <input
              value={formulario.titulo}
              onChange={(evento) =>
                alterarTitulo(evento.target.value)
              }
              maxLength={160}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              Slug
            </span>

            <input
              value={formulario.slug}
              onChange={(evento) => {
                setSlugAlteradoManual(true);

                setFormulario((atual) => ({
                  ...atual,
                  slug: gerarSlug(evento.target.value),
                }));
              }}
              maxLength={180}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">
            Resumo
          </span>

          <textarea
            value={formulario.resumo}
            onChange={(evento) =>
              setFormulario((atual) => ({
                ...atual,
                resumo: evento.target.value,
              }))
            }
            maxLength={2000}
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </label>

        <div className="space-y-3">
          <span className="block text-sm font-medium text-slate-200">
            Conteudo
          </span>

          {formulario.modoLegado ? (
            <div className="space-y-4 rounded-xl border border-amber-800/60 bg-amber-950/20 p-4">
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Conteudo no formato anterior
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-100/70">
                  Esta aula ainda utiliza o conteudo textual original.
                  Nada sera convertido automaticamente.
                </p>
              </div>

              <textarea
                value={formulario.conteudo}
                readOnly
                rows={12}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={converterConteudoLegado}
                  disabled={salvando}
                  className="rounded-lg border border-amber-700 bg-amber-950/40 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-950/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Converter conteudo atual para editor visual
                </button>

                <span className="text-xs text-slate-500">
                  A conversao somente sera gravada quando voce salvar a aula.
                </span>
              </div>
            </div>
          ) : (
            <AcademyConteudoEditor
              valor={formulario.conteudoEstruturado}
              disabled={salvando}
              onChange={(conteudoEstruturado) =>
                setFormulario((atual) => ({
                  ...atual,
                  conteudoEstruturado,
                }))
              }
            />
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              Ordem
            </span>

            <input
              type="number"
              min={1}
              max={9999}
              value={formulario.ordem}
              onChange={(evento) =>
                setFormulario((atual) => ({
                  ...atual,
                  ordem: Number(evento.target.value),
                }))
              }
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              Status editorial
            </span>

            <select
              value={formulario.statusEditorial}
              onChange={(evento) =>
                setFormulario((atual) => ({
                  ...atual,
                  statusEditorial:
                    evento.target.value as StatusEditorial,
                }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="ARQUIVADA">Arquivada</option>
            </select>
          </label>

          <label className="flex items-center gap-3 self-end rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <input
              type="checkbox"
              checked={formulario.ativo}
              onChange={(evento) =>
                setFormulario((atual) => ({
                  ...atual,
                  ativo: evento.target.checked,
                }))
              }
            />

            <span className="text-sm text-slate-200">
              Aula ativa
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando
              ? "Salvando..."
              : editandoId
                ? "Salvar alteracoes"
                : "Criar aula"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={novaAula}
              disabled={salvando}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Cancelar edicao
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            Aulas cadastradas
          </h3>

          <span className="text-sm text-slate-400">
            {modulo.aulas.length} aula(s)
          </span>
        </div>

        {modulo.aulas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
            Nenhuma aula cadastrada neste modulo.
          </div>
        ) : (
          <div className="space-y-3">
            {modulo.aulas.map((aula) => (
              <article
                key={aula.id}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                        Ordem {aula.ordem}
                      </span>

                      <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        {aula.statusEditorial}
                      </span>

                      <span
                        className={`rounded-md px-2 py-1 text-xs ${
                          aula.ativo
                            ? "bg-emerald-950 text-emerald-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {aula.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>

                    <h4 className="mt-3 font-semibold text-white">
                      {aula.titulo}
                    </h4>

                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {aula.slug}
                    </p>

                    {aula.resumo && (
                      <p className="mt-2 text-sm text-slate-400">
                        {aula.resumo}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => editarAula(aula)}
                    className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Editar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}