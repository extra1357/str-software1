'use client';

import { LeadForm } from "../components/LeadForm";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect } from "react";

// ── DADOS ─────────────────────────────────────────────────────────────────────

const SERVICOS = [
  { icone: "◈", titulo: "Sistemas Web Sob Medida",      descricao: "Plataformas completas desenhadas para o seu processo. ERP, CRM, portais internos e painéis de gestão.",                                         url: "/servicos/sistemas-web", tags: ["Next.js", "TypeScript", "PostgreSQL"] },
  { icone: "⬡", titulo: "Marketplaces & E-commerce",    descricao: "Do MVP ao marketplace com pagamentos, multivendedor, logística e analytics integrados.",                                                          url: "/servicos/marketplace",  tags: ["Stripe", "Prisma", "Next.js"]        },
  { icone: "◎", titulo: "Agentes de Inteligência Artificial", descricao: "Automação inteligente com LLMs: agentes que lêem documentos, respondem clientes e tomam decisões.",                                        url: "/servicos/agentes-ia",   tags: ["OpenAI", "LangChain", "Python"]      },
  { icone: "▣", titulo: "SaaS & Plataformas Recorrentes", descricao: "Construímos o produto que você vende como serviço — multi-tenant, planos, cobranças e escalabilidade desde o dia 1.",                          url: "/servicos/saas",         tags: ["SaaS", "Multi-tenant", "Stripe"]     },
  { icone: "◐", titulo: "Consultoria & Arquitetura",    descricao: "Revisão de código legado, migração de stack, definição de arquitetura e mentoria técnica para times.",                                            url: "/servicos/consultoria",  tags: ["Arquitetura", "Review", "Mentoria"]  },
  { icone: "⬟", titulo: "Apps Mobile",                  descricao: "Aplicativos iOS e Android com React Native — uma base de código, dois mercados, sem compromisso na experiência.",                                 url: "/servicos/mobile",       tags: ["React Native", "Expo", "TypeScript"] },
];

const REGIOES = [
  { cidade: "São Paulo Capital", slug: "sao-paulo"     },
  { cidade: "Grande SP",         slug: "grande-sp"     },
  { cidade: "Sorocaba",          slug: "sorocaba"      },
  { cidade: "Campinas",          slug: "campinas"      },
  { cidade: "Ribeirão Preto",    slug: "ribeirao-preto"},
  { cidade: "Santos",            slug: "santos"        },
  { cidade: "Interior SP",       slug: "interior-sp"   },
  { cidade: "Todo o Brasil",     slug: "brasil"        },
];

const BLOG_POSTS = [
  { categoria: "Estratégia",  titulo: "Quando contratar uma software house em vez de montar um time interno",       resumo: "O dilema entre terceirizar e contratar internamente tem resposta diferente dependendo do estágio da empresa.",         slug: "software-house-vs-time-interno", leitura: "6 min" },
  { categoria: "IA Aplicada", titulo: "Agentes de IA: o que funciona de verdade para PMEs",                         resumo: "Sem hype. Cases reais de automação com LLMs que geraram retorno para pequenas e médias empresas paulistas.",          slug: "agentes-ia-pme-2025",            leitura: "8 min" },
  { categoria: "Mercado",     titulo: "Por que empresas do interior de SP estão investindo em software próprio",    resumo: "A digitalização do interior paulista está acelerando. O padrão que observamos em nossos projetos regionais.",          slug: "digitalizacao-interior-sp",      leitura: "5 min" },
];

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[#C8922A] font-black text-2xl tracking-tight">STR</span>
          <span className="text-white/25 text-xs tracking-[0.35em] uppercase">SOFTWARE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["Serviços","#servicos"],["Regiões","#regioes"],["Blog","#blog"]].map(([l,h]) => (
            <a key={l} href={h} className="text-sm text-white/45 hover:text-white transition-colors tracking-wide">{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/admin" className="text-xs text-white/20 hover:text-white/40 transition-colors font-mono">Admin</Link>
          <a href="#contato" className="px-5 py-2.5 bg-[#C8922A] text-black text-sm font-bold hover:bg-[#E5A93A] transition-colors tracking-wide">
            Falar com especialista
          </a>
        </div>

        <button className="md:hidden text-white/50 hover:text-white" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            {open
              ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {[["Serviços","#servicos"],["Regiões","#regioes"],["Blog","#blog"]].map(([l,h]) => (
            <a key={l} href={h} className="text-white/55 hover:text-white text-sm tracking-wide" onClick={() => setOpen(false)}>{l}</a>
          ))}
          <a href="#contato" className="px-5 py-3 bg-[#C8922A] text-black text-sm font-bold text-center" onClick={() => setOpen(false)}>
            Falar com especialista
          </a>
        </div>
      )}
    </nav>
  );
}

