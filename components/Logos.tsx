export function Logos() {
  const clients = [
    "TECH SOLUTIONS", "GLOBAL BANK", "NEXUS AI", "ULTRA LOGIC", 
    "PRIME DEV", "STRATEGIC SYSTEMS", "HORIZON DATA"
  ];

  return (
    <div className="w-full py-20 overflow-hidden bg-slate-950/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-xs font-mono text-blue-500 uppercase tracking-[0.3em] text-center">
          Trusted by industry leaders
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {/* Repetimos a lista duas vezes para o efeito infinito */}
          {[...clients, ...clients].map((client, index) => (
            <span 
              key={index} 
              className="mx-12 text-3xl md:text-4xl font-black text-slate-700 hover:text-blue-500/50 transition-colors cursor-default tracking-tighter"
            >
              {client}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}