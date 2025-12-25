import React from "react";
//import { AdminAccess } from "../components/AdminAccess";
import { prisma } from "../../lib/prisma";
import { updateLeadStatus } from "../actions/update-lead-status";

/* TIPOS */
type StatusFilter = "NEW" | "CONTACTED" | "CLOSED" | undefined;

type SearchParams = {
  status?: StatusFilter;
  history?: string;
};

/* PAGE */
export default async function AdminDashboard(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  const statusFilter = searchParams?.status;

  /* KPIs (globais, sem filtro) */
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    closedLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "CONTACTED" } }),
    prisma.lead.count({ where: { status: "CLOSED" } }),
  ]);

  /* Leads da tabela (com filtro opcional) */
  const leads = await prisma.lead.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Dashboard <span className="text-blue-500">Admin</span>
            </h1>
            <p className="text-slate-400 mt-2">
              Leads capturados pelo site.
            </p>
          </div>

          <a
            href="/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-emerald-500/10 border border-emerald-500/30
                       text-emerald-400 text-sm font-mono
                       hover:bg-emerald-500/20 transition"
          >
            Exportar CSV
          </a>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Leads Totais" value={totalLeads} />
          <KpiCard title="Novos" value={newLeads} />
          <KpiCard title="Contato Feito" value={contactedLeads} />
          <KpiCard title="Fechados" value={closedLeads} />
        </section>

        {/* FILTROS */}
        <section className="flex flex-wrap gap-3">
          <FilterButton label="Todos" href="/admin" active={!statusFilter} />
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
        </section>

        {/* TABELA */}
        <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">
            {statusFilter ? `Leads (${statusFilter})` : "Leads Recentes"}
          </h2>

          {leads.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Nenhum lead encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-2 text-left">Nome</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-left">Telefone</th>
                    <th className="py-2 text-left">Descrição</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="py-2 text-left">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <React.Fragment key={lead.id}>
                      <tr className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3">{lead.name}</td>
                        <td className="py-3 text-slate-400">{lead.email}</td>
                        <td className="py-3 text-slate-400">{lead.phone}</td>
                        <td className="py-3 text-slate-400 max-w-xs truncate">
                          {lead.release}
                        </td>

                        {/* STATUS EDITÁVEL */}
                        <td className="py-3">
                          <form
                            action={updateLeadStatus}
                            className="flex items-center gap-2"
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
                              <option value="CONTACTED">Contato feito</option>
                              <option value="CLOSED">Fechado</option>
                            </select>

                            <button
                              type="submit"
                              className="px-2 py-1 text-xs rounded
                                         bg-blue-500/10 border border-blue-500/30
                                         text-blue-400 hover:bg-blue-500/20 transition"
                            >
                              Salvar
                            </button>
                          </form>
                        </td>

                        <td className="py-3 text-slate-400">
                          {lead.createdAt.toLocaleDateString()}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

/* COMPONENTES AUXILIARES */

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
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
      className={`px-4 py-2 rounded-lg text-sm font-mono border transition ${
        active
          ? "bg-blue-500/20 border-blue-500 text-blue-400"
          : "bg-slate-900/40 border-white/10 text-slate-400 hover:bg-white/5"
      }`}
    >
      {label}
    </a>
  );
}
