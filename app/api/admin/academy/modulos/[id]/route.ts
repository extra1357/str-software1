import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirUsuarioAdmin } from "@/lib/auth-rbac";
import { PAPEIS_ACADEMY_ADMIN } from "@/lib/rbac-politicas";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const moduloSchema = z.object({
  titulo: z.string().trim().min(3).max(160),
  descricao: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((valor) => valor || null),
  ordem: z.number().int().min(1).max(9999),
  statusEditorial: z.enum(["RASCUNHO", "PUBLICADA", "ARQUIVADA"]),
  ativo: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const acesso = await exigirUsuarioAdmin(
    request,
    PAPEIS_ACADEMY_ADMIN,
  );

  if (!acesso.ok) {
    return acesso.resposta;
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { erro: "Modulo invalido." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.warn(
      `[ACADEMY][CMS][MODULOS][PATCH] corpo invalido modulo=${id} usuario=${acesso.usuario.id}`,
      erro,
    );

    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  const validacao = moduloSchema.safeParse(body);

  if (!validacao.success) {
    console.warn(
      `[ACADEMY][CMS][MODULOS][PATCH] validacao rejeitada modulo=${id} usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json(
      {
        erro: "Dados do modulo invalidos.",
        campos: validacao.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const existente = await prisma.academyModulo.findUnique({
      where: { id },
      select: {
        id: true,
        trilhaId: true,
      },
    });

    if (!existente) {
      return NextResponse.json(
        { erro: "Modulo nao encontrado." },
        { status: 404 },
      );
    }

    const modulo = await prisma.academyModulo.update({
      where: { id },
      data: validacao.data,
    });

    console.info(
      `[ACADEMY][CMS][MODULOS][PATCH] modulo=${modulo.id} trilha=${existente.trilhaId} alterado por usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json({ modulo });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn(
        `[ACADEMY][CMS][MODULOS][PATCH] conflito de ordem modulo=${id} usuario=${acesso.usuario.id}`,
      );

      return NextResponse.json(
        {
          erro: "Ja existe um modulo com esta ordem nesta trilha.",
        },
        { status: 409 },
      );
    }

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Modulo nao encontrado." },
        { status: 404 },
      );
    }

    console.error(
      `[ACADEMY][CMS][MODULOS][PATCH] falha modulo=${id}:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel alterar o modulo." },
      { status: 500 },
    );
  }
}
export async function GET(
  request: NextRequest,
  contexto: RouteContext,
) {
  const acesso = await exigirUsuarioAdmin(
    request,
    PAPEIS_ACADEMY_ADMIN,
  );

  if (!acesso.ok) {
    return acesso.resposta;
  }

  const { id } = await contexto.params;

  console.info("[ACADEMY][CMS][MODULOS][GET] Inicio", {
    moduloId: id,
    usuarioId: acesso.usuario.id,
  });

  try {
    const modulo = await prisma.academyModulo.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        trilhaId: true,
        titulo: true,
        descricao: true,
        ordem: true,
        statusEditorial: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        trilha: {
          select: {
            id: true,
            titulo: true,
          },
        },
        aulas: {
          select: {
            id: true,
            moduloId: true,
            titulo: true,
            slug: true,
            resumo: true,
            conteudo: true,
            conteudoEstruturado: true,
            ordem: true,
            statusEditorial: true,
            ativo: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });

    if (!modulo) {
      console.warn("[ACADEMY][CMS][MODULOS][GET] Modulo nao encontrado", {
        moduloId: id,
      });

      return NextResponse.json(
        { erro: "Modulo nao encontrado." },
        { status: 404 },
      );
    }

    console.info("[ACADEMY][CMS][MODULOS][GET] Modulo carregado", {
      moduloId: modulo.id,
      totalAulas: modulo.aulas.length,
    });

    return NextResponse.json({ modulo });
  } catch (erro) {
    console.error("[ACADEMY][CMS][MODULOS][GET] Falha inesperada", {
      moduloId: id,
      erro,
    });

    return NextResponse.json(
      { erro: "Nao foi possivel carregar o modulo." },
      { status: 500 },
    );
  }
}