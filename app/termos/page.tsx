import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Termos de Uso | STR Software",
  description: "Termos de uso do site e dos serviços da STR Software.",
};

// ATENÇÃO: este é um rascunho estrutural. Os trechos marcados com
// [A DEFINIR] precisam ser preenchidos com os dados reais da empresa antes
// de publicar, e o conteúdo como um todo deve passar por revisão jurídica.
const SECOES = [
  {
    titulo: "1. Aceitação dos Termos",
    paragrafos: [
      "Ao utilizar o site strsoftware.com.br ou contratar os serviços da STR Software, você concorda com os termos descritos nesta página. Caso não concorde com algum ponto, entre em contato conosco antes de prosseguir.",
    ],
  },
  {
    titulo: "2. Sobre a STR Software",
    paragrafos: [
      "[RAZÃO SOCIAL A DEFINIR], inscrita no CNPJ [A DEFINIR], atuando sob a marca STR Software, é uma empresa de desenvolvimento de software sediada em São Paulo, Brasil.",
    ],
  },
  {
    titulo: "3. Descrição dos Serviços",
    paragrafos: [
      "Prestamos serviços de desenvolvimento de sistemas web, aplicativos mobile, marketplaces, plataformas SaaS, agentes de inteligência artificial e consultoria técnica, conforme escopo definido em proposta comercial específica para cada cliente.",
    ],
  },
  {
    titulo: "4. Propostas e Contratos",
    paragrafos: [
      "O escopo, prazo, valores e condições de pagamento de cada projeto são definidos em proposta comercial e/ou contrato específico, que prevalece sobre este documento em caso de conflito entre os dois.",
    ],
  },
  {
    titulo: "5. Propriedade Intelectual",
    paragrafos: [
      "Salvo acordo em contrário previsto em contrato, o código-fonte desenvolvido especificamente para o cliente é de propriedade do cliente após a quitação integral dos valores acordados. Bibliotecas, frameworks e ferramentas de terceiros utilizadas no projeto permanecem sob suas respectivas licenças originais.",
    ],
  },
  {
    titulo: "6. Responsabilidades do Cliente",
    paragrafos: [
      "O cliente é responsável por fornecer informações corretas e completas necessárias ao desenvolvimento do projeto, bem como pelos acessos, credenciais e conteúdos fornecidos à STR Software para execução do trabalho.",
    ],
  },
  {
    titulo: "7. Pagamentos e Prazos",
    paragrafos: [
      "Os valores, forma de pagamento e cronograma de entregas são definidos em proposta comercial. Atrasos no pagamento podem resultar em suspensão temporária dos serviços, conforme condições estabelecidas em contrato.",
    ],
  },
  {
    titulo: "8. Limitação de Responsabilidade",
    paragrafos: [
      "A STR Software se compromete a empregar boas práticas técnicas no desenvolvimento dos projetos, mas não garante ausência total de falhas de software (bugs). Correções após a entrega são tratadas conforme o acordo de suporte vigente para cada projeto.",
    ],
  },
  {
    titulo: "9. Rescisão",
    paragrafos: [
      "Qualquer das partes pode rescindir a prestação de serviços mediante aviso prévio, conforme condições estabelecidas em contrato específico de cada projeto.",
    ],
  },
  {
    titulo: "10. Alterações destes Termos",
    paragrafos: [
      "Estes termos podem ser atualizados periodicamente. A versão vigente estará sempre disponível nesta página, com a data da última atualização indicada no topo.",
    ],
  },
  {
    titulo: "11. Legislação Aplicável",
    paragrafos: [
      "Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de [CIDADE A DEFINIR] para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.",
    ],
  },
  {
    titulo: "12. Contato",
    paragrafos: [
      "Dúvidas sobre estes termos podem ser enviadas para [E-MAIL DE CONTATO A DEFINIR].",
    ],
  },
];

export default function TermosPage() {
  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
        <section className="pt-40 pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">Documento legal</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Termos de Uso</h1>
            <p className="text-white/30 text-sm font-mono mb-16">Última atualização: agosto de 2026</p>

            <div className="space-y-12">
              {SECOES.map((s) => (
                <div key={s.titulo}>
                  <h2 className="text-white font-bold text-xl mb-4">{s.titulo}</h2>
                  {s.paragrafos.map((p, i) => (
                    <p key={i} className="text-white/55 text-base leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
