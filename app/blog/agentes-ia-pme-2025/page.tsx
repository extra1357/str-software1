import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agentes de IA: o que funciona de verdade para PMEs em 2025",
  description: "Sem hype. O que agentes de IA resolvem hoje, onde ainda falham, e como PMEs brasileiras estão aplicando essa tecnologia com retorno real.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">

        <Link href="/" className="inline-flex items-center gap-2 text-[#C8922A] text-xs font-mono tracking-widest uppercase mb-12 hover:opacity-70 transition-opacity">
          ← STR Software
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] text-[#C8922A] font-mono tracking-widest uppercase">IA Aplicada</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">8 min de leitura</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] font-mono">Abril 2025</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">
          Agentes de IA: o que funciona de verdade para PMEs em 2025
        </h1>

        <p className="text-white/50 text-lg leading-relaxed mb-16 border-l-2 border-[#C8922A]/40 pl-5">
          Sem hype. O que agentes de IA resolvem hoje, onde ainda falham, os riscos reais que ninguém menciona e como PMEs brasileiras estão usando essa tecnologia com retorno mensurável.
        </p>

        <div className="prose prose-invert max-w-none space-y-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que é um agente de IA, de fato</h2>
            <p>
              Um agente de IA não é um chatbot mais esperto. A distinção fundamental, como descreveu a Anthropic ao lançar o Model Context Protocol (MCP) em 2024, é que um agente combina um LLM (modelo de linguagem) com memória persistente, acesso a ferramentas externas e capacidade de executar ações — não apenas gerar texto
              {" "}<a href="https://fastcompanybrasil.com/ia/a-virada-dos-agentes-de-ia-o-que-mudou-em-2025-e-o-que-esperar-de-2026/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Fast Company Brasil]</a>.
            </p>
            <p className="mt-4">
              Em termos práticos: um chatbot responde. Um agente decide, age e aprende com o resultado. Um agente de vendas pode qualificar um lead, consultar o CRM, montar uma proposta e enviar um e-mail — tudo sem intervenção humana
              {" "}<a href="https://www.mobiletime.com.br/noticias/21/07/2025/agentes-de-ia-onda/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Mobile Time]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que funciona para PMEs hoje</h2>
            <p>Os casos com maior retorno documentado em PMEs brasileiras são os de menor complexidade e maior volume repetitivo:</p>
            <ul className="list-none space-y-3 mt-4">
              {[
                { titulo: "Atendimento ao cliente via WhatsApp", detalhe: "Triagem de perguntas frequentes, status de pedidos, agendamentos. Resultado: redução de 40% no tempo médio de resposta, segundo relatório da Salesforce (State of Customer Service 2025)." },
                { titulo: "Qualificação de leads", detalhe: "Agentes que fazem as primeiras perguntas, classificam a intenção e só passam para humano quando o lead está quente. Empresas como Escale usam isso em telecom e energia no Brasil." },
                { titulo: "Triagem de documentos", detalhe: "Leitura e extração de dados de contratos, notas fiscais e laudos. Especialmente útil para escritórios contábeis e imobiliárias." },
                { titulo: "Suporte interno de TI e RH", detalhe: "Agentes que respondem dúvidas de colaboradores sobre processos, políticas e ferramentas — liberando o time para problemas reais." },
              ].map((item, i) => (
                <li key={i} className="border border-white/8 p-5 bg-[#0d0d0d]">
                  <div className="text-white font-semibold mb-1">{item.titulo}</div>
                  <div className="text-white/45 text-sm">{item.detalhe}</div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/40">
              Fonte: <a href="https://growsmart.com.br/automacao-atendimento-ia-pme/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">GrowSmart</a>, <a href="https://www.mobiletime.com.br/noticias/21/07/2025/agentes-de-ia-onda/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">Mobile Time</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Os riscos que ninguém menciona</h2>
            <p>
              Agentes de IA são sistemas não-determinísticos. Isso significa que para a mesma entrada, o sistema pode produzir saídas diferentes em momentos distintos. Em ambientes onde previsibilidade é requisito — financeiro, jurídico, saúde — esse é um problema fundamental
              {" "}<a href="https://www.robertodiasduarte.com.br/agentes-de-ia-desvendando-valor-e-desafios-para-negocios/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Roberto Dias Duarte]</a>.
            </p>
            <p className="mt-4">
              Há também o custo de escala. Cada iteração do agente — cada "rodada" de raciocínio — consome tokens. Um agente que leva 10 iterações para concluir uma tarefa pode custar 10 vezes mais do que um chatbot simples. Calcule: custo do modelo × número médio de iterações × volume mensal
              {" "}<a href="https://www.robertodiasduarte.com.br/ia-agents-limites-riscos-e-casos-de-uso-praticos/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[Roberto Dias Duarte]</a>.
            </p>
            <p className="mt-4">
              E existe o risco de prompt injection — quando entradas maliciosas manipulam o agente a executar ações não autorizadas. Agentes com acesso a APIs de pagamento ou bancos de dados são alvos especialmente sensíveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Antes de investir: as perguntas certas</h2>
            <ul className="list-none space-y-3">
              {[
                "O problema envolve variabilidade real ou é repetitivo e regrado? (Se regrado, RPA ou automação tradicional pode resolver com menos risco)",
                "Os dados que o agente vai usar são de qualidade, atualizados e acessíveis?",
                "O custo de inferência justifica o retorno? Faça a conta antes de contratar.",
                "Você tem como auditar o que o agente fez e por quê?",
                "Há revisão humana nos pontos críticos do fluxo?",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#C8922A] mt-0.5 flex-shrink-0">◈</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">O que esperar de 2026 em diante</h2>
            <p>
              A tendência mais clara, segundo análise da Fast Company Brasil, é a especialização: modelos otimizados para domínios específicos — contábil, jurídico, logístico — com menor custo e maior precisão do que LLMs generalistas. O mercado está saindo do "qual modelo é melhor?" para "qual modelo faz mais sentido para este processo específico?"
              {" "}<a href="https://gptmaker.ai/principais-modelos-llm-2026/" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] underline hover:opacity-70">[GPTMaker]</a>.
            </p>
          </section>

          <section className="border-t border-white/10 pt-10">
            <p className="text-white/40 text-sm">
              Na STR Software construímos agentes de IA para automação de processos em projetos como <a href="https://tributoimoveis.com.br" target="_blank" rel="noopener noreferrer" className="text-[#C8922A] hover:opacity-70">TributoImóveis</a>. Se quiser avaliar se faz sentido para o seu negócio, <a href="/#contato" className="text-[#C8922A] hover:opacity-70">fale com a gente</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
