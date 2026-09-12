"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/actions/admin-logout";

type AdminNavProps = {
  papel?: string;
};

const FICHAS = [
  {
    href: "/admin/solicitacoes",
    rotulo: "Solicitações",
  },
  {
    href: "/admin/leads",
    rotulo: "Leads",
  },
  {
    href: "/admin/clientes",
    rotulo: "Clientes",
  },
  {
    href: "/admin/financeiro",
    rotulo: "Financeiro",
  },
  {
    href: "/admin/blog",
    rotulo: "Blog / CMS",
  },
];

export default function AdminNav({
  papel,
}: AdminNavProps) {
  const pathname = usePathname();

  const fichas =
    papel === "SUPER_ADMIN"
      ? [
          ...FICHAS,
          {
            href: "/admin/destinatarios-leads",
            rotulo: "E-mails dos leads",
          },
          {
            href: "/admin/usuarios",
            rotulo: "Usuários",
          },
        ]
      : FICHAS;

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <nav
        aria-label="Módulos administrativos"
        className="flex flex-wrap gap-2"
      >
        {fichas.map((ficha) => {
          const ativa =
            pathname === ficha.href ||
            pathname.startsWith(ficha.href + "/");

          return (
            <Link
              key={ficha.href}
              href={ficha.href}
              className={
                "px-5 py-3 rounded-t-xl border text-sm font-bold transition " +
                (ativa
                  ? "bg-slate-900 border-blue-500/50 border-b-slate-900 text-blue-400"
                  : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900/60")
              }
            >
              {ficha.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
        >
          ← Voltar ao site
        </Link>

        <form action={adminLogout}>
          <button
            type="submit"
            className="inline-flex w-fit items-center rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm font-bold text-red-300 transition hover:border-red-400/60 hover:bg-red-950/60 hover:text-red-200"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}