// ── CARDS ─────────────────────────────────────────────────────────────────────

function ServicoCard({ icone, titulo, descricao, url, tags }: typeof SERVICOS[0]) {
  return (
    <Link href={url} className="group relative border border-white/8 p-7 bg-[#0d0d0d] hover:border-[#C8922A]/40 hover:bg-[#111] transition-all duration-300 block">
      <div className="absolute top-0 left-0 h-0.5 w-0 bg-[#C8922A] group-hover:w-full transition-all duration-500" />
      <div className="text-[#C8922A] text-3xl mb-5 opacity-60 group-hover:opacity-100 transition-opacity">{icone}</div>
      <h3 className="text-white font-bold text-lg mb-3 leading-tight">{titulo}</h3>
      <p className="text-white/38 text-sm leading-relaxed mb-5">{descricao}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <span key={t} className="text-[10px] text-white/28 border border-white/10 px-2 py-0.5 font-mono tracking-widest uppercase">{t}</span>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 text-[#C8922A] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        Ver mais <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
      </div>
    </Link>
  );
}

function BlogCard({ categoria, titulo, resumo, slug, leitura }: typeof BLOG_POSTS[0]) {
  return (
    <Link href={`/blog/${slug}`} className="group border-t border-white/10 pt-6 pb-2 hover:border-[#C8922A]/30 transition-all block">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">{categoria}</span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className="text-white/28 text-[10px] font-mono">{leitura}</span>
      </div>
      <h3 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-[#E5A93A] transition-colors">{titulo}</h3>
      <p className="text-white/33 text-sm leading-relaxed">{resumo}</p>
    </Link>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-17852258760" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-17852258760');
      `}</Script>

      <Navbar />

      <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C8922A]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_420px] gap-20 items-center w-full">

            <div>
              <div className="inline-flex items-center gap-2 border border-[#C8922A]/30 px-3 py-1.5 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-pulse" />
                <span className="text-[#C8922A] text-[10px] font-mono tracking-[0.25em] uppercase">Disponível para novos projetos</span>
              </div>

              <h1 className="font-black leading-[0.88] tracking-tighter mb-8">
                <span className="block text-[clamp(3.5rem,9vw,7rem)] text-white">Software</span>
                <span className="block text-[clamp(3.5rem,9vw,7rem)] text-[#C8922A]">que escala.</span>
                <span className="block text-[clamp(1.4rem,3.5vw,2.2rem)] text-white/22 font-light tracking-normal mt-4">Sob medida para empresas paulistas.</span>
              </h1>

              <p className="text-white/42 text-lg max-w-xl leading-relaxed mb-10">
                Desenvolvemos sistemas web, marketplaces, ERPs e agentes de IA para empresas que precisam de tecnologia séria — da capital ao interior de São Paulo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contato" className="inline-flex items-center gap-3 bg-[#C8922A] text-black font-bold px-8 py-4 hover:bg-[#E5A93A] transition-colors text-sm tracking-wide">
                  Iniciar projeto <span>→</span>
                </a>
                <a href="#servicos" className="inline-flex items-center gap-3 border border-white/15 text-white/55 px-8 py-4 hover:border-white/30 hover:text-white transition-all text-sm tracking-wide">
                  Ver serviços
                </a>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-12 border-t border-white/8">
                {[["SP Capital","Atendemos"],["Interior SP","Especialidade"],["Todo o Brasil","Remoto"]].map(([local,label]) => (
                  <div key={local}>
                    <div className="text-white font-bold text-sm">{local}</div>
                    <div className="text-white/28 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="contato" className="relative">
              <div className="absolute -inset-px bg-gradient-to-b from-[#C8922A]/15 to-transparent pointer-events-none" />
              <div className="relative border border-white/10 bg-[#0d0d0d] p-8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-[#C8922A]" />
                  <h2 className="text-lg font-bold tracking-tight">Iniciar Consultoria</h2>
                </div>
                <p className="text-white/32 text-sm mb-7 pl-3">Nossa equipe técnica responde em até 24h.</p>
                <LeadForm />
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVIÇOS ── */}
        <section id="servicos" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">O que fazemos</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Serviços</h2>
              </div>
              <p className="text-white/32 text-sm max-w-sm leading-relaxed">
                Cada projeto começa com diagnóstico. Nada é padrão — tudo é construído para o problema real da sua empresa.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
              {SERVICOS.map(s => <ServicoCard key={s.titulo} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── DIFERENCIAIS ── */}
        <section className="py-24 border-t border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-px bg-white/5">
              {[
                { num:"01", titulo:"Sem terceirização",   texto:"Seu projeto é desenvolvido internamente. Você sabe quem escreve cada linha — sem repassar para freelancers anônimos."     },
                { num:"02", titulo:"Código que você herda", texto:"Entregamos repositório, documentação e transferência de conhecimento. Você nunca fica refém da nossa equipe."              },
                { num:"03", titulo:"Do MVP ao escala",    texto:"Construímos para validar rápido e crescer sem reescrever. Arquitetura pensada desde o primeiro commit."                     },
              ].map(({ num, titulo, texto }) => (
                <div key={num} className="bg-[#0d0d0d] p-8">
                  <span className="text-[#C8922A]/25 text-5xl font-black block mb-6">{num}</span>
                  <h3 className="text-white font-bold text-lg mb-3">{titulo}</h3>
                  <p className="text-white/33 text-sm leading-relaxed">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REGIÕES ── */}
        <section id="regioes" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14">
              <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">Onde atuamos</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Atendimento Regional</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {REGIOES.map(({ cidade, slug }) => (
                <Link key={slug} href={`/regioes/${slug}`} className="group border border-white/10 px-5 py-3 text-sm text-white/45 hover:border-[#C8922A]/50 hover:text-white hover:bg-[#C8922A]/5 transition-all font-medium">
                  {cidade} <span className="text-[#C8922A] ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
            <p className="text-white/22 text-sm mt-8 max-w-lg leading-relaxed">
              Projetos 100% remotos com reuniões periódicas — São Paulo Capital, região metropolitana, interior paulista ou qualquer estado do Brasil.
            </p>
          </div>
        </section>

        {/* ── BLOG ── */}
        <section id="blog" className="py-24 border-t border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">Conteúdo técnico</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Blog</h2>
              </div>
              <Link href="/blog" className="text-sm text-white/38 hover:text-[#C8922A] transition-colors border-b border-white/12 pb-0.5 self-start md:self-auto">
                Ver todos os artigos →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {BLOG_POSTS.map(p => <BlogCard key={p.slug} {...p} />)}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-32 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C8922A]/6 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-6">Próximo passo</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
              Seu projeto começa<br />com uma conversa.
            </h2>
            <p className="text-white/38 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Sem custo, sem compromisso. Uma reunião de 30 minutos para entender o que você precisa e ver se faz sentido trabalharmos juntos.
            </p>
            <a href="#contato" className="inline-flex items-center gap-3 bg-[#C8922A] text-black font-bold px-10 py-5 hover:bg-[#E5A93A] transition-colors text-sm tracking-wide">
              Agendar conversa gratuita <span>→</span>
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/8 py-16 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-[#C8922A] font-black text-2xl tracking-tight">STR</span>
                  <span className="text-white/18 text-xs tracking-[0.35em] uppercase">SOFTWARE</span>
                </div>
                <p className="text-white/28 text-sm leading-relaxed max-w-sm">
                  Empresa de desenvolvimento de software sob medida em São Paulo. Sistemas web, marketplaces, ERPs e inteligência artificial para empresas que levam tecnologia a sério.
                </p>
              </div>
              <div>
                <p className="text-white/18 text-xs font-mono tracking-[0.25em] uppercase mb-4">Serviços</p>
                <ul className="space-y-2.5">
                  {[["Sistemas Web","/servicos/sistemas-web"],["Marketplace","/servicos/marketplace"],["Agentes de IA","/servicos/agentes-ia"],["SaaS","/servicos/saas"],["Consultoria","/servicos/consultoria"],["Mobile","/servicos/mobile"]].map(([l,h]) => (
                    <li key={l}><Link href={h} className="text-white/32 text-sm hover:text-white transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-white/18 text-xs font-mono tracking-[0.25em] uppercase mb-4">Regiões</p>
                <ul className="space-y-2.5">
                  {REGIOES.slice(0,6).map(({ cidade, slug }) => (
                    <li key={slug}><Link href={`/regioes/${slug}`} className="text-white/32 text-sm hover:text-white transition-colors">{cidade}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/18 text-xs font-mono">© {new Date().getFullYear()} STR Software. Todos os direitos reservados.</p>
              <div className="flex items-center gap-6">
                {[["Privacidade","/privacidade"],["Termos","/termos"],["Blog","/blog"]].map(([l,h]) => (
                  <Link key={l} href={h} className="text-white/18 text-xs hover:text-white/45 transition-colors">{l}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
