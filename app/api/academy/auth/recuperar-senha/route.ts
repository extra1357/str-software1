import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const RESET_EXPIRACAO_MINUTOS = 30;
const RESET_INTERVALO_MINIMO_MINUTOS = 1;
const RESET_JANELA_MINUTOS = 30;
const RESET_MAX_SOLICITACOES = 5;

const RESPOSTA_GENERICA =
  "Se existir uma conta Academy ativa e verificada com este e-mail, enviaremos as instrucoes para redefinir a senha.";

function respostaGenerica() {
  return NextResponse.json({
    sucesso: true,
    mensagem: RESPOSTA_GENERICA,
  });
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

function origemValida(
  request: Request,
  appOrigin: string,
): boolean {
  const origin = request.headers.get("origin");

  return origin === appOrigin;
}

function escaparHtml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function gerarHtmlRecuperacao(
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
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#18181b;padding:32px 40px;">
              <p style="margin:0;color:#C8922A;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                STR Academy
              </p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                Redefinicao de senha
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#27272a;font-size:15px;line-height:1.6;">
                Ola, ${nomeSeguro}.
              </p>
              <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
                Recebemos uma solicitacao para redefinir a senha da sua conta STR Academy.
              </p>
              <a href="${linkSeguro}"
                 style="display:inline-block;background:#18181b;color:#ffffff;font-weight:700;font-size:14px;padding:13px 24px;border-radius:7px;text-decoration:none;">
                Redefinir minha senha
              </a>
              <p style="margin:24px 0 0;color:#52525b;font-size:13px;line-height:1.6;">
                Este link e valido por 30 minutos e pode ser utilizado apenas uma vez.
              </p>
              <p style="margin:16px 0 0;color:#71717a;font-size:12px;line-height:1.6;">
                Se voce nao solicitou a redefinicao, ignore este e-mail.
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

export async function POST(request: Request) {
  try {
    const appOrigin = obterAppOrigin();

    if (!appOrigin) {
      console.error(
        "[academy/recuperar-senha] configuracao APP_URL invalida",
      );

      return NextResponse.json(
        { erro: "Servico temporariamente indisponivel." },
        { status: 503 },
      );
    }

    if (!origemValida(request, appOrigin)) {
      console.warn(
        "[academy/recuperar-senha] origem da requisicao rejeitada",
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
      console.warn(
        "[academy/recuperar-senha] corpo JSON invalido",
      );

      return respostaGenerica();
    }

    const email =
      typeof body === "object" &&
      body !== null &&
      "email" in body &&
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || email.length > 254) {
      return respostaGenerica();
    }

    const aluno = await prisma.academyAluno.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        emailVerificadoEm: true,
      },
    });

    if (
      !aluno ||
      !aluno.ativo ||
      aluno.emailVerificadoEm === null
    ) {
      return respostaGenerica();
    }

    const agora = new Date();

    const umMinutoAtras = new Date(
      agora.getTime() -
        RESET_INTERVALO_MINIMO_MINUTOS * 60 * 1000,
    );

    const trintaMinutosAtras = new Date(
      agora.getTime() -
        RESET_JANELA_MINUTOS * 60 * 1000,
    );

    const [solicitacaoRecente, solicitacoesNaJanela] =
      await Promise.all([
        prisma.academyPasswordResetToken.findFirst({
          where: {
            alunoId: aluno.id,
            createdAt: {
              gte: umMinutoAtras,
            },
          },
          select: {
            id: true,
          },
        }),

        prisma.academyPasswordResetToken.count({
          where: {
            alunoId: aluno.id,
            createdAt: {
              gte: trintaMinutosAtras,
            },
          },
        }),
      ]);

    if (
      solicitacaoRecente ||
      solicitacoesNaJanela >= RESET_MAX_SOLICITACOES
    ) {
      console.warn(
        "[academy/recuperar-senha] solicitacao limitada por rate limit",
      );

      return respostaGenerica();
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !resendFromEmail) {
      console.error(
        "[academy/recuperar-senha] configuracao de e-mail incompleta",
      );

      return NextResponse.json(
        { erro: "Servico temporariamente indisponivel." },
        { status: 503 },
      );
    }

    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      agora.getTime() +
        RESET_EXPIRACAO_MINUTOS * 60 * 1000,
    );

    const resetCriado = await prisma.$transaction(
      async (tx) => {
        await tx.academyPasswordResetToken.updateMany({
          where: {
            alunoId: aluno.id,
            usedAt: null,
          },
          data: {
            usedAt: agora,
          },
        });

        return tx.academyPasswordResetToken.create({
          data: {
            alunoId: aluno.id,
            tokenHash,
            expiresAt,
          },
          select: {
            id: true,
          },
        });
      },
    );

    const resetUrl = new URL(
      "/academy/redefinir-senha",
      appOrigin,
    );

    resetUrl.searchParams.set("token", token);

    const resend = new Resend(resendApiKey);

    try {
      const resultadoEnvio = await resend.emails.send({
        from: resendFromEmail,
        to: aluno.email,
        subject: "Redefinicao de senha - STR Academy",
        html: gerarHtmlRecuperacao(
          aluno.nome,
          resetUrl.toString(),
        ),
      });

      if (resultadoEnvio.error) {
        console.error(
          "[academy/recuperar-senha] provedor recusou o envio",
        );

        await prisma.academyPasswordResetToken.updateMany({
          where: {
            id: resetCriado.id,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        });

        return NextResponse.json(
          { erro: "Servico temporariamente indisponivel." },
          { status: 503 },
        );
      }
    } catch {
      console.error(
        "[academy/recuperar-senha] falha durante envio do e-mail",
      );

      await prisma.academyPasswordResetToken.updateMany({
        where: {
          id: resetCriado.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return NextResponse.json(
        { erro: "Servico temporariamente indisponivel." },
        { status: 503 },
      );
    }

    console.info(
      "[academy/recuperar-senha] solicitacao processada com sucesso",
    );

    return respostaGenerica();
  } catch (erro) {
    console.error(
      "[academy/recuperar-senha] falha interna",
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );

    return NextResponse.json(
      { erro: "Servico temporariamente indisponivel." },
      { status: 503 },
    );
  }
}