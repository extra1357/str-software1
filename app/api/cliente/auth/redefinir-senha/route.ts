import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/auth-cliente";

const SENHA_MINIMA = 12;
const SENHA_MAXIMA = 128;

const ERRO_TOKEN =
  "Este link de recuperação é inválido ou expirou. Solicite um novo link.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    const senha =
      typeof body?.senha === "string"
        ? body.senha
        : "";

    if (!token) {
      return NextResponse.json(
        { erro: ERRO_TOKEN },
        { status: 400 },
      );
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

    const reset = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        clienteId: true,
        expiresAt: true,
        usedAt: true,
        cliente: {
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
      !reset.cliente.ativo
    ) {
      console.warn(
        "[redefinir-senha] tentativa com token invalido, utilizado ou expirado",
      );

      return NextResponse.json(
        { erro: ERRO_TOKEN },
        { status: 400 },
      );
    }

    const novoHash = await hashSenha(senha);

    const resultado = await prisma.$transaction(async (tx) => {
      const consumo = await tx.passwordResetToken.updateMany({
        where: {
          id: reset.id,
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

      await tx.cliente.update({
        where: {
          id: reset.clienteId,
        },
        data: {
          senhaHash: novoHash,
          sessionVersion: {
            increment: 1,
          },
        },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          clienteId: reset.clienteId,
          usedAt: null,
        },
        data: {
          usedAt: agora,
        },
      });

      return {
        sucesso: true,
      };
    });

    console.info(
      "[redefinir-senha] senha redefinida e sessoes anteriores invalidadas",
    );

    return NextResponse.json(resultado);
  } catch (erro) {
    if (
      erro instanceof Error &&
      erro.message === "TOKEN_NAO_DISPONIVEL"
    ) {
      console.warn(
        "[redefinir-senha] token deixou de estar disponivel durante a operacao",
      );

      return NextResponse.json(
        { erro: ERRO_TOKEN },
        { status: 400 },
      );
    }

    console.error(
      "[redefinir-senha] falha ao redefinir senha:",
      erro,
    );

    return NextResponse.json(
      { erro: "Não foi possível redefinir a senha." },
      { status: 500 },
    );
  }
}