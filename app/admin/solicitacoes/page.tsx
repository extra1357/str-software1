import { prisma } from "@/lib/prisma";
import { updateTicketStatus } from "@/app/actions/update-ticket-status";
import { responderTicket } from "@/app/actions/responder-ticket";

const STATUS_SOLICITACAO = [
  { valor: "ABERTO", rotulo: "Aberto" },
  { valor: "EM_ATENDIMENTO", rotulo: "Em atendimento" },
  { valor: "AGUARDANDO_CLIENTE", rotulo: "Aguardando cliente" },
  { valor: "RESOLVIDO", rotulo: "Resolvido" },
  { valor: "ENCERRADO", rotulo: "Encerrado" },
];

export default async function SolicitacoesAdminPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      cliente: {
        select: {
          nome: true,
          email: true,
        },
      },
      mensagens: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          autorTipo: true,
          mensagem: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const solicitacoesPendentes = tickets.filter(
    (ticket) =>
      ticket.status !== "RESOLVIDO" &&
      ticket.status !== "ENCERRADO"
  ).length;

  return (
    <main className="px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black">
            Solicitações dos clientes
          </h2>

          <p className="text-slate-400 mt-1">
            {solicitacoesPendentes} solicitação(ões) pendente(s) de atendimento.
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">
              Nenhuma solicitação registrada.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-400 font-mono uppercase tracking-widest">
                        {ticket.protocolo}
                      </p>

                      <h3 className="font-bold text-lg mt-1">
                        {ticket.titulo}
                      </h3>
                    </div>

                    <div className="text-sm text-slate-400 space-y-1">
                      <p>
                        Cliente:{" "}
                        <span className="text-slate-200">
                          {ticket.cliente.nome}
                        </span>
                      </p>

                      <p>
                        E-mail:{" "}
                        <span className="text-slate-200">
                          {ticket.cliente.email}
                        </span>
                      </p>

                      <p>
                        Tipo:{" "}
                        <span className="text-slate-200">
                          {ticket.tipo}
                        </span>
                      </p>

                      <p>
                        Prioridade:{" "}
                        <span className="text-slate-200">
                          {ticket.prioridade}
                        </span>
                      </p>

                      <p>
                        Criada em:{" "}
                        <span className="text-slate-200">
                          {ticket.createdAt.toLocaleString("pt-BR")}
                        </span>
                      </p>

                      {ticket.encerradoEm && (
                        <p>
                          Encerrada em:{" "}
                          <span className="text-slate-200">
                            {ticket.encerradoEm.toLocaleString("pt-BR")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <form
                    action={updateTicketStatus}
                    className="flex flex-col sm:flex-row gap-2 shrink-0"
                  >
                    <input
                      type="hidden"
                      name="ticketId"
                      value={ticket.id}
                    />

                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    >
                      {STATUS_SOLICITACAO.map((status) => (
                        <option
                          key={status.valor}
                          value={status.valor}
                        >
                          {status.rotulo}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="px-4 py-2 text-sm rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition"
                    >
                      Atualizar
                    </button>
                  </form>
                </div>

                <div className="mt-5 p-4 bg-slate-800/60 border border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                    Descrição
                  </p>

                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {ticket.descricao}
                  </p>
                </div>

                <div className="mt-5 p-4 bg-slate-800/60 border border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                    Conversa com o cliente
                  </p>

                  <div className="space-y-3">
                    {ticket.mensagens.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Ainda não há mensagens adicionais neste protocolo.
                      </p>
                    ) : (
                      ticket.mensagens.map((mensagem) => (
                        <div
                          key={mensagem.id}
                          className="bg-slate-950/60 border border-white/10 rounded-lg p-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-xs font-bold text-blue-400">
                              {mensagem.autorTipo === "CLIENTE"
                                ? ticket.cliente.nome
                                : "STR Software"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {mensagem.createdAt.toLocaleString("pt-BR")}
                            </p>
                          </div>

                          <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap">
                            {mensagem.mensagem}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {ticket.status === "ENCERRADO" ? (
                    <p className="text-sm text-slate-500 mt-4">
                      Solicitação encerrada. Novas mensagens estão bloqueadas.
                    </p>
                  ) : (
                    <form
                      action={responderTicket.bind(null, ticket.id)}
                      className="mt-5 space-y-3"
                    >
                      <label className="block space-y-2">
                        <span className="text-sm text-slate-300">
                          Responder ao cliente
                        </span>

                        <textarea
                          name="mensagem"
                          required
                          maxLength={5000}
                          rows={4}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-3 text-sm resize-y"
                          placeholder="Digite a resposta para o cliente."
                        />
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-bold transition"
                      >
                        Enviar resposta
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
