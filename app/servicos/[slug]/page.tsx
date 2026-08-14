import { SERVICOS } from "../../../lib/servicos-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SERVICOS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const servico = SERVICOS.find((s) => s.slug === params.slug);
  if (!servico) return {};
  return {
    title: `${servico.titulo} | STR Software`,
    description: servico.descricao,
  };
}

export default function ServicoPage({ params }: { params: { slug: string } }) {
  const servico = SERVICOS.find((s) => s.slug === params.slug);
  if (!servico) return notFound();

  return (
    <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link href="/#servicos" className="text-white/38 text-sm hover:text-[#C8922A] transition-colors">
          &larr; Voltar para servicos
        </Link>

        <div className="text-[#C8922A] text-5xl mt-8 mb-6">{servico.icone}</div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{servico.titulo}</h1>

        <p className="text-white/45 text-lg leading-relaxed mb-8">{servico.descricao}</p>

        <div className="flex flex-wrap gap-2 mb-12">
          {servico.tags.map((t) => (
            <span key={t} className="text-[10px] text-white/28 border border-white/10 px-2 py-0.5 font-mono tracking-widest uppercase">
              {t}
            </span>
          ))}
        </div>

        <div className="border-t border-white/8 pt-10 mb-10">
          <p className="text-white/60 text-base leading-relaxed">{servico.detalhes}</p>
        </div>

        <div className="border-t border-white/8 pt-10">
          <h2 className="text-xl font-bold mb-6">O que voce ganha</h2>
          <ul className="space-y-4">
            {servico.beneficios.map((b) => (
              <li key={b} className="flex items-start gap-3 text-white/55 text-sm leading-relaxed">
                <span className="text-[#C8922A] mt-0.5">&#10003;</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/8 pt-10 mt-12">
          <a
            href="/#contato"
            className="inline-flex items-center gap-3 bg-[#C8922A] text-black font-bold px-8 py-4 hover:bg-[#E5A93A] transition-colors text-sm tracking-wide"
          >
            Falar com especialista &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
