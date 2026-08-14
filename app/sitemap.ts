import { MetadataRoute } from "next";

const baseUrl = "https://strsoftware.com.br";

const SERVICOS = ["sistemas-web", "marketplace", "agentes-ia", "saas", "consultoria", "mobile"];
const REGIOES  = ["sao-paulo", "grande-sp", "sorocaba", "campinas", "ribeirao-preto", "santos", "interior-sp", "brasil"];
const BLOG     = ["software-house-vs-time-interno", "agentes-ia-pme-2025", "digitalizacao-interior-sp"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    ...SERVICOS.map(s => ({ url: `${baseUrl}/servicos/${s}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...REGIOES.map(r  => ({ url: `${baseUrl}/regioes/${r}`,  lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...BLOG.map(b     => ({ url: `${baseUrl}/blog/${b}`,     lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
