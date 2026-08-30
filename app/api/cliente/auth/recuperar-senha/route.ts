import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const RESET_EXPIRACAO_MINUTOS = 30;
const RESET_INTERVALO_MINIMO_MINUTOS = 1;
const RESET_JANELA_MINUTOS = 30;
const RESET_MAX_SOLICITACOES = 5;

const RESPOSTA_GENERICA =
  "Se existir uma conta ativa com este e-mail, enviaremos as instruções para redefinir a senha.";

function respostaGenerica() {
  return NextResponse.json({
    sucesso: true,
    mensagem: RESPOSTA_GENERICA,
  });
}

function gerarHtmlRecuperacao(nome: string, link: string): string {
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
            <td style="background:#0d0d0d;padding:32px 40px;">
              <p style="margin:0;color:#C8922A;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                STR Software
              </p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                Redefinição de senha
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;line-height:1.6;">
                Olá, ${nome}.
              </p>

              <p style="margin:0 0 24px;color:#4a4a4a;font-size:15px;line-height:1.6;">
                Recebemos uma solicitação para redefinir a senha da sua Área do Cliente.
              </p>

              <a href="${link}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:700;font-size:14px;padding:13px 24px;border-radius:7px;text-decoration:none;">
                Redefinir minha senha
              </a>

              <p style="margin:24px 0 0;color:#4a4a4a;font-size:13px;line-height:1.6;">
                Este link é válido por 30 minutos e pode ser utilizado apenas uma vez.
              </p>

              <p style="margin:16px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">
                Se você não solicitou a redefinição, ignore este e-mail.
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
  let email = "";

  try {
    const body = await request.json();

    if (typeof body?.email !== "string") {
      return respostaGenerica();
    }

    email = body.email.trim().toLowerCase();

    if (!email || email.length > 254) {
      return respostaGenerica();
    }

    const cliente = await prisma.cliente.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    if (!cliente || !cliente.ativo) {
      return respostaGenerica();
    }

    const agora = new Date();

    const umMinutoAtras = new Date(
      agora.getTime() - RESET_INTERVALO_MINIMO_MINUTOS * 60 * 1000,
    );

    const trintaMinutosAtras = new Date(
      agora.getTime() - RESET_JANELA_MINUTOS * 60 * 1000,
    );

    const [solicitacaoRecente, solicitacoesNaJanela] = await Promise.all([
      prisma.passwordResetToken.findFirst({
        where: {
          clienteId: cliente.id,
          createdAt: { gte: umMinutoAtras },
        },
        select: { id: true },
      }),

      prisma.passwordResetToken.count({
        where: {
          clienteId: cliente.id,
          createdAt: { gte: trintaMinutosAtras },
        },
      }),
    ]);

    if (solicitacaoRecente || solicitacoesNaJanela >= RESET_MAX_SOLICITACOES) {
      console.warn("[recuperar-senha] solicitacao limitada por rate limit");
      return respostaGenerica();
    }

    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (!appUrl) {
      console.error("[recuperar-senha] APP_URL nao configurado");
      return NextResponse.json(
        { erro: "Serviço temporariamente indisponível." },
        { status: 503 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[recuperar-senha] RESEND_API_KEY nao configurado");
      return NextResponse.json(
        { erro: "Serviço temporariamente indisponível." },
        { status: 503 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(
      agora.getTime() + RESET_EXPIRACAO_MINUTOS * 60 * 1000,
    );

    const resetCriado = await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: {
          clienteId: cliente.id,
          usedAt: null,
        },
        data: {
          usedAt: agora,
        },
      });

      return tx.passwordResetToken.create({
        data: {
          clienteId: cliente.id,
          tokenHash,
          expiresAt,
        },
        select: {
          id: true,
        },
      });
    });

    const link = `${appUrl}/cliente/redefinir-senha?token=${encodeURIComponent(token)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const resultadoEnvio = await resend.emails.send({
      from: "STR Software <onboarding@resend.dev>",
      to: cliente.email,
      subject: "Redefinição de senha - STR Software",
      html: gerarHtmlRecuperacao(cliente.nome, link),
    });

    if (resultadoEnvio.error) {
      console.error(
        "[recuperar-senha] falha no envio do e-mail:",
        resultadoEnvio.error,
      );

      await prisma.passwordResetToken.update({
        where: { id: resetCriado.id },
        data: { usedAt: new Date() },
      });

      return NextResponse.json(
        { erro: "Serviço temporariamente indisponível." },
        { status: 503 },
      );
    }

    console.info("[recuperar-senha] solicitacao processada com sucesso");

    return respostaGenerica();
  } catch (erro) {
    console.error("[recuperar-senha] falha ao processar solicitacao:", erro);

    return NextResponse.json(
      { erro: "Não foi possível processar a solicitação." },
      { status: 500 },
    );
  }
}