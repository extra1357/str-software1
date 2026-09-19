import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";
import { z } from "zod";

import { hashSenhaAcademy } from "@/lib/auth-academy";
import { prisma } from "@/lib/prisma";

const VERIFICACAO_EXPIRACAO_HORAS = 24;

const CADASTRO_JANELA_MINUTOS = 15;
const CADASTRO_MAX_TENTATIVAS_EMAIL = 5;
const CADASTRO_MAX_TENTATIVAS_IP = 20;

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(120, "Nome muito longo."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail valido.")
    .max(254, "E-mail muito longo."),

  senha: z
    .string()
    .min(12, "A senha deve ter pelo menos 12 caracteres.")
    .max(128, "A senha deve ter no maximo 128 caracteres."),
});

function escaparHtml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function obterIp(request: NextRequest): string | null {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const primeiroIp =
      forwardedFor.split(",")[0]?.trim();

    if (primeiroIp) {
      return primeiroIp.slice(0, 128);
    }
  }

  const realIp =
    request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp.slice(0, 128);
  }

  return null;
}

function obterAppUrl(): URL | null {
  const valor = process.env.APP_URL?.trim();

  if (!valor) {
    return null;
  }

  try {
    const url = new URL(valor);

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

    url.pathname = "/";
    url.search = "";
    url.hash = "";

    return url;
  } catch {
    return null;
  }
}

function origemPermitida(
  request: NextRequest,
  appUrl: URL,
): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === appUrl.origin;
  } catch {
    return false;
  }
}

function respostaGenericaCadastro() {
  return NextResponse.json(
    {
      sucesso: true,
      mensagem:
        "Se os dados puderem ser utilizados, enviaremos as instrucoes de verificacao para o e-mail informado.",
    },
    {
      status: 202,
    },
  );
}

