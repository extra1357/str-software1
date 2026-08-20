import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/auth-cliente";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

function gerarSenhaTemporaria(): string {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let senha = "";
  for (let i = 0; i < 12; i++) {
    senha += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return senha;
}

export async function GET(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ clientes });
  } catch (erro) {
    console.error("[admin/clientes] falha ao listar clientes:", erro);
    return NextResponse.json({ erro: "Falha ao listar clientes." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  let nome: string | undefined;
  let email: string | undefined;
  let telefone: string | undefined;

  try {
    const body = await request.json();
    nome = typeof body.nome === "string" ? body.nome.trim() : undefined;
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    telefone = typeof body.telefone === "string" ? body.telefone.trim() : undefined;
  } catch (erro) {
    console.error("[admin/clientes] corpo da requisicao invalido:", erro);
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  if (!nome || !email) {
    return NextResponse.json({ erro: "Nome e email sao obrigatorios." }, { status: 400 });
  }

  const senhaTemporaria = gerarSenhaTemporaria();
  const senhaHash = await hashSenha(senhaTemporaria);

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, telefone: telefone || null, senhaHash },
      select: { id: true, nome: true, email: true, telefone: true, ativo: true, createdAt: true },
    });

    return NextResponse.json({ cliente, senhaTemporaria }, { status: 201 });
  } catch (erro: unknown) {
    const codigoPrisma = (erro as { code?: string })?.code;
    if (codigoPrisma === "P2002") {
      return NextResponse.json({ erro: "Ja existe um cliente com esse email." }, { status: 409 });
    }
    console.error("[admin/clientes] falha ao criar cliente:", erro);
    return NextResponse.json({ erro: "Falha ao criar cliente." }, { status: 500 });
  }
}
