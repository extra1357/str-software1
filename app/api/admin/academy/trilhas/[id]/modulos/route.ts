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
  ativo: z.boolean().default(true),
});

export async function POST(
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

  const { id: trilhaId } = await context.params;

  if (!trilhaId) {
    return NextResponse.json(
      { erro: "Trilha invalida." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.warn(
      `[ACADEMY][CMS][MODULOS][POST] corpo invalido trilha=${trilhaId} usuario=${acesso.usuario.id}`,
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
      `[ACADEMY][CMS][MODULOS][POST] validacao rejeitada trilha=${trilhaId} usuario=${acesso.usuario.id}`,
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
    const trilha = await prisma.academyTrilha.findUnique({
      where: { id: trilhaId },
      select: {
        id: true,
        ativo: true,
      },
    });

    if (!trilha) {
      return NextResponse.json(
        { erro: "Trilha nao encontrada." },
        { status: 404 },
      );
    }

    const modulo = await prisma.academyModulo.create({
      data: {
        trilhaId,
        ...validacao.data,
      },
    });

    console.info(
      `[ACADEMY][CMS][MODULOS][POST] modulo=${modulo.id} trilha=${trilhaId} criado por usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json(
      { modulo },
      { status: 201 },
    );
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn(
        `[ACADEMY][CMS][MODULOS][POST] ordem duplicada trilha=${trilhaId} usuario=${acesso.usuario.id}`,
      );

      return NextResponse.json(
        {
          erro: "Ja existe um modulo com esta ordem nesta trilha.",
        },
        { status: 409 },
      );
    }

    console.error(
      `[ACADEMY][CMS][MODULOS][POST] falha trilha=${trilhaId}:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel criar o modulo." },
      { status: 500 },
    );
  }
}