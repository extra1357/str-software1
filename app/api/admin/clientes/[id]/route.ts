import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  const { id } = await params;

  let dadosPermitidos: { nome?: string; email?: string; telefone?: string | null; ativo?: boolean } = {};

  try {
    const body = await request.json();

    if (typeof body.nome === "string") {
      dadosPermitidos.nome = body.nome.trim();
    }
    if (typeof body.email === "string") {
      dadosPermitidos.email = body.email.trim().toLowerCase();
    }
    if (typeof body.telefone === "string" || body.telefone === null) {
      dadosPermitidos.telefone = body.telefone;
    }
    if (typeof body.ativo === "boolean") {
      dadosPermitidos.ativo = body.ativo;
    }
  } catch (erro) {
    console.error("[admin/clientes/id] corpo da requisicao invalido:", erro);
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  if (Object.keys(dadosPermitidos).length === 0) {
    return NextResponse.json({ erro: "Nenhum campo valido para atualizar." }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: dadosPermitidos,
      select: { id: true, nome: true, email: true, telefone: true, ativo: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ cliente });
  } catch (erro: unknown) {
    const codigoPrisma = (erro as { code?: string })?.code;
    if (codigoPrisma === "P2025") {
      return NextResponse.json({ erro: "Cliente nao encontrado." }, { status: 404 });
    }
    if (codigoPrisma === "P2002") {
      return NextResponse.json({ erro: "Ja existe um cliente com esse email." }, { status: 409 });
    }
    console.error("[admin/clientes/id] falha ao atualizar cliente:", erro);
    return NextResponse.json({ erro: "Falha ao atualizar cliente." }, { status: 500 });
  }
}
