"use client";

// Navbar compartilhada para as páginas internas (serviços, regiões, blog,
// institucionais). Baseada na Navbar original de app/page.tsx, com duas
// diferenças propositais:
//   1. Os links "Serviços" e "Regiões" apontam para "/#servicos" e
//      "/#regioes" (com a barra) em vez de apenas "#servicos"/"#regioes",
//      porque essas âncoras só existem na home — em outra página, um link
//      "#servicos" tentaria rolar a própria página (sem seção "servicos"
//      nela) em vez de navegar até a home.
//   2. O fundo não começa totalmente transparente, porque as páginas
//      internas não têm um hero tão alto quanto a home logo abaixo do menu.

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS: [string, string][] = [
  ["Serviços", "/#servicos"],
  ["Regiões", "/#regioes"],
  ["Blog", "/blog"],
];

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 py-4"
          : "bg-[#080808]/80 backdrop-blur-md py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[#C8922A] font-black text-2xl tracking-tight">STR</span>
          <span className="text-white/25 text-xs tracking-[0.35em] uppercase">SOFTWARE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(([l, h]) => (
            <Link key={l} href={h} className="text-sm text-white/45 hover:text-white transition-colors tracking-wide">
              {l}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/admin" className="text-xs text-white/20 hover:text-white/40 transition-colors font-mono">
            Admin
          </Link>
          <Link
            href="/#contato"
            className="px-5 py-2.5 bg-[#C8922A] text-black text-sm font-bold hover:bg-[#E5A93A] transition-colors tracking-wide"
          >
            Falar com especialista
          </Link>
        </div>

        <button className="md:hidden text-white/50 hover:text-white" onClick={() => setOpen(!open)} aria-label="Abrir menu">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map(([l, h]) => (
            <Link
              key={l}
              href={h}
              className="text-white/55 hover:text-white text-sm tracking-wide"
              onClick={() => setOpen(false)}
            >
              {l}
            </Link>
          ))}
          <Link
            href="/#contato"
            className="px-5 py-3 bg-[#C8922A] text-black text-sm font-bold text-center"
            onClick={() => setOpen(false)}
          >
            Falar com especialista
          </Link>
        </div>
      )}
    </nav>
  );
}
