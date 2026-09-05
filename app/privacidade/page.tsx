import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Política de Privacidade | STR Software",
  description: "Como a STR Software coleta, usa e protege os dados pessoais de visitantes e clientes.",
};

// Política de Privacidade da STR Software.
// Recomenda-se revisão jurídica periódica e acompanhamento da LGPD.
type Secao = {
  titulo: string;
  paragrafos: string[];
  lista?: string[];
  paragrafosApos?: string[];
};

const SECOES: Secao[] = [
  {
    titulo: "1. Quem Somos",
    paragrafos: [
      "Esta Política de Privacidade explica como a STR Software coleta, usa e protege os dados pessoais de visitantes do site strsoftware.com.br e de clientes, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).",
    ],
  },
  {
    titulo: "2. Quais Dados Coletamos",
    paragrafos: [],
    lista: [
      "Dados fornecidos voluntariamente pelo formulário de contato: nome, e-mail, telefone/WhatsApp e informações sobre o projeto de interesse.",
      "Dados de navegação coletados automaticamente: páginas visitadas, tempo de permanência, origem do acesso, tipo de dispositivo e navegador, coletados via Google Analytics.",
      "Dados de conversão para fins de publicidade, coletados via Google Ads, quando o visitante chega ao site a partir de um anúncio.",
    ],
  },
  {
    titulo: "3. Como Usamos seus Dados",
    paragrafos: ["Utilizamos os dados coletados para:"],
    lista: [
      "Responder a solicitações de contato e orçamento.",
      "Entrar em contato sobre propostas comerciais.",
      "Entender como o site é utilizado, para melhorá-lo continuamente.",
      "Medir a efetividade de campanhas de marketing.",
    ],
    paragrafosApos: ["Não vendemos nem alugamos dados pessoais a terceiros."],
  },
  {
    titulo: "4. Cookies e Ferramentas de Terceiros",
    paragrafos: [
      "Utilizamos cookies e ferramentas de terceiros para analisar o tráfego do site e medir a efetividade de campanhas: Google Analytics (GA4) e Google Ads. Essas ferramentas podem coletar informações sobre sua navegação de acordo com as respectivas políticas de privacidade do Google. Você pode gerenciar ou desativar cookies diretamente nas configurações do seu navegador.",
    ],
  },
  {
    titulo: "5. Compartilhamento de Dados",
    paragrafos: [
      "Compartilhamos dados pessoais apenas quando necessário para a prestação dos nossos serviços (por exemplo, com provedores de e-mail transacional e hospedagem) ou quando exigido por lei ou ordem judicial.",
    ],
  },
  {
    titulo: "6. Armazenamento e Segurança",
    paragrafos: [
      "Os dados são armazenados em servidores com práticas de segurança adequadas ao tipo de informação tratada. Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra acesso não autorizado, perda ou alteração.",
    ],
  },
  {
    titulo: "7. Seus Direitos (LGPD)",
    paragrafos: ["Nos termos da LGPD, você tem direito a:"],
    lista: [
      "Confirmação da existência de tratamento dos seus dados.",
      "Acesso aos dados que temos sobre você.",
      "Correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.",
      "Portabilidade dos dados a outro fornecedor de serviço.",
      "Eliminação dos dados tratados com base no seu consentimento.",
      "Revogação do consentimento a qualquer momento.",
      "Informação sobre com quem compartilhamos seus dados.",
    ],
  },
  {
    titulo: "8. Retenção de Dados",
    paragrafos: [
      "Mantemos os dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por obrigações legais e regulatórias aplicáveis.",
    ],
  },
  {
    titulo: "9. Alterações desta Política",
    paragrafos: [
      "Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável. Recomendamos revisitar esta página regularmente.",
    ],
  },
  {
    titulo: "10. Contato / Encarregado de Dados (DPO)",
    paragrafos: [
      "Para exercer seus direitos previstos na LGPD ou esclarecer dúvidas sobre esta política, entre em contato pelo e-mail contato@str.com.br.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
        <section className="pt-40 pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-[#C8922A] text-xs font-mono tracking-[0.3em] uppercase mb-3">Documento legal</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Política de Privacidade</h1>
            <p className="text-white/30 text-sm font-mono mb-16">Última atualização: agosto de 2026</p>

            <div className="space-y-12">
              {SECOES.map((s) => (
                <div key={s.titulo}>
                  <h2 className="text-white font-bold text-xl mb-4">{s.titulo}</h2>
                  {s.paragrafos.map((p, i) => (
                    <p key={i} className="text-white/55 text-base leading-relaxed mb-3">
                      {p}
                    </p>
                  ))}
                  {s.lista && (
                    <ul className="space-y-2 mb-3">
                      {s.lista.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-white/55 text-base leading-relaxed">
                          <span className="text-[#C8922A] mt-1.5 text-xs">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.paragrafosApos?.map((p, i) => (
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
