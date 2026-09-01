import { NextRequest, NextResponse } from "next/server";

export function isAdminCookieAutenticado(
  valorCookie: string | undefined
): boolean {
  return valorCookie === "true";
}

export function isAdminAutenticado(request: NextRequest): boolean {
  return isAdminCookieAutenticado(
    request.cookies.get("admin-auth")?.value
  );
}

export function respostaNaoAutorizado(): NextResponse {
  console.warn(
    "[auth-admin] tentativa de acesso sem autenticacao (checagem redundante da rota)"
  );

  return NextResponse.json(
    { erro: "Nao autorizado." },
    { status: 401 }
  );
}
