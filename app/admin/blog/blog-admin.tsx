"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  leituraMinutos: number | null;
  imagemCapa: string | null;
  status: string;
  destaque: boolean;
  regioes: string[];
  servicos: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  ctaTexto: string | null;
  ctaUrl: string | null;
  publicadoEm: string | null;
  agendadoPara: string | null;
  createdAt: string;
  updatedAt: string;
};

type Formulario = {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  leituraMinutos: string;
  imagemCapa: string;
  status: string;
  destaque: boolean;
  regioes: string;
  servicos: string;
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  ctaTexto: string;
  ctaUrl: string;
  agendadoPara: string;
};

const FORMULARIO_VAZIO: Formulario = {
  titulo: "",
  slug: "",
  resumo: "",
  conteudo: "",
  categoria: "",
  leituraMinutos: "",
  imagemCapa: "",
  status: "RASCUNHO",
  destaque: false,
  regioes: "",
  servicos: "",
  seoTitle: "",
  seoDescription: "",
  canonical: "",
  ctaTexto: "",
  ctaUrl: "",
  agendadoPara: "",
};

function dataBR(valor: string | null) {
  if (!valor) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}

function dataHoraInput(valor: string | null) {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "";

  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

function gerarSlug(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function listaParaTexto(lista: string[]) {
  return lista.join(", ");
}

function textoParaLista(valor: string) {
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function statusClasse(status: string) {
  switch (status) {
    case "PUBLICADO":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "AGENDADO":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    case "ARQUIVADO":
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }
}

export function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [formulario, setFormulario] =
    useState<Formulario>(FORMULARIO_VAZIO);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editorAberto, setEditorAberto] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const conteudoRef = useRef<HTMLTextAreaElement | null>(null);

  const carregarPosts = useCallback(async () => {
    setErro("");

    try {
      const response = await fetch("/api/admin/posts", {
        cache: "no-store",
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.erro || "Falha ao carregar publicações.",
        );
      }

      setPosts(resultado.posts ?? []);
    } catch (error) {
      console.error("[admin/blog] falha ao carregar publicações:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as publicações.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPosts();
  }, [carregarPosts]);

  function alterar<K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K],
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function novaPublicacao() {
    setFormulario(FORMULARIO_VAZIO);
    setEditandoId(null);
    setSlugManual(false);
    setErro("");
    setSucesso("");
    setEditorAberto(true);
  }

  function editar(post: Post) {
    setFormulario({
      titulo: post.titulo,
      slug: post.slug,
      resumo: post.resumo,
      conteudo: post.conteudo,
      categoria: post.categoria,
      leituraMinutos: post.leituraMinutos
        ? String(post.leituraMinutos)
        : "",
      imagemCapa: post.imagemCapa ?? "",
      status: post.status,
      destaque: post.destaque,
      regioes: listaParaTexto(post.regioes),
      servicos: listaParaTexto(post.servicos),
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
      canonical: post.canonical ?? "",
      ctaTexto: post.ctaTexto ?? "",
      ctaUrl: post.ctaUrl ?? "",
      agendadoPara: dataHoraInput(post.agendadoPara),
    });

    setEditandoId(post.id);
    setSlugManual(true);
    setErro("");
    setSucesso("");
    setEditorAberto(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function fecharEditor() {
    setEditorAberto(false);
    setEditandoId(null);
    setFormulario(FORMULARIO_VAZIO);
    setSlugManual(false);
    setErro("");
  }

  function tituloAlterado(valor: string) {
    setFormulario((anterior) => ({
      ...anterior,
      titulo: valor,
      slug: slugManual ? anterior.slug : gerarSlug(valor),
    }));
  }

  function slugAlterado(valor: string) {
    setSlugManual(true);
    alterar("slug", gerarSlug(valor));
  }

  function inserirMarkdown(antes: string, depois = "") {
    const textarea = conteudoRef.current;

    if (!textarea) return;

    const inicio = textarea.selectionStart;
    const fim = textarea.selectionEnd;
    const selecionado = formulario.conteudo.slice(inicio, fim);

    const novoConteudo =
      formulario.conteudo.slice(0, inicio) +
      antes +
      selecionado +
      depois +
      formulario.conteudo.slice(fim);

    alterar("conteudo", novoConteudo);

    requestAnimationFrame(() => {
      textarea.focus();

      const novaPosicao =
        inicio + antes.length + selecionado.length + depois.length;

      textarea.setSelectionRange(novaPosicao, novaPosicao);
    });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const payload = {
        titulo: formulario.titulo,
        slug: formulario.slug,
        resumo: formulario.resumo,
        conteudo: formulario.conteudo,
        categoria: formulario.categoria,
        leituraMinutos: formulario.leituraMinutos,
        imagemCapa: formulario.imagemCapa,
        status: formulario.status,
        destaque: formulario.destaque,
        regioes: textoParaLista(formulario.regioes),
        servicos: textoParaLista(formulario.servicos),
        seoTitle: formulario.seoTitle,
        seoDescription: formulario.seoDescription,
        canonical: formulario.canonical,
        ctaTexto: formulario.ctaTexto,
        ctaUrl: formulario.ctaUrl,
        agendadoPara:
          formulario.status === "AGENDADO"
            ? formulario.agendadoPara
            : null,
      };

      const response = await fetch(
        editandoId
          ? `/api/admin/posts/${editandoId}`
          : "/api/admin/posts",
        {
          method: editandoId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.erro || "Falha ao salvar publicação.",
        );
      }

      setSucesso(
        editandoId
          ? "Publicação atualizada com sucesso."
          : "Publicação criada com sucesso.",
      );

      setEditorAberto(false);
      setEditandoId(null);
      setFormulario(FORMULARIO_VAZIO);
      setSlugManual(false);

      await carregarPosts();
    } catch (error) {
      console.error("[admin/blog] falha ao salvar publicação:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a publicação.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Administração
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Blog / CMS
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Gerencie publicações, conteúdo editorial, SEO e presença regional
            da STR.
          </p>
        </div>

        {!editorAberto ? (
          <button
            type="button"
            onClick={novaPublicacao}
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            + Nova publicação
          </button>
        ) : null}
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {erro}
        </div>
      ) : null}

      {sucesso ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          {sucesso}
        </div>
      ) : null}

      {editorAberto ? (
        <form onSubmit={salvar} className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editandoId ? "Editar publicação" : "Nova publicação"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Conteúdo principal do artigo.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharEditor}
                className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-slate-300"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">
                  Título
                </span>

                <input
                  type="text"
                  required
                  value={formulario.titulo}
                  onChange={(event) => tituloAlterado(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Slug
                </span>

                <input
                  type="text"
                  required
                  value={formulario.slug}
                  onChange={(event) => slugAlterado(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  placeholder="meu-artigo"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Categoria
                </span>

                <input
                  type="text"
                  required
                  value={formulario.categoria}
                  onChange={(event) =>
                    alterar("categoria", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  placeholder="Estratégia, IA Aplicada, Mercado..."
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">
                  Resumo
                </span>

                <textarea
                  required
                  rows={3}
                  value={formulario.resumo}
                  onChange={(event) =>
                    alterar("resumo", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                />
              </label>
            </div>

            <div className="mt-6">
              <span className="text-sm font-medium text-slate-300">
                Conteúdo
              </span>

              <div className="mt-2 flex flex-wrap gap-2 rounded-t-xl border border-white/10 bg-slate-900/80 p-3">
                <button type="button" onClick={() => inserirMarkdown("**", "**")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-bold text-slate-200">
                  B
                </button>

                <button type="button" onClick={() => inserirMarkdown("*", "*")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm italic text-slate-200">
                  I
                </button>

                <button type="button" onClick={() => inserirMarkdown("## ")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200">
                  H2
                </button>

                <button type="button" onClick={() => inserirMarkdown("### ")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200">
                  H3
                </button>

                <button type="button" onClick={() => inserirMarkdown("- ")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200">
                  • Lista
                </button>

                <button type="button" onClick={() => inserirMarkdown("1. ")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200">
                  1. Lista
                </button>

                <button type="button" onClick={() => inserirMarkdown("[", "](https://)")} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-blue-400">
                  Link
                </button>
              </div>

              <textarea
                ref={conteudoRef}
                required
                rows={18}
                value={formulario.conteudo}
                onChange={(event) =>
                  alterar("conteudo", event.target.value)
                }
                className="w-full rounded-b-xl border border-t-0 border-white/10 bg-slate-900 px-4 py-4 font-mono text-sm leading-7 text-slate-200"
                placeholder="Escreva o conteúdo do artigo..."
              />

              <p className="mt-2 text-xs text-slate-500">
                O conteúdo é armazenado em Markdown.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-bold text-white">
                Publicação
              </h2>

              <div className="mt-6 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Status
                  </span>

                  <select
                    value={formulario.status}
                    onChange={(event) =>
                      alterar("status", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  >
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="AGENDADO">Agendado</option>
                    <option value="PUBLICADO">Publicado</option>
                    <option value="ARQUIVADO">Arquivado</option>
                  </select>
                </label>

                {formulario.status === "AGENDADO" ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300">
                      Publicar em
                    </span>

                    <input
                      type="datetime-local"
                      required
                      value={formulario.agendadoPara}
                      onChange={(event) =>
                        alterar("agendadoPara", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    />
                  </label>
                ) : null}

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Tempo de leitura (minutos)
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formulario.leituraMinutos}
                    onChange={(event) =>
                      alterar("leituraMinutos", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Imagem de capa
                  </span>

                  <input
                    type="url"
                    value={formulario.imagemCapa}
                    onChange={(event) =>
                      alterar("imagemCapa", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="https://..."
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={formulario.destaque}
                    onChange={(event) =>
                      alterar("destaque", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  Destacar publicação
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-bold text-white">
                SEO
              </h2>

              <div className="mt-6 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Título SEO
                  </span>

                  <input
                    type="text"
                    value={formulario.seoTitle}
                    onChange={(event) =>
                      alterar("seoTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Meta description
                  </span>

                  <textarea
                    rows={4}
                    value={formulario.seoDescription}
                    onChange={(event) =>
                      alterar("seoDescription", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Canonical
                  </span>

                  <input
                    type="url"
                    value={formulario.canonical}
                    onChange={(event) =>
                      alterar("canonical", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="https://strsoftware.com.br/blog/..."
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-bold text-white">
                Segmentação
              </h2>

              <div className="mt-6 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Regiões
                  </span>

                  <input
                    type="text"
                    value={formulario.regioes}
                    onChange={(event) =>
                      alterar("regioes", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="Sorocaba, Campinas, São Paulo"
                  />

                  <span className="text-xs text-slate-500">
                    Separe por vírgulas.
                  </span>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Serviços
                  </span>

                  <input
                    type="text"
                    value={formulario.servicos}
                    onChange={(event) =>
                      alterar("servicos", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="Sistemas Web, Agentes de IA"
                  />

                  <span className="text-xs text-slate-500">
                    Separe por vírgulas.
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-bold text-white">
                Chamada para ação
              </h2>

              <div className="mt-6 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Texto do CTA
                  </span>

                  <input
                    type="text"
                    value={formulario.ctaTexto}
                    onChange={(event) =>
                      alterar("ctaTexto", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="Fale com a STR"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    URL do CTA
                  </span>

                  <input
                    type="text"
                    value={formulario.ctaUrl}
                    onChange={(event) =>
                      alterar("ctaUrl", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    placeholder="/#contato"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-6">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : editandoId
                  ? "Salvar alterações"
                  : "Salvar publicação"}
            </button>

            <button
              type="button"
              onClick={fecharEditor}
              disabled={salvando}
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Publicações</div>
              <div className="mt-2 text-3xl font-bold text-white">
                {posts.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Publicadas</div>
              <div className="mt-2 text-3xl font-bold text-emerald-400">
                {posts.filter((post) => post.status === "PUBLICADO").length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Rascunhos</div>
              <div className="mt-2 text-3xl font-bold text-amber-400">
                {posts.filter((post) => post.status === "RASCUNHO").length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Destaques</div>
              <div className="mt-2 text-3xl font-bold text-blue-400">
                {posts.filter((post) => post.destaque).length}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Publicações
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Conteúdo editorial cadastrado no CMS.
                </p>
              </div>

              <span className="text-sm text-slate-400">
                {posts.length} registro(s)
              </span>
            </div>

            {carregando ? (
              <p className="mt-6 text-slate-400">Carregando...</p>
            ) : posts.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
                <p className="font-semibold text-white">
                  Nenhuma publicação cadastrada.
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  As publicações atuais do site ainda serão migradas para o CMS.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="px-3 py-3">Publicação</th>
                      <th className="px-3 py-3">Categoria</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Destaque</th>
                      <th className="px-3 py-3">Atualização</th>
                      <th className="px-3 py-3">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-white/5 text-slate-200"
                      >
                        <td className="px-3 py-4">
                          <div className="font-semibold text-white">
                            {post.titulo}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            /blog/{post.slug}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          {post.categoria}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasse(
                              post.status,
                            )}`}
                          >
                            {post.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {post.destaque ? "Sim" : "—"}
                        </td>

                        <td className="px-3 py-4 text-slate-400">
                          {dataBR(post.updatedAt)}
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => editar(post)}
                            className="rounded-lg border border-blue-500/40 px-3 py-2 font-semibold text-blue-400"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}