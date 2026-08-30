// Footer compartilhado para as páginas internas. Visualmente idêntico ao
// rodapé que já existe embutido em app/page.tsx — não alteramos o rodapé
// da home, só reaproveitamos o mesmo layout aqui para as páginas novas.

import Link from "next/link";
import { REGIOES } from "@/lib/regioes-data";

const SERVICOS_FOOTER: [string, string][] = [
  ["Sistemas Web", "/servicos/sistemas-web"],
  ["Marketplace", "/servicos/marketplace"],
  ["Agentes de IA", "/servicos/agentes-ia"],
  ["SaaS", "/servicos/saas"],
  ["Consultoria", "/servicos/consultoria"],
  ["Mobile", "/servicos/mobile"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-16 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-[#C8922A] font-black text-2xl tracking-tight">STR</span>
              <span className="text-white/18 text-xs tracking-[0.35em] uppercase">SOFTWARE</span>
            </div>
            <p className="text-white/28 text-sm leading-relaxed max-w-sm">
              Empresa de desenvolvimento de software sob medida em São Paulo. Sistemas web, marketplaces, ERPs e
              inteligência artificial para empresas que levam tecnologia a sério.
            </p>
          </div>
          <div>
            <p className="text-white/18 text-xs font-mono tracking-[0.25em] uppercase mb-4">Serviços</p>
            <ul className="space-y-2.5">
              {SERVICOS_FOOTER.map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-white/32 text-sm hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/18 text-xs font-mono tracking-[0.25em] uppercase mb-4">Regiões</p>
            <ul className="space-y-2.5">
              {REGIOES.slice(0, 6).map(({ cidade, slug }) => (
                <li key={slug}>
                  <Link href={`/regioes/${slug}`} className="text-white/32 text-sm hover:text-white transition-colors">
                    {cidade}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/18 text-xs font-mono">© {new Date().getFullYear()} STR Software. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            {[["Privacidade", "/privacidade"], ["Termos", "/termos"], ["Blog", "/blog"], ["Área do Cliente", "/cliente/login"]].map(([l, h]) => (
              <Link key={l} href={h} className="text-white/18 text-xs hover:text-white/45 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
