"use client";

import {
  useState,
  type FormEvent,
} from "react";

type Destinatario = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

type Edicao = {
  nome: string;
  email: string;
};

type RespostaApi = {
  erro?: string;
  destinatario?: Destinatario;
};

type DestinatariosLeadsAdminProps = {
  destinatariosIniciais: Destinatario[];
};

function ordenarDestinatarios(
  lista: Destinatario[],
): Destinatario[] {
  return [...lista].sort((a, b) => {
    if (a.ativo !== b.ativo) {
      return a.ativo ? -1 : 1;
    }

    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

function criarEdicoes(
  lista: Destinatario[],
): Record<string, Edicao> {
  return Object.fromEntries(
    lista.map((destinatario) => [
      destinatario.id,
      {
        nome: destinatario.nome,
        email: destinatario.email,
      },
    ]),
  );
}

async function lerResposta(
  resposta: Response,
): Promise<RespostaApi> {
  try {
    const dados: unknown = await resposta.json();

    if (typeof dados === "object" && dados !== null) {
      return dados as RespostaApi;
    }

    return {};
  } catch {
    return {};
  }
}

export default function DestinatariosLeadsAdmin({
  destinatariosIniciais,
}: DestinatariosLeadsAdminProps) {
  const [destinatarios, setDestinatarios] = useState(
    () => ordenarDestinatarios(destinatariosIniciais),
  );

  const [edicoes, setEdicoes] = useState<
    Record<string, Edicao>
  >(() => criarEdicoes(destinatariosIniciais));

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [criando, setCriando] = useState(false);

  const [processandoId, setProcessandoId] =
    useState<string | null>(null);

  const [erro, setErro] =
    useState<string | null>(null);

  const [mensagem, setMensagem] =
    useState<string | null>(null);

  function limparAvisos() {
    setErro(null);
    setMensagem(null);
  }

  function atualizarDestinatarioLocal(
    atualizado: Destinatario,
  ) {
    setDestinatarios((atuais) =>
      ordenarDestinatarios(
        atuais.map((item) =>
          item.id === atualizado.id
            ? atualizado
            : item,
        ),
      ),
    );

    setEdicoes((atuais) => ({
      ...atuais,
      [atualizado.id]: {
        nome: atualizado.nome,
        email: atualizado.email,
      },
    }));
  }

  async function cadastrar(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();
    limparAvisos();

    const nome = novoNome.trim();
    const email = novoEmail.trim().toLowerCase();

    if (nome.length < 2 || nome.length > 120) {
      setErro(
        "O nome deve ter entre 2 e 120 caracteres.",
      );
      return;
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setCriando(true);

    try {
      const resposta = await fetch(
        "/api/admin/destinatarios-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
          }),
        },
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok || !dados.destinatario) {
        setErro(
          dados.erro ??
            "Não foi possível cadastrar o destinatário.",
        );
        return;
      }

      setDestinatarios((atuais) =>
        ordenarDestinatarios([
          ...atuais,
          dados.destinatario as Destinatario,
        ]),
      );

      setEdicoes((atuais) => ({
        ...atuais,
        [dados.destinatario!.id]: {
          nome: dados.destinatario!.nome,
          email: dados.destinatario!.email,
        },
      }));

      setNovoNome("");
      setNovoEmail("");
      setMensagem("Destinatário cadastrado com sucesso.");
    } catch (erroRequisicao) {
      console.error(
        "[destinatarios-leads-admin] falha ao cadastrar:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCriando(false);
    }
  }

  async function salvar(id: string) {
    limparAvisos();

    const edicao = edicoes[id];

    if (!edicao) {
      setErro("Dados de edição não encontrados.");
      return;
    }

    const nome = edicao.nome.trim();
    const email = edicao.email.trim().toLowerCase();

    if (nome.length < 2 || nome.length > 120) {
      setErro(
        "O nome deve ter entre 2 e 120 caracteres.",
      );
      return;
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setProcessandoId(id);

    try {
      const resposta = await fetch(
        `/api/admin/destinatarios-leads/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
          }),
        },
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok || !dados.destinatario) {
        setErro(
          dados.erro ??
            "Não foi possível salvar as alterações.",
        );
        return;
      }

      atualizarDestinatarioLocal(dados.destinatario);
      setMensagem("Destinatário atualizado com sucesso.");
    } catch (erroRequisicao) {
      console.error(
        "[destinatarios-leads-admin] falha ao atualizar:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function alternarSituacao(
    destinatario: Destinatario,
  ) {
    limparAvisos();
    setProcessandoId(destinatario.id);

    try {
      const resposta = await fetch(
        `/api/admin/destinatarios-leads/${encodeURIComponent(destinatario.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ativo: !destinatario.ativo,
          }),
        },
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok || !dados.destinatario) {
        setErro(
          dados.erro ??
            "Não foi possível alterar a situação.",
        );
        return;
      }

      atualizarDestinatarioLocal(dados.destinatario);

      setMensagem(
        dados.destinatario.ativo
          ? "Destinatário ativado com sucesso."
          : "Destinatário desativado com sucesso.",
      );
    } catch (erroRequisicao) {
      console.error(
        "[destinatarios-leads-admin] falha ao alterar situação:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function remover(
    destinatario: Destinatario,
  ) {
    const confirmou = window.confirm(
      `Remover o destinatário "${destinatario.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    limparAvisos();
    setProcessandoId(destinatario.id);

    try {
      const resposta = await fetch(
        `/api/admin/destinatarios-leads/${encodeURIComponent(destinatario.id)}`,
        {
          method: "DELETE",
        },
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        setErro(
          dados.erro ??
            "Não foi possível remover o destinatário.",
        );
        return;
      }

      setDestinatarios((atuais) =>
        atuais.filter(
          (item) => item.id !== destinatario.id,
        ),
      );

      setEdicoes((atuais) => {
        const proximas = { ...atuais };
        delete proximas[destinatario.id];
        return proximas;
      });

      setMensagem("Destinatário removido com sucesso.");
    } catch (erroRequisicao) {
      console.error(
        "[destinatarios-leads-admin] falha ao remover:",
        erroRequisicao,
      );

      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">
          Notificações
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Destinatários dos leads
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Os destinatários ativos receberão por e-mail os
          dados enviados pelo formulário de contato.
        </p>
      </header>

      {erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div
          role="status"
          className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          {mensagem}
        </div>
      )}

      <form
        onSubmit={cadastrar}
        className="grid gap-4 rounded-xl border border-white/10 bg-slate-900 p-5 md:grid-cols-[1fr_1.4fr_auto] md:items-end"
      >
        <div>
          <label
            htmlFor="novo-nome"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Nome ou setor
          </label>

          <input
            id="novo-nome"
            value={novoNome}
            onChange={(evento) =>
              setNovoNome(evento.target.value)
            }
            maxLength={120}
            placeholder="Ex.: Comercial STR"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="novo-email"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            E-mail
          </label>

          <input
            id="novo-email"
            type="email"
            value={novoEmail}
            onChange={(evento) =>
              setNovoEmail(evento.target.value)
            }
            maxLength={254}
            placeholder="contato@empresa.com.br"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={criando}
          className="rounded-lg bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {criando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {destinatarios.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-300">
          Nenhum destinatário foi cadastrado. Cadastre
          primeiro o endereço principal da STR.
        </div>
      ) : (
        <div className="space-y-4">
          {destinatarios.map((destinatario) => {
            const edicao =
              edicoes[destinatario.id] ?? {
                nome: destinatario.nome,
                email: destinatario.email,
              };

            const processando =
              processandoId === destinatario.id;

            return (
              <article
                key={destinatario.id}
                className="rounded-xl border border-white/10 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="grid flex-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`nome-${destinatario.id}`}
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400"
                      >
                        Nome ou setor
                      </label>

                      <input
                        id={`nome-${destinatario.id}`}
                        value={edicao.nome}
                        onChange={(evento) =>
                          setEdicoes((atuais) => ({
                            ...atuais,
                            [destinatario.id]: {
                              ...edicao,
                              nome: evento.target.value,
                            },
                          }))
                        }
                        maxLength={120}
                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`email-${destinatario.id}`}
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400"
                      >
                        E-mail
                      </label>

                      <input
                        id={`email-${destinatario.id}`}
                        type="email"
                        value={edicao.email}
                        onChange={(evento) =>
                          setEdicoes((atuais) => ({
                            ...atuais,
                            [destinatario.id]: {
                              ...edicao,
                              email: evento.target.value,
                            },
                          }))
                        }
                        maxLength={254}
                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void salvar(destinatario.id)
                      }
                      disabled={processando}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
                    >
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void alternarSituacao(destinatario)
                      }
                      disabled={processando}
                      className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                    >
                      {destinatario.ativo
                        ? "Desativar"
                        : "Ativar"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void remover(destinatario)
                      }
                      disabled={processando}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span
                    className={
                      destinatario.ativo
                        ? "rounded-full bg-green-500/10 px-3 py-1 font-bold text-green-400"
                        : "rounded-full bg-slate-700 px-3 py-1 font-bold text-slate-300"
                    }
                  >
                    {destinatario.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>

                  <span>
                    Cadastrado em{" "}
                    {new Date(
                      destinatario.createdAt,
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}