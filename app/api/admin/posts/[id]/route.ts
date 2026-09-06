import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isAdminAutenticado,
  respostaNaoAutorizado,
} from "@/lib/auth-admin";

const STATUS_VALIDOS = [
  "RASCUNHO",
  "AGENDADO",
  "PUBLICADO",
  "ARQUIVADO",
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function textoOpcional(valor: unknown): string | null {
  const resultado = texto(valor);
  return resultado || null;
}

function listaTexto(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugValido(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function statusValido(status: string): boolean {
  return STATUS_VALIDOS.includes(
    status as (typeof STATUS_VALIDOS)[number],
  );
}

function dataOpcional(valor: unknown): Date | null {
  const valorTexto = texto(valor);

  if (!valorTexto) {
    return null;
  }

  const data = new Date(valorTexto);

  return Number.isNaN(data.getTime()) ? null : data;
}

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
      { erro: "Publicacao invalida." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.error(
      `[admin/posts/${id}] corpo da requisicao invalido:`,
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

  const dados = body as Record<string, unknown>;

  const titulo = texto(dados.titulo);
  const slug = texto(dados.slug).toLowerCase();
  const resumo = texto(dados.resumo);
  const conteudo = texto(dados.conteudo);
  const categoria = texto(dados.categoria);
  const status = texto(dados.status).toUpperCase();

  const leituraMinutos =
    typeof dados.leituraMinutos === "number"
      ? dados.leituraMinutos
      : typeof dados.leituraMinutos === "string" &&
          dados.leituraMinutos.trim() !== ""
        ? Number(dados.leituraMinutos)
        : null;

  if (!titulo || !resumo || !conteudo || !categoria) {
    return NextResponse.json(
      {
        erro:
          "Titulo, resumo, conteudo e categoria sao obrigatorios.",
      },
      { status: 400 },
    );
  }

  if (!slug || !slugValido(slug)) {
    return NextResponse.json(
      { erro: "Slug invalido." },
      { status: 400 },
    );
  }

  if (!statusValido(status)) {
    return NextResponse.json(
      { erro: "Status invalido." },
      { status: 400 },
    );
  }

  if (
    leituraMinutos !== null &&
    (!Number.isInteger(leituraMinutos) || leituraMinutos <= 0)
  ) {
    return NextResponse.json(
      { erro: "Tempo de leitura invalido." },
      { status: 400 },
    );
  }

  const publicadoEm = dataOpcional(dados.publicadoEm);
  const agendadoPara = dataOpcional(dados.agendadoPara);

  if (status === "AGENDADO" && !agendadoPara) {
    return NextResponse.json(
      { erro: "Data de agendamento e obrigatoria." },
      { status: 400 },
    );
  }

  try {
    const existente = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        publicadoEm: true,
      },
    });

    if (!existente) {
      return NextResponse.json(
        { erro: "Publicacao nao encontrada." },
        { status: 404 },
      );
    }

    const post = await prisma.post.update({
      where: {
        id,
      },
      data: {
        titulo,
        slug,
        resumo,
        conteudo,
        categoria,
        leituraMinutos,
        imagemCapa: textoOpcional(dados.imagemCapa),
        status,
        destaque: dados.destaque === true,
        regioes: listaTexto(dados.regioes),
        servicos: listaTexto(dados.servicos),
        seoTitle: textoOpcional(dados.seoTitle),
        seoDescription: textoOpcional(dados.seoDescription),
        canonical: textoOpcional(dados.canonical),
        ctaTexto: textoOpcional(dados.ctaTexto),
        ctaUrl: textoOpcional(dados.ctaUrl),
        publicadoEm:
          status === "PUBLICADO"
            ? publicadoEm || existente.publicadoEm || new Date()
            : publicadoEm,
        agendadoPara:
          status === "AGENDADO" ? agendadoPara : null,
      },
    });

    console.log(`[admin/posts/${id}] post alterado`);

    return NextResponse.json({ post });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return NextResponse.json(
        { erro: "Ja existe uma publicacao com este slug." },
        { status: 409 },
      );
    }

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Publicacao nao encontrada." },
        { status: 404 },
      );
    }

    console.error(
      `[admin/posts/${id}] falha ao alterar post:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Falha ao alterar post." },
      { status: 500 },
    );
  }
}