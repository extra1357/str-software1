import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ACADEMY_SESSION_COOKIE,
  obterAcademyAlunoPorToken,
} from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  trilhaId: z.string().trim().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const token =
    request.cookies.get(ACADEMY_SESSION_COOKIE)?.value;

  const aluno = await obterAcademyAlunoPorToken(token);

  if (!aluno) {
    return NextResponse.json(
      { erro: "Não autorizado." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const validacao = bodySchema.safeParse(body);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Trilha inválida." },
      { status: 400 },
    );
  }

  const trilha = await prisma.academyTrilha.findFirst({
    where: {
      id: validacao.data.trilhaId,
      ativo: true,
      statusEditorial: "PUBLICADA",
      acesso: {
        in: ["PUBLICA", "ALUNOS"],
      },
    },
    select: {
      id: true,
    },
  });

  if (!trilha) {
    return NextResponse.json(
      { erro: "Trilha não encontrada." },
      { status: 404 },
    );
  }

  /*
   * A chave composta alunoId + trilhaId impede
   * matrículas duplicadas.
   *
   * Se uma matrícula anterior estiver CANCELADA,
   * a ação do próprio aluno a reativa.
   */
  const chave = {
    alunoId_trilhaId: {
      alunoId: aluno.id,
      trilhaId: trilha.id,
    },
  };

  const selectMatricula = {
    id: true,
    trilhaId: true,
    status: true,
    matriculadoEm: true,
  } as const;

  try {
    let matricula = await prisma.academyMatricula.findUnique({
      where: chave,
      select: selectMatricula,
    });

    if (!matricula) {
      try {
        matricula = await prisma.academyMatricula.create({
          data: {
            alunoId: aluno.id,
            trilhaId: trilha.id,
            status: "ATIVA",
          },
          select: selectMatricula,
        });

        console.info("[ACADEMY][MATRICULAS][CRIADA]", {
          trilhaId: trilha.id,
        });
      } catch (erro) {
        const codigo =
          typeof erro === "object" &&
          erro !== null &&
          "code" in erro
            ? erro.code
            : null;

        if (codigo !== "P2002") {
          throw erro;
        }

        console.warn("[ACADEMY][MATRICULAS][CONCORRENCIA_P2002]", {
          trilhaId: trilha.id,
        });

        matricula = await prisma.academyMatricula.findUnique({
          where: chave,
          select: selectMatricula,
        });

        if (!matricula) {
          throw new Error("MATRICULA_P2002_SEM_REGISTRO");
        }
      }
    }

    if (matricula.status === "CANCELADA") {
      const resultado = await prisma.academyMatricula.updateMany({
        where: {
          id: matricula.id,
          status: "CANCELADA",
        },
        data: {
          status: "ATIVA",
          concluidaEm: null,
        },
      });

      console.info("[ACADEMY][MATRICULAS][REATIVACAO]", {
        trilhaId: trilha.id,
        atualizada: resultado.count === 1,
      });

      matricula = await prisma.academyMatricula.findUnique({
        where: chave,
        select: selectMatricula,
      });

      if (!matricula) {
        throw new Error("MATRICULA_NAO_ENCONTRADA_APOS_REATIVACAO");
      }
    } else {
      console.info("[ACADEMY][MATRICULAS][EXISTENTE]", {
        trilhaId: trilha.id,
        status: matricula.status,
      });
    }

    return NextResponse.json({
      ok: true,
      matricula,
    });
  } catch (erro) {
    console.error("[ACADEMY][MATRICULAS][PERSISTENCIA_FALHOU]", {
      trilhaId: trilha.id,
      codigo:
        typeof erro === "object" &&
        erro !== null &&
        "code" in erro &&
        typeof erro.code === "string"
          ? erro.code
          : "ERRO_NAO_CLASSIFICADO",
    });

    return NextResponse.json(
      { erro: "Nao foi possivel realizar a matricula." },
      { status: 500 },
    );
  }
}