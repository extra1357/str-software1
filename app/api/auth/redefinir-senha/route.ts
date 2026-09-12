import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { hashSenhaUsuario } from "@/lib/auth-usuario";
import { prisma } from "@/lib/prisma";

const SENHA_MINIMA = 12;
const SENHA_MAXIMA = 128;

const ERRO_TOKEN =
  "Este link de recuperação é inválido ou expirou. Solicite um novo link.";

function respostaTokenInvalido() {
  return NextResponse.json(
    { erro: ERRO_TOKEN },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      console.warn(
        "[usuario/redefinir-senha] corpo JSON inválido",
      );

      return NextResponse.json(
        { erro: "Solicitação inválida." },
        { status: 400 },
      );
    }

    const token =
      typeof body === "object" &&
      body !== null &&
      "token" in body &&
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const senha =
      typeof body === "object" &&
      body !== null &&
      "senha" in body &&
      typeof body.senha === "string"
        ? body.senha
        : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      console.warn(
        "[usuario/redefinir-senha] formato de token inválido",
      );

      return respostaTokenInvalido();
    }

    if (
      senha.length < SENHA_MINIMA ||
      senha.length > SENHA_MAXIMA
    ) {
      return NextResponse.json(
        {
          erro: `A senha deve ter entre ${SENHA_MINIMA} e ${SENHA_MAXIMA} caracteres.`,
        },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const agora = new Date();

    const reset =
      await prisma.usuarioPasswordResetToken.findUnique({
        where: {
          tokenHash,
        },
        select: {
          id: true,
          usuarioId: true,
          expiresAt: true,
          usedAt: true,
          usuario: {
            select: {
              ativo: true,
            },
          },
        },
      });

    if (
      !reset ||
      reset.usedAt !== null ||
      reset.expiresAt <= agora ||
      !reset.usuario.ativo
    ) {
      console.warn(
        "[usuario/redefinir-senha] tentativa com token inválido, utilizado ou expirado",
      );

      return respostaTokenInvalido();
    }

    const novoHash = await hashSenhaUsuario(senha);

    await prisma.$transaction(async (tx) => {
      const consumo =
        await tx.usuarioPasswordResetToken.updateMany({
          where: {
            id: reset.id,
            usuarioId: reset.usuarioId,
            usedAt: null,
            expiresAt: {
              gt: agora,
            },
          },
          data: {
            usedAt: agora,
          },
        });

      if (consumo.count !== 1) {
        throw new Error("TOKEN_NAO_DISPONIVEL");
      }

      const atualizacaoUsuario =
        await tx.usuario.updateMany({
          where: {
            id: reset.usuarioId,
            ativo: true,
          },
          data: {
            senhaHash: novoHash,
            sessionVersion: {
              increment: 1,
            },
          },
        });

      if (atualizacaoUsuario.count !== 1) {
        throw new Error("USUARIO_NAO_DISPONIVEL");
      }

      await tx.usuarioPasswordResetToken.updateMany({
        where: {
          usuarioId: reset.usuarioId,
          usedAt: null,
        },
        data: {
          usedAt: agora,
        },
      });
    });

    console.info(
      "[usuario/redefinir-senha] senha redefinida e sessões anteriores invalidadas",
    );

    return NextResponse.json({
      sucesso: true,
    });
  } catch (erro) {
    if (
      erro instanceof Error &&
      (
        erro.message === "TOKEN_NAO_DISPONIVEL" ||
        erro.message === "USUARIO_NAO_DISPONIVEL"
      )
    ) {
      console.warn(
        "[usuario/redefinir-senha] token ou usuário deixou de estar disponível durante a operação",
      );

      return respostaTokenInvalido();
    }

    console.error(
      "[usuario/redefinir-senha] falha interna ao redefinir senha",
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível redefinir a senha. Tente novamente.",
      },
      { status: 500 },
    );
  }
}