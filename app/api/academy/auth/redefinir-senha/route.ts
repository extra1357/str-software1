import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { hashSenhaAcademy } from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

const SENHA_MINIMA = 12;
const SENHA_MAXIMA = 128;

const ERRO_TOKEN =
  "Este link de recuperacao e invalido ou expirou. Solicite um novo link.";

function respostaTokenInvalido() {
  return NextResponse.json(
    { erro: ERRO_TOKEN },
    { status: 400 },
  );
}

function obterAppOrigin(): string | null {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    return null;
  }

  try {
    const url = new URL(appUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const appOrigin = obterAppOrigin();

    if (!appOrigin) {
      console.error(
        "[academy/redefinir-senha] configuracao APP_URL invalida",
      );

      return NextResponse.json(
        { erro: "Servico temporariamente indisponivel." },
        { status: 503 },
      );
    }

    const origin = request.headers.get("origin");

    if (origin !== appOrigin) {
      console.warn(
        "[academy/redefinir-senha] origem da requisicao rejeitada",
      );

      return NextResponse.json(
        { erro: "Origem da requisicao nao autorizada." },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { erro: "Solicitacao invalida." },
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
        "[academy/redefinir-senha] formato de token invalido",
      );

      return respostaTokenInvalido();
    }

    if (
      senha.length < SENHA_MINIMA ||
      senha.length > SENHA_MAXIMA
    ) {
      return NextResponse.json(
        {
          erro:
            `A senha deve ter entre ${SENHA_MINIMA} ` +
            `e ${SENHA_MAXIMA} caracteres.`,
        },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const agora = new Date();

    const reset =
      await prisma.academyPasswordResetToken.findUnique({
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

    if (
      !reset ||
      reset.usedAt !== null ||
      reset.expiresAt <= agora ||
      !reset.aluno.ativo ||
      reset.aluno.emailVerificadoEm === null
    ) {
      console.warn(
        "[academy/redefinir-senha] token indisponivel",
      );

      return respostaTokenInvalido();
    }

    const novoHash = await hashSenhaAcademy(senha);

    await prisma.$transaction(async (tx) => {
      const consumo =
        await tx.academyPasswordResetToken.updateMany({
          where: {
            id: reset.id,
            alunoId: reset.alunoId,
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

      const atualizacaoAluno =
        await tx.academyAluno.updateMany({
          where: {
            id: reset.alunoId,
            ativo: true,
            emailVerificadoEm: {
              not: null,
            },
          },
          data: {
            senhaHash: novoHash,
            sessionVersion: {
              increment: 1,
            },
          },
        });

      if (atualizacaoAluno.count !== 1) {
        throw new Error("ALUNO_NAO_DISPONIVEL");
      }

      await tx.academyPasswordResetToken.updateMany({
        where: {
          alunoId: reset.alunoId,
          usedAt: null,
        },
        data: {
          usedAt: agora,
        },
      });
    });

    console.info(
      "[academy/redefinir-senha] senha redefinida e sessoes anteriores invalidadas",
    );

    return NextResponse.json({
      sucesso: true,
    });
  } catch (erro) {
    if (
      erro instanceof Error &&
      (
        erro.message === "TOKEN_NAO_DISPONIVEL" ||
        erro.message === "ALUNO_NAO_DISPONIVEL"
      )
    ) {
      console.warn(
        "[academy/redefinir-senha] token ou aluno deixou de estar disponivel",
      );

      return respostaTokenInvalido();
    }

    console.error(
      "[academy/redefinir-senha] falha interna",
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
          "Nao foi possivel redefinir a senha. Tente novamente.",
      },
      { status: 500 },
    );
  }
}