import React from "react";
import { prisma } from "../../lib/prisma";
import { updateLeadStatus } from "../actions/update-lead-status";
import { updateTicketStatus } from "../actions/update-ticket-status";
import { responderTicket } from "../actions/responder-ticket";

type StatusFilter =
  | "NEW"
  | "CONTACTED"
  | "CLOSED"
  | "ARCHIVED"
  | undefined;

type SearchParams = {
  status?: StatusFilter;
};

const STATUS_SOLICITACAO = [
  { valor: "ABERTO", rotulo: "Aberto" },
  { valor: "EM_ATENDIMENTO", rotulo: "Em atendimento" },
  { valor: "AGUARDANDO_CLIENTE", rotulo: "Aguardando cliente" },
  { valor: "RESOLVIDO", rotulo: "Resolvido" },
  { valor: "ENCERRADO", rotulo: "Encerrado" },
];

export default async function AdminDashboard(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status;

  const [
    totalLeads,
    newLeads,
    contactedLeads,
    closedLeads,
    archivedLeads,
    tickets,
  ] = await Promise.all([
    prisma.lead.count({
      where: { status: { not: "ARCHIVED" } },
    }),
    prisma.lead.count({
      where: { status: "NEW" },
    }),
    prisma.lead.count({
      where: { status: "CONTACTED" },
    }),
    prisma.lead.count({
      where: { status: "CLOSED" },
    }),
    prisma.lead.count({
      where: { status: "ARCHIVED" },
    }),
    prisma.ticket.findMany({
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
    }),
  ]);

  const leads = await prisma.lead.findMany({
    where: statusFilter
      ? { status: statusFilter }
      : { status: { not: "ARCHIVED" } },
    orderBy: {
      createdAt: "desc",
    },
  });

  const solicitacoesAbertas = tickets.filter(
    (ticket) => ticket.status !== "ENCERRADO"
  ).length;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Dashboard <span className="text-blue-500">Admin</span>
            </h1>

            <p className="text-slate-400 mt-2">
              Leads e solicitações da Área do Cliente.
            </p>
          </div>

          <a
            href="/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-mono hover:bg-emerald-500/20 transition"
          >
            Exportar CSV
          </a>
        </header>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black">
              Solicitações dos clientes
            </h2>

            <p className="text-slate-400 mt-1">
              {solicitacoesAbertas} solicitação(ões) ainda não encerrada(s).
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
        </section>

        <div className="border-t border-white/10" />

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-black">
              Leads comerciais
            </h2>

            <p className="text-slate-400 mt-1">
              Contatos capturados pelo site.
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <KpiCard title="Leads Totais" value={totalLeads} />
            <KpiCard title="Novos" value={newLeads} />
            <KpiCard title="Contato Feito" value={contactedLeads} />
            <KpiCard title="Fechados" value={closedLeads} />
            <KpiCard title="Arquivados" value={archivedLeads} />
          </section>

          <section className="flex flex-wrap gap-3">
            <FilterButton
              label="Todos"
              href="/admin"
              active={!statusFilter}
            />

            <FilterButton
              label="Novos"
              href="/admin?status=NEW"
              active={statusFilter === "NEW"}
            />

            <FilterButton
              label="Contato feito"
              href="/admin?status=CONTACTED"
              active={statusFilter === "CONTACTED"}
            />

            <FilterButton
              label="Fechados"
              href="/admin?status=CLOSED"
              active={statusFilter === "CLOSED"}
            />

            <FilterButton
              label="Arquivados"
              href="/admin?status=ARCHIVED"
              active={statusFilter === "ARCHIVED"}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold">
              {statusFilter
                ? "Leads (" + statusFilter + ")"
                : "Leads Recentes"}
            </h3>

            {leads.length === 0 ? (
              <p className="text-slate-400 text-sm">
                Nenhum lead encontrado.
              </p>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-lg">
                          {lead.name}
                        </p>

                        <p className="text-slate-400 text-sm">
                          {lead.email}
                        </p>

                        <p className="text-slate-400 text-sm">
                          {lead.phone}
                        </p>

                        <p className="text-slate-500 text-xs">
                          {lead.createdAt.toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <form
                        action={updateLeadStatus}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <input
                          type="hidden"
                          name="leadId"
                          value={lead.id}
                        />

                        <select
                          name="status"
                          defaultValue={lead.status}
                          className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm"
                        >
                          <option value="NEW">Novo</option>
                          <option value="CONTACTED">
                            Contato feito
                          </option>
                          <option value="CLOSED">
                            Fechado
                          </option>
                          <option value="ARCHIVED">
                            Arquivado (teste)
                          </option>
                        </select>

                        <button
                          type="submit"
                          className="px-3 py-1 text-xs rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition"
                        >
                          Salvar
                        </button>
                      </form>
                    </div>

                    <div className="mt-4 p-4 bg-slate-800/60 border border-white/5 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                        Mensagem completa
                      </p>

                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {lead.release}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={"mailto:" + lead.email}
                        className="px-3 py-1 text-xs rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition"
                      >
                        Responder por e-mail
                      </a>

                      <a
                        href={
                          "https://wa.me/55" +
                          lead.phone.replace(/\D/g, "")
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={
        "px-4 py-2 rounded-lg text-sm font-mono border transition " +
        (
          active
            ? "bg-blue-500/20 border-blue-500 text-blue-400"
            : "bg-slate-900/40 border-white/10 text-slate-400 hover:bg-white/5"
        )
      }
    >
      {label}
    </a>
  );
}