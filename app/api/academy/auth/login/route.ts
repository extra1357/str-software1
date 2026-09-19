import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ACADEMY_SESSION_COOKIE,
  ACADEMY_SESSION_MAX_AGE,
  criarAcademySessionToken,
  estaTravadoAcademyPorRateLimit,
  registrarTentativaAcademyLogin,
  verificarSenhaAcademy,
} from "@/lib/auth-academy";

import { prisma } from "@/lib/prisma";

const schemaLogin = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254),

  senha: z
    .string()
    .min(1)
    .max(128),
});

const MENSAGEM_CREDENCIAIS =
  "E-mail ou senha inválidos.";

function obterIp(
  request: NextRequest,
): string | null {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const ip =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    request.headers
      .get("x-real-ip")
      ?.trim() ||
    null;

  if (!ip) {
    return null;
  }

  return ip.slice(0, 128);
}

function obterAppOrigin(): string | null {
  const appUrl =
    process.env.APP_URL?.trim();

  if (!appUrl) {
    console.error(
      "[academy-login] APP_URL ausente",
    );

    return null;
  }

  try {
    const url = new URL(appUrl);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
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
    console.error(
      "[academy-login] APP_URL invalida",
    );

    return null;
  }
}

function origemPermitida(
  request: NextRequest,
  appOrigin: string,
): boolean {
  const origin =
    request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === appOrigin;
  } catch {
    return false;
  }
}

function respostaCredenciaisInvalidas() {
  return NextResponse.json(
    {
      erro: MENSAGEM_CREDENCIAIS,
    },
    {
      status: 401,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const appOrigin =
      obterAppOrigin();

    if (!appOrigin) {
      console.error(
        "[academy-login] configuracao de origem indisponivel",
      );

      return NextResponse.json(
        {
          erro:
            "Login temporariamente indisponível.",
        },
        {
          status: 503,
        },
      );
    }

    if (
      !origemPermitida(
        request,
        appOrigin,
      )
    ) {
      console.warn(
        "[academy-login] origem rejeitada",
      );

      return NextResponse.json(
        {
          erro:
            "Solicitação não autorizada.",
        },
        {
          status: 403,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          erro:
            "Dados inválidos.",
        },
        {
          status: 400,
        },
      );
    }

    const resultado =
      schemaLogin.safeParse(body);

    if (!resultado.success) {
      return NextResponse.json(
        {
          erro:
            "Dados inválidos.",
        },
        {
          status: 400,
        },
      );
    }

    const email =
      resultado.data.email
        .trim()
        .toLowerCase();

    const senha =
      resultado.data.senha;

    const ip =
      obterIp(request);

    const bloqueado =
      await estaTravadoAcademyPorRateLimit(
        email,
      );

    if (bloqueado) {
      console.warn(
        "[academy-login] rate limit atingido",
      );

      return NextResponse.json(
        {
          erro:
            "Muitas tentativas. Aguarde alguns minutos.",
        },
        {
          status: 429,
        },
      );
    }

    let aluno;

    try {
      aluno =
        await prisma.academyAluno.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            senhaHash: true,
            ativo: true,
            emailVerificadoEm: true,
            sessionVersion: true,
          },
        });
    } catch {
      console.error(
        "[academy-login] falha ao consultar aluno",
      );

      return NextResponse.json(
        {
          erro:
            "Login temporariamente indisponível.",
        },
        {
          status: 503,
        },
      );
    }

    if (!aluno) {
      await registrarTentativaAcademyLogin(
        email,
        false,
        ip,
      );

      return respostaCredenciaisInvalidas();
    }

    let senhaCorreta = false;

    try {
      senhaCorreta =
        await verificarSenhaAcademy(
          senha,
          aluno.senhaHash,
        );
    } catch {
      console.error(
        "[academy-login] falha ao verificar credencial",
      );

      return NextResponse.json(
        {
          erro:
            "Login temporariamente indisponível.",
        },
        {
          status: 503,
        },
      );
    }

    if (
      !senhaCorreta ||
      !aluno.ativo ||
      !aluno.emailVerificadoEm
    ) {
      await registrarTentativaAcademyLogin(
        email,
        false,
        ip,
        aluno.id,
      );

      return respostaCredenciaisInvalidas();
    }

    let token: string;

    try {
      token =
        criarAcademySessionToken(
          aluno.id,
          aluno.sessionVersion,
        );
    } catch {
      console.error(
        "[academy-login] falha ao criar sessao",
      );

      return NextResponse.json(
        {
          erro:
            "Login temporariamente indisponível.",
        },
        {
          status: 503,
        },
      );
    }

    await registrarTentativaAcademyLogin(
      email,
      true,
      ip,
      aluno.id,
    );

    const response =
      NextResponse.json(
        {
          mensagem:
            "Login realizado com sucesso.",
        },
        {
          status: 200,
        },
      );

    response.cookies.set(
      ACADEMY_SESSION_COOKIE,
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          ACADEMY_SESSION_MAX_AGE,
      },
    );

    console.info(
      "[academy-login] login concluido",
    );

    return response;
  } catch {
    console.error(
      "[academy-login] falha inesperada",
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível realizar o login.",
      },
      {
        status: 500,
      },
    );
  }
}