function gerarHtmlVerificacao(
  nome: string,
  link: string,
): string {
  const nomeSeguro = escaparHtml(nome);
  const linkSeguro = escaparHtml(link);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>

<body style="margin:0;padding:0;background:#f4f2ed;font-family:system-ui,sans-serif;">
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#f4f2ed;padding:32px 16px;"
  >
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;"
        >

          <tr>
            <td style="background:#0d0d0d;padding:32px 40px;">
              <p style="margin:0;color:#C8922A;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                STR Academy
              </p>

              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                Confirme seu e-mail
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">

              <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;line-height:1.6;">
                Ola, ${nomeSeguro}.
              </p>

              <p style="margin:0 0 24px;color:#4a4a4a;font-size:15px;line-height:1.6;">
                Seu cadastro na STR Academy foi recebido.
                Confirme seu endereco de e-mail para liberar o acesso.
              </p>

              <a
                href="${linkSeguro}"
                style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:700;font-size:14px;padding:13px 24px;border-radius:7px;text-decoration:none;"
              >
                Confirmar meu e-mail
              </a>

              <p style="margin:24px 0 0;color:#4a4a4a;font-size:13px;line-height:1.6;">
                Este link e valido por 24 horas e pode ser utilizado apenas uma vez.
              </p>

              <p style="margin:16px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">
                Se voce nao realizou este cadastro, ignore esta mensagem.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function registrarTentativa(
  email: string,
  ip: string | null,
  sucesso: boolean,
): Promise<void> {
  await prisma.academyCadastroAttempt.create({
    data: {
      email,
      ip,
      sucesso,
    },
  });
}

async function verificarRateLimit(
  email: string,
  ip: string | null,
): Promise<boolean> {
  const desde = new Date(
    Date.now() -
      CADASTRO_JANELA_MINUTOS *
        60 *
        1000,
  );

  const porEmailPromise =
    prisma.academyCadastroAttempt.count({
      where: {
        email,
        createdAt: {
          gte: desde,
        },
      },
    });

  const porIpPromise = ip
    ? prisma.academyCadastroAttempt.count({
        where: {
          ip,
          createdAt: {
            gte: desde,
          },
        },
      })
    : Promise.resolve(0);

  const [porEmail, porIp] =
    await Promise.all([
      porEmailPromise,
      porIpPromise,
    ]);

  return (
    porEmail < CADASTRO_MAX_TENTATIVAS_EMAIL &&
    porIp < CADASTRO_MAX_TENTATIVAS_IP
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const appUrl = obterAppUrl();

    const resendApiKey =
      process.env.RESEND_API_KEY;

    const resendFromEmail =
      process.env.RESEND_FROM_EMAIL;

    if (
      !appUrl ||
      !resendApiKey ||
      !resendFromEmail
    ) {
      console.error(
        "[academy/cadastro] configuracao de infraestrutura indisponivel",
      );

      return NextResponse.json(
        {
          erro:
            "Servico temporariamente indisponivel.",
        },
        {
          status: 503,
        },
      );
    }

    if (!origemPermitida(request, appUrl)) {
      console.warn(
        "[academy/cadastro] origem da requisicao recusada",
      );

      return NextResponse.json(
        {
          erro: "Requisicao nao autorizada.",
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
      console.warn(
        "[academy/cadastro] corpo da requisicao invalido",
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
      cadastroSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          erro: "Dados de cadastro invalidos.",
          campos:
            validacao.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const nome =
      validacao.data.nome.trim();

    const email =
      validacao.data.email
        .trim()
        .toLowerCase();

    const senha =
      validacao.data.senha;

    const ip = obterIp(request);

    let permitido: boolean;

    try {
      permitido =
        await verificarRateLimit(email, ip);
    } catch {
      console.error(
        "[academy/cadastro] falha ao consultar rate limit",
      );

      return NextResponse.json(
        {
          erro:
            "Servico temporariamente indisponivel.",
        },
        {
          status: 503,
        },
      );
    }

    if (!permitido) {
      console.warn(
        "[academy/cadastro] rate limit atingido",
      );

      return NextResponse.json(
        {
          erro:
            "Muitas tentativas. Tente novamente mais tarde.",
        },
        {
          status: 429,
        },
      );
    }

    try {
      await registrarTentativa(
        email,
        ip,
        false,
      );
    } catch {
      console.error(
        "[academy/cadastro] falha ao registrar rate limit",
      );

      return NextResponse.json(
        {
          erro:
            "Servico temporariamente indisponivel.",
        },
        {
          status: 503,
        },
      );
    }

    const existente =
      await prisma.academyAluno.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

    if (existente) {
      console.info(
        "[academy/cadastro] solicitacao encerrada sem criacao",
      );

      return respostaGenericaCadastro();
    }

    const senhaHash =
      await hashSenhaAcademy(senha);

    const token =
      randomBytes(32).toString("hex");

    const tokenHash =
      createHash("sha256")
        .update(token)
        .digest("hex");

    const expiresAt =
      new Date(
        Date.now() +
          VERIFICACAO_EXPIRACAO_HORAS *
            60 *
            60 *
            1000,
      );

    let resultado: {
      id: string;
      nome: string;
      email: string;
    };

    try {
      resultado =
        await prisma.$transaction(
          async (tx) => {
            const aluno =
              await tx.academyAluno.create({
                data: {
                  nome,
                  email,
                  senhaHash,
                  ativo: true,
                },
                select: {
                  id: true,
                  nome: true,
                  email: true,
                },
              });

            await tx.academyEmailVerificationToken.create({
              data: {
                alunoId: aluno.id,
                tokenHash,
                expiresAt,
              },
            });

            return aluno;
          },
        );
    } catch (erro) {
      if (
        erro instanceof
          Prisma.PrismaClientKnownRequestError &&
        erro.code === "P2002"
      ) {
        console.info(
          "[academy/cadastro] concorrencia de cadastro tratada",
        );

        return respostaGenericaCadastro();
      }

      throw erro;
    }

    const linkUrl =
      new URL(
        "/academy/verificar-email",
        appUrl,
      );

    linkUrl.searchParams.set(
      "token",
      token,
    );

    const resend =
      new Resend(resendApiKey);

    let envioFalhou = false;

    try {
      const envio =
        await resend.emails.send({
          from: resendFromEmail,
          to: resultado.email,
          subject:
            "Confirme seu e-mail - STR Academy",
          html: gerarHtmlVerificacao(
            resultado.nome,
            linkUrl.toString(),
          ),
        });

      if (envio.error) {
        envioFalhou = true;
      }
    } catch {
      envioFalhou = true;
    }

    if (envioFalhou) {
      console.error(
        "[academy/cadastro] envio da verificacao falhou",
      );

      try {
        await prisma.academyEmailVerificationToken.updateMany({
          where: {
            alunoId: resultado.id,
            tokenHash,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        });
      } catch {
        console.error(
          "[academy/cadastro] falha ao invalidar token apos erro de envio",
        );
      }

      return NextResponse.json(
        {
          erro:
            "Servico temporariamente indisponivel.",
        },
        {
          status: 503,
        },
      );
    }

    try {
      await prisma.academyCadastroAttempt.updateMany({
        where: {
          email,
          ip,
          sucesso: false,
        },
        data: {
          sucesso: true,
        },
      });
    } catch {
      console.error(
        "[academy/cadastro] falha ao atualizar telemetria do cadastro",
      );
    }

    console.info(
      "[academy/cadastro] cadastro processado e verificacao solicitada",
    );

    return respostaGenericaCadastro();
  } catch {
    console.error(
      "[academy/cadastro] falha inesperada no processamento",
    );

    return NextResponse.json(
      {
        erro:
          "Nao foi possivel processar o cadastro.",
      },
      {
        status: 500,
      },
    );
  }
}