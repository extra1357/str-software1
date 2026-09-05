import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

export async function GET(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  try {
    const faturas = await prisma.fatura.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ faturas });
  } catch (erro) {
    console.error("[admin/faturas] falha ao listar faturas:", erro);

    return NextResponse.json(
      { erro: "Falha ao listar faturas." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.error("[admin/faturas] corpo da requisicao invalido:", erro);

    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  const dados = body as Record<string, unknown>;

  const clienteId =
    typeof dados.clienteId === "string" ? dados.clienteId.trim() : "";

  const descricao =
    typeof dados.descricao === "string" ? dados.descricao.trim() : "";

  const valor =
    typeof dados.valor === "number"
      ? dados.valor
      : typeof dados.valor === "string" && dados.valor.trim() !== ""
        ? Number(dados.valor.replace(",", "."))
        : NaN;

  const vencimentoTexto =
    typeof dados.vencimento === "string" ? dados.vencimento.trim() : "";

  if (!clienteId) {
    return NextResponse.json(
      { erro: "Cliente e obrigatorio." },
      { status: 400 },
    );
  }

  if (!descricao) {
    return NextResponse.json(
      { erro: "Descricao e obrigatoria." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json(
      { erro: "Valor deve ser maior que zero." },
      { status: 400 },
    );
  }

  if (!vencimentoTexto) {
    return NextResponse.json(
      { erro: "Vencimento e obrigatorio." },
      { status: 400 },
    );
  }

  const vencimento = new Date(`${vencimentoTexto}T12:00:00`);

  if (Number.isNaN(vencimento.getTime())) {
    return NextResponse.json(
      { erro: "Vencimento invalido." },
      { status: 400 },
    );
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { erro: "Cliente nao encontrado." },
        { status: 404 },
      );
    }

    if (!cliente.ativo) {
      return NextResponse.json(
        { erro: "Nao e possivel gerar fatura para cliente inativo." },
        { status: 400 },
      );
    }

    const fatura = await prisma.fatura.create({
      data: {
        clienteId,
        descricao,
        valor,
        vencimento,
        status: "PENDENTE",
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true,
          },
        },
      },
    });

    console.log(
      `[admin/faturas] fatura ${fatura.id} criada para cliente ${clienteId}`,
    );

    return NextResponse.json(
      { fatura },
      { status: 201 },
    );
  } catch (erro) {
    console.error("[admin/faturas] falha ao criar fatura:", erro);

    return NextResponse.json(
      { erro: "Falha ao criar fatura." },
      { status: 500 },
    );
  }
}