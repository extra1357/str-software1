import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirUsuarioAdmin } from "@/lib/auth-rbac";
import { PAPEIS_ACADEMY_ADMIN } from "@/lib/rbac-politicas";

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
  ativo: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const acesso = await exigirUsuarioAdmin(
    request,
    PAPEIS_ACADEMY_ADMIN,
  );

  if (!acesso.ok) {
    return acesso.resposta;
  }

  try {
    const trilhas = await prisma.academyTrilha.findMany({
      select: {
        id: true,
        titulo: true,
        slug: true,
        descricao: true,
        nivel: true,
        acesso: true,
        statusEditorial: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            modulos: true,
            matriculas: true,
          },
        },
      },
      orderBy: [
        { ativo: "desc" },
        { updatedAt: "desc" },
      ],
    });

    console.info(
      `[ACADEMY][CMS][TRILHAS][GET] usuario=${acesso.usuario.id} total=${trilhas.length}`,
    );

    return NextResponse.json({ trilhas });
  } catch (erro) {
    console.error(
      "[ACADEMY][CMS][TRILHAS][GET] falha ao listar trilhas:",
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel listar as trilhas." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const acesso = await exigirUsuarioAdmin(
    request,
    PAPEIS_ACADEMY_ADMIN,
  );

  if (!acesso.ok) {
    return acesso.resposta;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (erro) {
    console.warn(
      `[ACADEMY][CMS][TRILHAS][POST] corpo invalido usuario=${acesso.usuario.id}`,
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
      `[ACADEMY][CMS][TRILHAS][POST] validacao rejeitada usuario=${acesso.usuario.id}`,
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
    const trilha = await prisma.academyTrilha.create({
      data: validacao.data,
    });

    console.info(
      `[ACADEMY][CMS][TRILHAS][POST] trilha=${trilha.id} criada por usuario=${acesso.usuario.id}`,
    );

    return NextResponse.json(
      { trilha },
      { status: 201 },
    );
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn(
        `[ACADEMY][CMS][TRILHAS][POST] conflito de unicidade usuario=${acesso.usuario.id}`,
      );

      return NextResponse.json(
        { erro: "Ja existe uma trilha com este slug." },
        { status: 409 },
      );
    }

    console.error(
      "[ACADEMY][CMS][TRILHAS][POST] falha ao criar trilha:",
      erro,
    );

    return NextResponse.json(
      { erro: "Nao foi possivel criar a trilha." },
      { status: 500 },
    );
  }
}
