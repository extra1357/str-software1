"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "str-academy-invite-last-shown-v1";
const INTERVAL_MS = 15 * 60 * 1000;
const FIRST_DELAY_MS = 8 * 1000;

export default function AcademyInvitePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const check = () => {
      try {
        const lastShown = Number(
          window.localStorage.getItem(STORAGE_KEY) || "0"
        );

        if (lastShown > 0 && Date.now() - lastShown < INTERVAL_MS) {
          return;
        }
      } catch {
        // Storage indisponivel: manter funcionamento da interface.
      }

      setOpen(true);

      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // Nao bloquear a interface por falha de armazenamento.
      }
    };

    const timer = window.setTimeout(check, FIRST_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!open || pathname !== "/") return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Conheça a STR Software Academy"
        className="relative w-full max-w-[520px]"
      >
        <button
          type="button"
          aria-label="Fechar convite"
          onClick={() => setOpen(false)}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/75 text-xl text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          ×
        </button>

        <Link
          href="/academy"
          onClick={() => setOpen(false)}
          aria-label="Clique para conhecer a STR Academy"
          className="block overflow-hidden rounded-2xl border border-amber-400/40 shadow-2xl shadow-amber-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          <Image
            src="/images/str-academy-convite.png"
            alt="Conheça a STR Software Academy. Clique para acessar a plataforma."
            width={1248}
            height={1248}
            sizes="(max-width: 640px) calc(100vw - 32px), 520px"
            className="block h-auto max-h-[85dvh] w-full object-contain"
            priority={false}
          />
        </Link>
      </section>
    </div>
  );
}