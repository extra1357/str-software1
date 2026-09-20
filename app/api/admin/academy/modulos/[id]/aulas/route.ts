import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { exigirUsuarioAdmin } from "@/lib/auth-rbac";
import { PAPEIS_ACADEMY_ADMIN } from "@/lib/rbac-politicas";
import { prisma } from "@/lib/prisma";

const aulaSchema = z.object({
  titulo: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(1).max(180),
  resumo: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((valor) => valor || null),
  conteudo: z.string().trim().min(1),
  ordem: z.number().int().min(1).max(9999),
  statusEditorial: z.enum(["RASCUNHO", "PUBLICADA", "ARQUIVADA"]),
  ativo: z.boolean().default(true),
});

type ContextoRota = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  contexto: ContextoRota,
) {
  const acesso = await exigirUsuarioAdmin(
    request,
    PAPEIS_ACADEMY_ADMIN,
  );

  if (!acesso.ok) {
    return acesso.resposta;
  }

  const { id: moduloId } = await contexto.params;

  console.info("[ACADEMY][CMS][AULAS][POST] Inicio", {
    moduloId,
    usuarioId: acesso.usuario.id,
  });

  try {
    const corpo = await request.json();
    const validacao = aulaSchema.safeParse(corpo);

    if (!validacao.success) {
      console.warn("[ACADEMY][CMS][AULAS][POST] Payload invalido", {
        moduloId,
        issues: validacao.error.issues,
      });

      return NextResponse.json(
        {
          erro: "Dados invalidos.",
          detalhes: validacao.error.flatten(),
        },
        { status: 400 },
      );
    }

    const modulo = await prisma.academyModulo.findUnique({
      where: {
        id: moduloId,
      },
      select: {
        id: true,
      },
    });

    if (!modulo) {
      console.warn("[ACADEMY][CMS][AULAS][POST] Modulo nao encontrado", {
        moduloId,
      });

      return NextResponse.json(
        { erro: "Modulo nao encontrado." },
        { status: 404 },
      );
    }

    const aula = await prisma.academyAula.create({
      data: {
        moduloId,
        titulo: validacao.data.titulo,
        slug: validacao.data.slug,
        resumo: validacao.data.resumo,
        conteudo: validacao.data.conteudo,
        ordem: validacao.data.ordem,
        statusEditorial: validacao.data.statusEditorial,
        ativo: validacao.data.ativo,
      },
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
    });

    console.info("[ACADEMY][CMS][AULAS][POST] Aula criada", {
      aulaId: aula.id,
      moduloId,
    });

    return NextResponse.json(
      { aula },
      { status: 201 },
    );
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn("[ACADEMY][CMS][AULAS][POST] Conflito de unicidade", {
        moduloId,
        meta: erro.meta,
      });

      return NextResponse.json(
        {
          erro:
            "Ja existe uma aula com este slug ou esta ordem neste modulo.",
        },
        { status: 409 },
      );
    }

    console.error("[ACADEMY][CMS][AULAS][POST] Falha inesperada", {
      moduloId,
      erro,
    });

    return NextResponse.json(
      { erro: "Nao foi possivel criar a aula." },
      { status: 500 },
    );
  }
}