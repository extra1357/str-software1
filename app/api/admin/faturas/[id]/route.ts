import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { erro: "Fatura invalida." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.error(
      `[admin/faturas/${id}] corpo da requisicao invalido:`,
      erro,
    );

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

  try {
    const faturaAtual = await prisma.fatura.findUnique({
      where: {
        id,
      },
    });

    if (!faturaAtual) {
      return NextResponse.json(
        { erro: "Fatura nao encontrada." },
        { status: 404 },
      );
    }

    if (faturaAtual.status !== "PENDENTE") {
      return NextResponse.json(
        {
          erro:
            "Somente faturas pendentes podem ser alteradas ou canceladas.",
        },
        { status: 409 },
      );
    }

    const dados = body as Record<string, unknown>;

    const acao =
      typeof dados.acao === "string"
        ? dados.acao.trim().toUpperCase()
        : "";

    if (acao === "CANCELAR") {
      const fatura = await prisma.fatura.update({
        where: {
          id,
        },
        data: {
          status: "CANCELADA",
        },
      });

      console.log(`[admin/faturas/${id}] fatura cancelada`);

      return NextResponse.json({ fatura });
    }

    if (acao !== "EDITAR") {
      return NextResponse.json(
        { erro: "Acao invalida." },
        { status: 400 },
      );
    }

    const descricao =
      typeof dados.descricao === "string"
        ? dados.descricao.trim()
        : "";

    const valor =
      typeof dados.valor === "number"
        ? dados.valor
        : typeof dados.valor === "string" &&
            dados.valor.trim() !== ""
          ? Number(dados.valor.replace(",", "."))
          : NaN;

    const vencimentoTexto =
      typeof dados.vencimento === "string"
        ? dados.vencimento.trim()
        : "";

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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimentoTexto)) {
      return NextResponse.json(
        { erro: "Vencimento invalido." },
        { status: 400 },
      );
    }

    const [ano, mes, dia] = vencimentoTexto
      .split("-")
      .map(Number);

    const vencimento = new Date(
      ano,
      mes - 1,
      dia,
      12,
      0,
      0,
      0,
    );

    if (
      Number.isNaN(vencimento.getTime()) ||
      vencimento.getFullYear() !== ano ||
      vencimento.getMonth() !== mes - 1 ||
      vencimento.getDate() !== dia
    ) {
      return NextResponse.json(
        { erro: "Vencimento invalido." },
        { status: 400 },
      );
    }

    const fatura = await prisma.fatura.update({
      where: {
        id,
      },
      data: {
        descricao,
        valor,
        vencimento,
      },
    });

    console.log(`[admin/faturas/${id}] fatura alterada`);

    return NextResponse.json({ fatura });
  } catch (erro) {
    console.error(
      `[admin/faturas/${id}] falha ao alterar fatura:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Falha ao alterar fatura." },
      { status: 500 },
    );
  }
}