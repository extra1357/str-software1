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

const trilhaSchema = z.object({
  titulo: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  descricao: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((valor) => valor || null),
  nivel: z.enum(["APRENDIZ", "JUNIOR", "OPERACIONAL"]),
  acesso: z.enum(["PUBLICA", "ALUNOS", "INTERNA"]),
  statusEditorial: z.enum(["RASCUNHO", "PUBLICADA", "ARQUIVADA"]),
  ativo: z.boolean(),
});

export async function GET(
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
      { erro: "Trilha invalida." },
      { status: 400 },
    );
  }

  try {
    const trilha = await prisma.academyTrilha.findUnique({
      where: { id },
      include: {
        modulos: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            statusEditorial: true,
            ordem: true,
            ativo: true,
            _count: {
              select: {
                aulas: true,
              },
            },
          },
          orderBy: { ordem: "asc" },
        },
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });

    if (!trilha) {
      return NextResponse.json(
        { erro: "Trilha nao encontrada." },
        { status: 404 },
      );
    }

    console.info(
      `[ACADEMY][CMS][TRILHAS][GET-ID] trilha=${id} usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json({ trilha });
  } catch (erro) {
    console.error(
      `[ACADEMY][CMS][TRILHAS][GET-ID] falha trilha=${id}:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel consultar a trilha." },
      { status: 500 },
    );
  }
}

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
      { erro: "Trilha invalida." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.warn(
      `[ACADEMY][CMS][TRILHAS][PATCH] corpo invalido trilha=${id} usuario=${acesso.usuario.id}`,
      erro,
    );

    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  const validacao = trilhaSchema.safeParse(body);

  if (!validacao.success) {
    console.warn(
      `[ACADEMY][CMS][TRILHAS][PATCH] validacao rejeitada trilha=${id} usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json(
      {
        erro: "Dados da trilha invalidos.",
        campos: validacao.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const existente = await prisma.academyTrilha.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existente) {
      return NextResponse.json(
        { erro: "Trilha nao encontrada." },
        { status: 404 },
      );
    }

    const trilha = await prisma.academyTrilha.update({
      where: { id },
      data: validacao.data,
    });

    console.info(
      `[ACADEMY][CMS][TRILHAS][PATCH] trilha=${trilha.id} alterada por usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json({ trilha });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn(
        `[ACADEMY][CMS][TRILHAS][PATCH] conflito de unicidade trilha=${id} usuario=${acesso.usuario.id}`,
      );

      return NextResponse.json(
        { erro: "Ja existe uma trilha com este slug." },
        { status: 409 },
      );
    }

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Trilha nao encontrada." },
        { status: 404 },
      );
    }

    console.error(
      `[ACADEMY][CMS][TRILHAS][PATCH] falha trilha=${id}:`,
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel alterar a trilha." },
      { status: 500 },
    );
  }
}
