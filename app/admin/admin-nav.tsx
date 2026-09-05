"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Módulos administrativos"
      className="flex flex-wrap gap-2"
    >
      {FICHAS.map((ficha) => {
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
  );
}
