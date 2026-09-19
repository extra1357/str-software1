import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const verificacaoSchema = z.object({
  token: z
    .string()
    .trim()
    .length(64, "Token invalido.")
    .regex(/^[a-f0-9]{64}$/i, "Token invalido."),
});

export async function POST(
  request: NextRequest,
) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      console.warn(
        "[academy/verificar-email] corpo da requisicao invalido",
      );

      return NextResponse.json(
        {
          erro: "Requisicao invalida.",
        },
        {
          status: 400,
        },
      );
    }

    const validacao =
      verificacaoSchema.safeParse(body);

    if (!validacao.success) {
      console.warn(
        "[academy/verificar-email] formato de token invalido",
      );

      return NextResponse.json(
        {
          erro:
            "Link de verificacao invalido ou expirado.",
        },
        {
          status: 400,
        },
      );
    }

    const tokenHash =
      createHash("sha256")
        .update(validacao.data.token)
        .digest("hex");

    const agora = new Date();

    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const registro =
            await tx.academyEmailVerificationToken.findUnique({
              where: {
                tokenHash,
              },
              select: {
                id: true,
                alunoId: true,
                expiresAt: true,
                usedAt: true,
                aluno: {
                  select: {
                    ativo: true,
                    emailVerificadoEm: true,
                  },
                },
              },
            });

          if (!registro) {
            return {
              status: "INVALIDO" as const,
            };
          }

          if (registro.usedAt) {
            /*
             * Se o token ja foi utilizado e a conta
             * realmente esta verificada, tratamos a
             * operacao como idempotente.
             */
            if (
              registro.aluno.ativo &&
              registro.aluno.emailVerificadoEm
            ) {
              return {
                status: "JA_VERIFICADO" as const,
              };
            }

            return {
              status: "INVALIDO" as const,
            };
          }

          if (registro.expiresAt <= agora) {
            return {
              status: "EXPIRADO" as const,
            };
          }

          if (!registro.aluno.ativo) {
            return {
              status: "INVALIDO" as const,
            };
          }

          if (registro.aluno.emailVerificadoEm) {
            await tx.academyEmailVerificationToken.update({
              where: {
                id: registro.id,
              },
              data: {
                usedAt: agora,
              },
            });

            return {
              status: "JA_VERIFICADO" as const,
            };
          }

          const consumido =
            await tx.academyEmailVerificationToken.updateMany({
              where: {
                id: registro.id,
                usedAt: null,
                expiresAt: {
                  gt: agora,
                },
              },
              data: {
                usedAt: agora,
              },
            });

          if (consumido.count !== 1) {
            return {
              status: "INVALIDO" as const,
            };
          }

          await tx.academyAluno.update({
            where: {
              id: registro.alunoId,
            },
            data: {
              emailVerificadoEm: agora,
            },
          });

          /*
           * Invalida outros tokens ainda abertos
           * deste mesmo aluno.
           */
          await tx.academyEmailVerificationToken.updateMany({
            where: {
              alunoId: registro.alunoId,
              usedAt: null,
            },
            data: {
              usedAt: agora,
            },
          });

          return {
            status: "VERIFICADO" as const,
          };
        },
      );

    if (
      resultado.status === "VERIFICADO" ||
      resultado.status === "JA_VERIFICADO"
    ) {
      console.info(
        "[academy/verificar-email] e-mail confirmado",
      );

      return NextResponse.json(
        {
          sucesso: true,
          mensagem:
            "E-mail confirmado. Agora voce pode acessar a STR Academy.",
        },
        {
          status: 200,
        },
      );
    }

    if (resultado.status === "EXPIRADO") {
      console.warn(
        "[academy/verificar-email] token expirado",
      );

      return NextResponse.json(
        {
          erro:
            "Link de verificacao expirado.",
        },
        {
          status: 410,
        },
      );
    }

    console.warn(
      "[academy/verificar-email] token inexistente ou inutilizavel",
    );

    return NextResponse.json(
      {
        erro:
          "Link de verificacao invalido ou expirado.",
      },
      {
        status: 400,
      },
    );
  } catch (erro) {
    console.error(
      "[academy/verificar-email] falha inesperada:",
      erro,
    );

    return NextResponse.json(
      {
        erro:
          "Nao foi possivel verificar o e-mail.",
      },
      {
        status: 500,
      },
    );
  }
}