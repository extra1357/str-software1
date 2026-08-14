import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/login"] }],
    sitemap: "https://strsoftware.com.br/sitemap.xml",
    host:    "https://strsoftware.com.br",
  };
}
