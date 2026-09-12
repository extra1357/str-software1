"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

type DadosLead = {
  name: string;
  email: string;
  phone: string;
  release: string;
};

type LeadSalvo = {
  id: string;
  createdAt: Date;
};

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obterCampo(
  formData: FormData,
  nome: string,
): string {
  const valor = formData.get(nome);

  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function dadosValidos(dados: DadosLead): boolean {
  return (
    dados.name.length >= 2 &&
    dados.name.length <= 120 &&
    dados.email.length <= 254 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
      dados.email,
    ) &&
    dados.phone.length >= 5 &&
    dados.phone.length <= 40 &&
    dados.release.length >= 3 &&
    dados.release.length <= 10000
  );
}

function gerarHtmlLead(
  dados: DadosLead,
  lead: LeadSalvo,
  painelUrl: string,
): string {
  const nome = escaparHtml(dados.name);
  const email = escaparHtml(dados.email);
  const telefone = escaparHtml(dados.phone);
  const mensagem = escaparHtml(dados.release);
  const linkPainel = escaparHtml(painelUrl);

  const recebidoEm = lead.createdAt.toLocaleString(
    "pt-BR",
    {
      timeZone: "America/Sao_Paulo",
    },
  );

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
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                Novo lead recebido
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="16" cellspacing="0" style="background:#faf6ec;border-radius:10px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#a3781f;">
                      Contato
                    </p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;">
                      ${nome}
                    </p>
                    <p style="margin:8px 0 0;font-size:14px;color:#4a4a4a;">
                      ${email}
                    </p>
                    <p style="margin:2px 0 0;font-size:14px;color:#4a4a4a;">
                      ${telefone}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a7a7a;">
                Mensagem completa
              </p>
              <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;background:#f4f2ed;border-left:3px solid #C8922A;padding:12px 16px;border-radius:0 8px 8px 0;white-space:pre-wrap;">
                ${mensagem}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #e8dfc8;margin:0 0 20px;">

              <a href="${linkPainel}"
                 style="display:inline-block;background:#C8922A;color:#000000;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;text-decoration:none;">
                Acessar leads no painel
              </a>

              <p style="margin:20px 0 0;font-size:12px;color:#7a7a7a;line-height:1.6;">
                Recebido em ${recebidoEm} · Gerado automaticamente pelo site STR Software.
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

async function notificarEmailLead(
  dados: DadosLead,
  lead: LeadSalvo,
): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const remetente = process.env.RESEND_FROM_EMAIL;

    const appUrl =
      process.env.APP_URL?.replace(/\/+$/, "");

    if (!apiKey || !remetente || !appUrl) {
      console.error(
        `[lead-email] configuração incompleta; lead ${lead.id} preservado`,
      );

      return false;
    }

    const destinatarios =
      await prisma.leadEmailRecipient.findMany({
        where: {
          ativo: true,
        },
        select: {
          email: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (destinatarios.length === 0) {
      console.warn(
        `[lead-email] nenhum destinatário ativo; lead ${lead.id} preservado`,
      );

      return false;
    }

    const resend = new Resend(apiKey);

    const nomeAssunto = dados.name
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 80);

    const html = gerarHtmlLead(
      dados,
      lead,
      `${appUrl}/admin/leads`,
    );

    const resultados = await Promise.allSettled(
      destinatarios.map(async (destinatario) => {
        const resultado = await resend.emails.send({
          from: remetente,
          to: destinatario.email,
          replyTo: dados.email,
          subject: `Novo lead STR: ${nomeAssunto}`,
          html,
        });

        if (resultado.error) {
          throw new Error("RESEND_REJEITOU_ENVIO");
        }

        return resultado.data?.id ?? null;
      }),
    );

    const enviados = resultados.filter(
      (resultado) => resultado.status === "fulfilled",
    ).length;

    const falhas = resultados.length - enviados;

    if (enviados > 0) {
      console.info(
        `[lead-email] lead ${lead.id} enviado para ${enviados} destinatário(s)`,
      );
    }

    if (falhas > 0) {
      console.error(
        `[lead-email] ${falhas} envio(s) falharam para o lead ${lead.id}`,
      );
    }

    return falhas === 0;
  } catch (erro) {
    console.error(
      `[lead-email] falha inesperada; lead ${lead.id} preservado`,
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );

    return false;
  }
}

async function notificarWhatsApp(
  dados: DadosLead,
  lead: LeadSalvo,
): Promise<boolean> {
  const zapiUrl = process.env.ZAPI_URL;
  const telefoneDestino = process.env.NOTIFY_PHONE;

  if (!zapiUrl || !telefoneDestino) {
    console.warn(
      `[lead-whatsapp] configuração incompleta; lead ${lead.id} preservado`,
    );

    return false;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const resposta = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: telefoneDestino,
        message:
          `Novo Lead STR\n\n` +
          `Nome: ${dados.name}\n` +
          `Telefone: ${dados.phone}\n\n` +
          `Mensagem:\n${dados.release}`,
      }),
      signal: controller.signal,
    });

    if (!resposta.ok) {
      console.error(
        `[lead-whatsapp] resposta HTTP ${resposta.status}; lead ${lead.id} preservado`,
      );

      return false;
    }

    console.info(
      `[lead-whatsapp] notificação enviada para o lead ${lead.id}`,
    );

    return true;
  } catch (erro) {
    console.error(
      `[lead-whatsapp] falha no envio; lead ${lead.id} preservado`,
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );

    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveLead(formData: FormData) {
  const dados: DadosLead = {
    name: obterCampo(formData, "name"),
    email: obterCampo(
      formData,
      "email",
    ).toLowerCase(),
    phone: obterCampo(formData, "phone"),
    release: obterCampo(formData, "release"),
  };

  if (!dadosValidos(dados)) {
    console.warn(
      "[lead] formulário rejeitado por dados inválidos",
    );

    return {
      success: false,
    };
  }

  let lead: LeadSalvo;

  try {
    lead = await prisma.lead.create({
      data: dados,
      select: {
        id: true,
        createdAt: true,
      },
    });

    console.info(
      `[lead] lead ${lead.id} salvo com sucesso`,
    );
  } catch (erro) {
    console.error(
      "[lead] falha ao salvar no banco",
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );

    return {
      success: false,
    };
  }

  try {
    await Promise.allSettled([
      notificarEmailLead(dados, lead),
      notificarWhatsApp(dados, lead),
    ]);
  } catch (erro) {
    console.error(
      `[lead] falha inesperada nas notificações; lead ${lead.id} preservado`,
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );
  }

  try {
    revalidatePath("/admin/leads");
  } catch (erro) {
    console.error(
      `[lead] falha ao revalidar painel; lead ${lead.id} preservado`,
      {
        tipo:
          erro instanceof Error
            ? erro.name
            : "Erro desconhecido",
      },
    );
  }

  return {
    success: true,
  };
}