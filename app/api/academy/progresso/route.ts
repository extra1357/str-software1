import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  aulaId: z.string().trim().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const token =
    request.cookies.get(ACADEMY_SESSION_COOKIE)?.value;

  const aluno = await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    return NextResponse.json(
      { erro: "Nao autorizado." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Corpo da requisicao invalido." },
      { status: 400 },
    );
  }

  const validacao = bodySchema.safeParse(body);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Aula invalida." },
      { status: 400 },
    );
  }

  const { aulaId } = validacao.data;

  /*
   * Segurança:
   * - alunoId nunca vem do cliente;
   * - a aula precisa estar publicada e ativa;
   * - o módulo precisa estar publicado e ativo;
   * - a trilha precisa estar publicada e ativa;
   * - o aluno precisa possuir matrícula ATIVA ou CONCLUIDA
   *   nessa mesma trilha.
   */
  const aulaPermitida = await prisma.academyAula.findFirst({
    where: {
      id: aulaId,
      ativo: true,
      statusEditorial: "PUBLICADA",
      modulo: {
        ativo: true,
        statusEditorial: "PUBLICADA",
        trilha: {
          ativo: true,
          statusEditorial: "PUBLICADA",
          matriculas: {
            some: {
              alunoId: aluno.id,
              status: {
                in: ["ATIVA", "CONCLUIDA"],
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!aulaPermitida) {
    /*
     * 404 evita revelar se o ID existe mas pertence
     * a uma trilha sem autorização para este aluno.
     */
    return NextResponse.json(
      { erro: "Aula nao encontrada." },
      { status: 404 },
    );
  }

  const chave = {
    alunoId_aulaId: {
      alunoId: aluno.id,
      aulaId: aulaPermitida.id,
    },
  };

  const selectProgresso = {
    aulaId: true,
    concluida: true,
    concluidaEm: true,
  } as const;

  try {
    let existente = await prisma.academyProgressoAula.findUnique({
      where: chave,
      select: {
        id: true,
        ...selectProgresso,
      },
    });

    if (!existente) {
      try {
        existente = await prisma.academyProgressoAula.create({
          data: {
            alunoId: aluno.id,
            aulaId: aulaPermitida.id,
            concluida: true,
            concluidaEm: new Date(),
          },
          select: {
            id: true,
            ...selectProgresso,
          },
        });

        console.info("[ACADEMY][PROGRESSO][CONCLUSAO_CRIADA]", {
          aulaId: aulaPermitida.id,
        });
      } catch (erro) {
        if (
          typeof erro !== "object" ||
          erro === null ||
          !("code" in erro) ||
          erro.code !== "P2002"
        ) {
          throw erro;
        }

        console.warn("[ACADEMY][PROGRESSO][CONCORRENCIA_P2002]", {
          aulaId: aulaPermitida.id,
        });

        existente = await prisma.academyProgressoAula.findUnique({
          where: chave,
          select: {
            id: true,
            ...selectProgresso,
          },
        });

        if (!existente) {
          throw new Error("PROGRESSO_P2002_SEM_REGISTRO");
        }
      }
    }

    if (!existente.concluida) {
      const atualizacao = await prisma.academyProgressoAula.updateMany({
        where: {
          id: existente.id,
          concluida: false,
        },
        data: {
          concluida: true,
          concluidaEm: new Date(),
        },
      });

      console.info("[ACADEMY][PROGRESSO][CONCLUSAO_EXISTENTE]", {
        aulaId: aulaPermitida.id,
        atualizada: atualizacao.count === 1,
      });
    } else {
      console.info("[ACADEMY][PROGRESSO][JA_CONCLUIDA]", {
        aulaId: aulaPermitida.id,
      });
    }

    const progresso = await prisma.academyProgressoAula.findUnique({
      where: chave,
      select: selectProgresso,
    });

    if (!progresso) {
      throw new Error("PROGRESSO_NAO_ENCONTRADO_APOS_GRAVACAO");
    }

    return NextResponse.json({
      ok: true,
      progresso,
    });
  } catch (erro) {
    console.error("[ACADEMY][PROGRESSO][PERSISTENCIA_FALHOU]", {
      aulaId: aulaPermitida.id,
      codigo:
        typeof erro === "object" &&
        erro !== null &&
        "code" in erro &&
        typeof erro.code === "string"
          ? erro.code
          : "ERRO_NAO_CLASSIFICADO",
    });

    return NextResponse.json(
      { erro: "Nao foi possivel registrar o progresso." },
      { status: 500 },
    );
  }

}