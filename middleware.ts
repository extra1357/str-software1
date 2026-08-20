// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cliente/dashboard")) {
    const temSessao = request.cookies.has("cliente-session");
    if (!temSessao) {
      return NextResponse.redirect(new URL("/cliente/login", request.url));
    }
    return NextResponse.next();
  }

  const isAdmin = request.cookies.get("admin-auth")?.value === "true";

  if (isAdmin) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    console.warn(`[middleware] acesso negado a rota admin sem autenticacao: ${pathname}`);
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/cliente/dashboard/:path*"],
};
