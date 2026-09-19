import Link from "next/link";

const areas = [
  {
    numero: "01",
    titulo: "Fundamentos",
    descricao:
      "A base para compreender como aplicações web realmente funcionam, antes de depender de frameworks e abstrações.",
    topicos: ["DNS", "HTTP / HTTPS", "Git", "Terminal", "Deploy", "Segurança"],
  },
  {
    numero: "02",
    titulo: "Desenvolvimento",
    descricao:
      "Construção de aplicações modernas com atenção à arquitetura, dados, autenticação, integrações e diagnóstico.",
    topicos: ["TypeScript", "Next.js", "APIs", "Banco de dados", "Autenticação", "Logs"],
  },
  {
    numero: "03",
    titulo: "Infraestrutura",
    descricao:
      "Do primeiro deploy à operação de aplicações reais, entendendo cada camada envolvida na entrega.",
    topicos: ["Vercel", "DNS", "Cloudflare", "AWS", "Ambientes", "Observabilidade"],
  },
  {
    numero: "04",
    titulo: "Método STR",
    descricao:
      "Uma disciplina de engenharia para investigar problemas, alterar sistemas com controle e validar cada resultado.",
    topicos: ["Baseline", "Diagnóstico", "Mudança mínima", "Rollback", "Logs", "Validação"],
  },
];

const etapas = [
  {
    nivel: "Aprendiz",
    numero: "01",
    texto:
      "Constrói fundamentos, aprende a investigar e executa tarefas técnicas com orientação.",
  },
  {
    nivel: "Júnior",
    numero: "02",
    texto:
      "Implementa soluções, diagnostica falhas e trabalha com checkpoints e validação.",
  },
  {
    nivel: "Operacional",
    numero: "03",
    texto:
      "Conduz entregas controladas e entende o impacto técnico das próprias decisões.",
  },
];

export default function AcademyHomePage() {
  return (
    <main className="min-h-screen bg-[#f4f2ed] text-zinc-900">
      <header className="border-b border-black/10 bg-[#f4f2ed]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/academy" className="flex items-baseline gap-3">
            <span className="text-xl font-black tracking-tight text-[#b77b16]">
              STR
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-700">
              Academy
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/academy/login"
              className="hidden px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 sm:inline-flex"
            >
              Entrar
            </Link>

            <Link
              href="/academy/cadastro"
              className="inline-flex min-h-10 items-center rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Começar
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-black/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b77b16]/25 bg-[#b77b16]/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b77b16]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8c5c0c]">
                Formação técnica orientada à prática
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-zinc-950 md:text-7xl">
              Aprenda a construir.
              <span className="mt-2 block text-[#b77b16]">
                Aprenda a diagnosticar.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-600">
              Uma formação em desenvolvimento e infraestrutura baseada em
              problemas reais, mudanças controladas e compreensão do que
              acontece por trás do código.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/academy/cadastro"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-zinc-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
              >
                Iniciar minha formação
                <span className="ml-3" aria-hidden="true">
                  →
                </span>
              </Link>

              <a
                href="#formacao"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-black/15 bg-white/50 px-7 py-3 text-sm font-semibold text-zinc-700 transition hover:border-black/30 hover:bg-white"
              >
                Conhecer as trilhas
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(24,24,27,0.08)] md:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a6813]">
              Engenharia aplicada
            </p>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950">
              Não é apenas aprender sintaxe.
            </h2>

            <p className="mt-3 leading-7 text-zinc-600">
              Você aprende a observar o estado de um sistema, formular um
              diagnóstico, realizar a menor mudança necessária e comprovar o
              resultado.
            </p>

            <div className="mt-8 space-y-3">
              {[
                ["01", "Estabelecer o baseline"],
                ["02", "Diagnosticar antes de alterar"],
                ["03", "Executar mudança controlada"],
                ["04", "Instrumentar e observar"],
                ["05", "Validar ou fazer rollback"],
              ].map(([numero, texto]) => (
                <div
                  key={numero}
                  className="flex items-center gap-4 rounded-xl border border-black/8 bg-[#faf9f6] px-4 py-3"
                >
                  <span className="font-mono text-xs font-bold text-[#b77b16]">
                    {numero}
                  </span>
                  <span className="text-sm font-semibold text-zinc-700">
                    {texto}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="formacao" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a6813]">
            Formação
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Entenda o sistema inteiro.
          </h2>

          <p className="mt-5 text-lg leading-8 text-zinc-600">
            As trilhas conectam programação, infraestrutura e operação para que
            cada tecnologia faça sentido dentro de um sistema real.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {areas.map((area) => (
            <article
              key={area.numero}
              className="group rounded-2xl border border-black/10 bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#b77b16]/35 hover:shadow-[0_18px_45px_rgba(24,24,27,0.06)] md:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <span className="font-mono text-xs font-bold text-[#b77b16]">
                  {area.numero}
                </span>

                <span
                  aria-hidden="true"
                  className="text-xl text-zinc-300 transition group-hover:text-[#b77b16]"
                >
                  ↗
                </span>
              </div>

              <h3 className="mt-7 text-2xl font-bold tracking-tight text-zinc-950">
                {area.titulo}
              </h3>

              <p className="mt-3 max-w-xl leading-7 text-zinc-600">
                {area.descricao}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {area.topicos.map((topico) => (
                  <span
                    key={topico}
                    className="rounded-full border border-black/10 bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-zinc-600"
                  >
                    {topico}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#ebe8e0]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8c5c0c]">
                Evolução
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950">
                Progresso que você consegue enxergar.
              </h2>

              <p className="mt-5 leading-7 text-zinc-600">
                Cada etapa amplia sua autonomia. O objetivo não é apenas
                concluir aulas, mas demonstrar capacidade técnica crescente.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {etapas.map((etapa) => (
                <article
                  key={etapa.numero}
                  className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-6"
                >
                  <span className="font-mono text-xs font-bold text-[#b77b16]">
                    {etapa.numero}
                  </span>

                  <h3 className="mt-8 text-xl font-bold text-zinc-950">
                    {etapa.nivel}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {etapa.texto}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="overflow-hidden rounded-3xl bg-zinc-950 px-7 py-12 text-white md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d7a444]">
                Seu próximo passo
              </p>

              <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Comece pelos fundamentos.
                <span className="block text-white/40">
                  Evolua com método.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-white/55">
                Crie sua conta para acompanhar as trilhas, materiais e sua
                evolução dentro da STR Academy.
              </p>
            </div>

            <Link
              href="/academy/cadastro"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#c8922a] px-7 py-3 text-sm font-bold text-zinc-950 transition hover:bg-[#dfa63a]"
            >
              Criar minha conta
              <span className="ml-3" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-black text-[#b77b16]">STR</span>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">
              Academy
            </span>
          </div>

          <p>
            Formação técnica com método, prática e validação.
          </p>
        </div>
      </footer>
    </main>
  );
}