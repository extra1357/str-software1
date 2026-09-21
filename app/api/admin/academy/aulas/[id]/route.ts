import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { exigirUsuarioAdmin } from "@/lib/auth-rbac";
import { PAPEIS_ACADEMY_ADMIN } from "@/lib/rbac-politicas";
import { prisma } from "@/lib/prisma";
import {
  academyConteudoEstruturadoSchema,
  conteudoEstruturadoParaTexto,
} from "@/lib/academy-conteudo";

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
  conteudo: z.string().trim().min(1).optional(),
  conteudoEstruturado: academyConteudoEstruturadoSchema.nullable().optional(),
  ordem: z.number().int().min(1).max(9999),
  statusEditorial: z.enum(["RASCUNHO", "PUBLICADA", "ARQUIVADA"]),
  ativo: z.boolean(),
});

type ContextoRota = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
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

  const { id } = await contexto.params;

  console.info("[ACADEMY][CMS][AULAS][PATCH] Inicio", {
    aulaId: id,
    usuarioId: acesso.usuario.id,
  });

  try {
    const corpo = await request.json();
    const validacao = aulaSchema.safeParse(corpo);

    if (!validacao.success) {
      console.warn("[ACADEMY][CMS][AULAS][PATCH] Payload invalido", {
        aulaId: id,
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

    const existente = await prisma.academyAula.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        moduloId: true,
      },
    });

    if (!existente) {
      console.warn("[ACADEMY][CMS][AULAS][PATCH] Aula nao encontrada", {
        aulaId: id,
      });

      return NextResponse.json(
        { erro: "Aula nao encontrada." },
        { status: 404 },
      );
    }

    const conteudoFinal =
      validacao.data.conteudoEstruturado !== undefined &&
      validacao.data.conteudoEstruturado !== null
        ? conteudoEstruturadoParaTexto(validacao.data.conteudoEstruturado)
        : validacao.data.conteudo;

    if (!conteudoFinal) {
      console.warn("[ACADEMY][CMS][AULAS][PATCH] Conteudo vazio", {
        aulaId: id,
      });

      return NextResponse.json(
        { erro: "A aula precisa possuir conteudo." },
        { status: 400 },
      );
    }

    const aula = await prisma.academyAula.update({
      where: {
        id,
      },
      data: {
        titulo: validacao.data.titulo,
        slug: validacao.data.slug,
        resumo: validacao.data.resumo,
        conteudo: conteudoFinal,
        ...(validacao.data.conteudoEstruturado !== undefined
          ? {
              conteudoEstruturado:
                validacao.data.conteudoEstruturado === null
                  ? Prisma.DbNull
                  : validacao.data.conteudoEstruturado,
            }
          : {}),
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

    console.info("[ACADEMY][CMS][AULAS][PATCH] Aula atualizada", {
      aulaId: aula.id,
      moduloId: existente.moduloId,
    });

    return NextResponse.json({ aula });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      console.warn("[ACADEMY][CMS][AULAS][PATCH] Conflito de unicidade", {
        aulaId: id,
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

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Aula nao encontrada." },
        { status: 404 },
      );
    }

    console.error("[ACADEMY][CMS][AULAS][PATCH] Falha inesperada", {
      aulaId: id,
      erro,
    });

    return NextResponse.json(
      { erro: "Nao foi possivel atualizar a aula." },
      { status: 500 },
    );
  }
}
