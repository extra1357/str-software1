import { LeadForm } from "@/components/LeadForm";
import { Logos } from "@/components/Logos";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      
      {/* BACKGROUND DECORATIVO (LUZES) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10 flex flex-col min-h-screen">
        
        {/* SEÇÃO PRINCIPAL (HERO) */}
        <div className="grid lg:grid-cols-2 gap-16 items-center flex-grow">
          
          {/* LADO ESQUERDO: TEXTO E BRANDING */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Disponível para novos projetos
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              STR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">SOFTWARE</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Engenharia de software sob medida. Criamos ecossistemas digitais escaláveis para empresas que não aceitam o comum.
            </p>

            <div className="flex gap-4 pt-4">
              <div className="h-12 w-[1px] bg-gradient-to-b from-blue-500 to-transparent"></div>
              <p className="text-sm text-slate-500 font-mono italic">
                Stack: Next.js 15, TypeScript, <br /> Prisma & PostgreSQL
              </p>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-2">Iniciar Consultoria</h2>
              <p className="text-slate-400 mb-8 text-sm">Preencha os dados e nossa equipe técnica entrará em contato.</p>
              <LeadForm />
            </div>
          </div>
        </div>

        {/* CARROSSEL DE PARCEIROS/CLIENTES */}
        <section className="mt-20">
          <Logos />
        </section>

      </div>
    </main>
  );
}