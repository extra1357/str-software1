import { NextRequest, NextResponse } from "next/server";

export function isAdminAutenticado(request: NextRequest): boolean {
  return request.cookies.get("admin-auth")?.value === "true";
}

export function respostaNaoAutorizado(): NextResponse {
  console.warn("[auth-admin] tentativa de acesso sem autenticacao (checagem redundante da rota)");
  return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
}
