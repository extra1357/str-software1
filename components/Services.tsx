export function Services() {
  const services = [
    {
      title: "Sistemas Web Sob Medida",
      description:
        "Desenvolvemos sistemas web robustos, escaláveis e seguros, totalmente alinhados às necessidades do seu negócio.",
    },
    {
      title: "Aplicações com Next.js",
      description:
        "Projetos modernos utilizando Next.js, com foco em performance, SEO, segurança e experiência do usuário.",
    },
    {
      title: "Back-end & APIs",
      description:
        "APIs seguras e performáticas em Node.js, integração com bancos de dados e serviços externos.",
    },
    {
      title: "Automação de Processos",
      description:
        "Automatizamos fluxos internos para reduzir custos operacionais e aumentar a produtividade da sua empresa.",
    },
  ];

  return (
    <section className="w-full py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Nossos <span className="text-blue-500">Serviços</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Soluções digitais de alto nível para empresas que exigem tecnologia
            sólida e resultados reais.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
