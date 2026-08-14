// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fonte moderna e profissional
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
        {/* Aqui podes incluir uma Navbar futuramente */}
        {children}
        {/* Aqui podes incluir um Footer futuramente */}
      </body>
    </html>
  );
}