import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verificarAdminSessionToken,
} from "@/lib/auth-admin";
import {
  verificarUsuarioSessionToken,
} from "@/lib/auth-usuario-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cliente/dashboard")) {
    const clienteSession =
      request.cookies.get("cliente-session")?.value;

    if (!clienteSession) {
      return NextResponse.redirect(
        new URL("/cliente/login", request.url)
      );
    }

    return NextResponse.next();
  }

  const rotaAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  if (!rotaAdmin) {
    return NextResponse.next();
  }

  const adminToken =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const autenticadoLegado =
    verificarAdminSessionToken(adminToken);

  const autenticadoComoUsuario =
    verificarUsuarioSessionToken(adminToken) !== null;

  if (autenticadoLegado || autenticadoComoUsuario) {
    return NextResponse.next();
  }

  console.warn(
    `[proxy] acesso administrativo negado: ${pathname}`
  );

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { erro: "Nao autorizado." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cliente/dashboard/:path*",
  ],
};
