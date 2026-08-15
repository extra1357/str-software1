import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STR SOFTWARE | Desenvolvimento de Sistemas Web de Alta Performance",
  description: "Especialistas em Next.js, TypeScript e Node.js. Criamos soluções robustas e escaláveis para o seu negócio.",
  keywords: ["Desenvolvimento de sites", "Sistemas Web", "Next.js", "Software House", "STR Software"],
  authors: [{ name: "STR Software" }],
  openGraph: {
    title: "STR SOFTWARE | Sistemas Web Premium",
    description: "Transformamos ideias em software de alta tecnologia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className="scroll-smooth">
      <body className={`${inter.className} bg-premium-gradient antialiased`}>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}