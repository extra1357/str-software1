"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Solicitacao = {
  id: string;
  protocolo: string;
  tipo: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  encerradoEm: string | null;
};

type Mensagem = {
  id: string;
  autorTipo: string;
  mensagem: string;
  createdAt: string;
};

const TIPOS = [
  "SUPORTE",
  "MANUTENCAO",
  "PROBLEMA",
  "ORCAMENTO",
  "ALTERACAO",
  "FINANCEIRO",
  "DOCUMENTO",
  "DUVIDA",
];

const PRIORIDADES = [
  "BAIXA",
  "NORMAL",
  "ALTA",
];

export default function SolicitacoesPanel() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [tipo, setTipo] = useState("SUPORTE");
  const [prioridade, setPrioridade] = useState("NORMAL");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [ticketAberto, setTicketAberto] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Record<string, Mensagem[]>>({});
  const [carregandoConversa, setCarregandoConversa] = useState<string | null>(null);
  const [enviandoMensagem, setEnviandoMensagem] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [erroConversa, setErroConversa] = useState<Record<string, string>>({});

  const carregarSolicitacoes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch("/api/cliente/solicitacoes", {
        method: "GET",
        cache: "no-store",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel carregar as solicitacoes."
        );
      }

      setSolicitacoes(
        Array.isArray(dados?.solicitacoes)
          ? dados.solicitacoes
          : []
      );
    } catch (falha) {
      console.error(
        "[cliente/dashboard] erro ao carregar solicitacoes",
        falha
      );

      setErro(
        falha instanceof Error
          ? falha.message
          : "Erro ao carregar solicitacoes."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarSolicitacoes();
  }, [carregarSolicitacoes]);

  async function criarSolicitacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    try {
      setEnviando(true);
      setErro("");
      setSucesso("");

      const resposta = await fetch("/api/cliente/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          prioridade,
          titulo,
          descricao,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel criar a solicitacao."
        );
      }

      setTitulo("");
      setDescricao("");
      setTipo("SUPORTE");
      setPrioridade("NORMAL");

      setSucesso(
        `Solicitacao ${dados.solicitacao.protocolo} criada com sucesso.`
      );

      await carregarSolicitacoes();
    } catch (falha) {
      console.error(
        "[cliente/dashboard] erro ao criar solicitacao",
        falha
      );

      setErro(
        falha instanceof Error
          ? falha.message
          : "Erro ao criar solicitacao."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function carregarConversa(ticketId: string) {
    try {
      setCarregandoConversa(ticketId);

      setErroConversa((estado) => ({
        ...estado,
        [ticketId]: "",
      }));

      const resposta = await fetch(
        `/api/cliente/solicitacoes/${ticketId}/mensagens`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel carregar a conversa."
        );
      }

      setMensagens((estado) => ({
        ...estado,
        [ticketId]: Array.isArray(dados?.mensagens)
          ? dados.mensagens
          : [],
      }));
    } catch (falha) {
      console.error(
        "[cliente/dashboard] erro ao carregar conversa",
        falha
      );

      setErroConversa((estado) => ({
        ...estado,
        [ticketId]:
          falha instanceof Error
            ? falha.message
            : "Erro ao carregar conversa.",
      }));
    } finally {
      setCarregandoConversa(null);
    }
  }

  async function alternarConversa(ticketId: string) {
    if (ticketAberto === ticketId) {
      setTicketAberto(null);
      return;
    }

    setTicketAberto(ticketId);
    await carregarConversa(ticketId);
  }

  async function enviarResposta(
    evento: FormEvent<HTMLFormElement>,
    ticketId: string
  ) {
    evento.preventDefault();

    const texto = (respostas[ticketId] || "").trim();

    if (!texto) {
      setErroConversa((estado) => ({
        ...estado,
        [ticketId]: "Digite uma mensagem antes de enviar.",
      }));

      return;
    }

    try {
      setEnviandoMensagem(ticketId);

      setErroConversa((estado) => ({
        ...estado,
        [ticketId]: "",
      }));

      const resposta = await fetch(
        `/api/cliente/solicitacoes/${ticketId}/mensagens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mensagem: texto,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Nao foi possivel enviar a mensagem."
        );
      }

      setRespostas((estado) => ({
        ...estado,
        [ticketId]: "",
      }));

      await carregarConversa(ticketId);
    } catch (falha) {
      console.error(
        "[cliente/dashboard] erro ao enviar mensagem",
        falha
      );

      setErroConversa((estado) => ({
        ...estado,
        [ticketId]:
          falha instanceof Error
            ? falha.message
            : "Erro ao enviar mensagem.",
      }));
    } finally {
      setEnviandoMensagem(null);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-black">
          Solicitações
        </h2>

        <p className="text-slate-400 mt-1">
          Abra e acompanhe solicitações pelo seu protocolo.
        </p>
      </div>

      <form
        onSubmit={criarSolicitacao}
        className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-5"
      >
        <div>
          <h3 className="text-lg font-bold">
            Nova solicitação
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Informe os dados abaixo para gerar um protocolo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">
              Tipo
            </span>

            <select
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm"
            >
              {TIPOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">
              Prioridade
            </span>

            <select
              value={prioridade}
              onChange={(evento) => setPrioridade(evento.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm"
            >
              {PRIORIDADES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">
            Título
          </span>

          <input
            type="text"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            maxLength={160}
            required
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm"
            placeholder="Resumo da solicitação"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">
            Descrição
          </span>

          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            maxLength={5000}
            required
            rows={5}
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm resize-y"
            placeholder="Descreva o que você precisa."
          />
        </label>

        {erro && (
          <p className="text-sm text-red-400">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="text-sm text-emerald-400">
            {sucesso}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition"
        >
          {enviando
            ? "Enviando..."
            : "Abrir solicitação"}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">
          Minhas solicitações
        </h3>

        {carregando ? (
          <p className="text-sm text-slate-400">
            Carregando solicitações...
          </p>
        ) : solicitacoes.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nenhuma solicitação registrada.
          </p>
        ) : (
          solicitacoes.map((solicitacao) => {
            const conversaAberta =
              ticketAberto === solicitacao.id;

            const mensagensTicket =
              mensagens[solicitacao.id] || [];

            const encerrada =
              solicitacao.status === "ENCERRADO";

            return (
              <article
                key={solicitacao.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <p className="text-xs text-blue-400 font-mono">
                      {solicitacao.protocolo}
                    </p>

                    <h4 className="font-bold mt-1">
                      {solicitacao.titulo}
                    </h4>

                    <p className="text-sm text-slate-400 mt-2">
                      {solicitacao.descricao}
                    </p>
                  </div>

                  <div className="text-sm lg:text-right shrink-0 space-y-1">
                    <p>
                      <span className="text-slate-500">
                        Status:
                      </span>{" "}
                      {solicitacao.status}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Tipo:
                      </span>{" "}
                      {solicitacao.tipo}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Prioridade:
                      </span>{" "}
                      {solicitacao.prioridade}
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(
                        solicitacao.createdAt
                      ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      void alternarConversa(solicitacao.id)
                    }
                    disabled={
                      carregandoConversa === solicitacao.id
                    }
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm hover:bg-slate-700 disabled:opacity-50 transition"
                  >
                    {carregandoConversa === solicitacao.id
                      ? "Carregando..."
                      : conversaAberta
                        ? "Fechar conversa"
                        : "Ver conversa"}
                  </button>

                  {conversaAberta && (
                    <div className="mt-5 space-y-4">
                      <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                          Histórico
                        </p>

                        {mensagensTicket.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            Ainda não há respostas neste protocolo.
                          </p>
                        ) : (
                          mensagensTicket.map((item) => (
                            <div
                              key={item.id}
                              className="border border-white/10 rounded-lg p-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <p className="text-xs font-bold text-blue-400">
                                  {item.autorTipo === "CLIENTE"
                                    ? "Você"
                                    : "STR Software"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleString("pt-BR")}
                                </p>
                              </div>

                              <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap">
                                {item.mensagem}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {erroConversa[solicitacao.id] && (
                        <p className="text-sm text-red-400">
                          {erroConversa[solicitacao.id]}
                        </p>
                      )}

                      {encerrada ? (
                        <p className="text-sm text-slate-400">
                          Esta solicitação está encerrada e não aceita novas mensagens.
                        </p>
                      ) : (
                        <form
                          onSubmit={(evento) =>
                            void enviarResposta(
                              evento,
                              solicitacao.id
                            )
                          }
                          className="space-y-3"
                        >
                          <label className="block space-y-2">
                            <span className="text-sm text-slate-300">
                              Responder
                            </span>

                            <textarea
                              value={
                                respostas[solicitacao.id] || ""
                              }
                              onChange={(evento) =>
                                setRespostas((estado) => ({
                                  ...estado,
                                  [solicitacao.id]:
                                    evento.target.value,
                                }))
                              }
                              maxLength={5000}
                              rows={4}
                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm resize-y"
                              placeholder="Digite sua mensagem."
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={
                              enviandoMensagem === solicitacao.id
                            }
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition"
                          >
                            {enviandoMensagem === solicitacao.id
                              ? "Enviando..."
                              : "Enviar resposta"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}