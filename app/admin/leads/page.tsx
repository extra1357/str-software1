import { prisma } from "@/lib/prisma";
import { updateLeadStatus } from "@/app/actions/update-lead-status";

type StatusFilter =
  | "NEW"
  | "CONTACTED"
  | "CLOSED"
  | "ARCHIVED"
  | undefined;

type SearchParams = {
  status?: StatusFilter;
};

export default async function LeadsAdminPage(props: {
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
    leads,
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
    prisma.lead.findMany({
      where: statusFilter
        ? { status: statusFilter }
        : { status: { not: "ARCHIVED" } },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <main className="px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Leads comerciais
            </h2>

            <p className="text-slate-400 mt-1">
              Contatos capturados pelo site.
            </p>
          </div>

          <a
            href="/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-mono hover:bg-emerald-500/20 transition"
          >
            Exportar CSV
          </a>
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
            href="/admin/leads"
            active={!statusFilter}
          />

          <FilterButton
            label="Novos"
            href="/admin/leads?status=NEW"
            active={statusFilter === "NEW"}
          />

          <FilterButton
            label="Contato feito"
            href="/admin/leads?status=CONTACTED"
            active={statusFilter === "CONTACTED"}
          />

          <FilterButton
            label="Fechados"
            href="/admin/leads?status=CLOSED"
            active={statusFilter === "CLOSED"}
          />

          <FilterButton
            label="Arquivados"
            href="/admin/leads?status=ARCHIVED"
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
        (active
          ? "bg-blue-500/20 border-blue-500 text-blue-400"
          : "bg-slate-900/40 border-white/10 text-slate-400 hover:bg-white/5")
      }
    >
      {label}
    </a>
  );
}
