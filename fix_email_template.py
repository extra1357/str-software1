content = r'''"use server";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function gerarHtmlLead(dados: {
  name: string;
  email: string;
  phone: string;
  release: string;
}): string {
  const { name, email, phone, release } = dados;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f2ed;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <tr><td style="background:#0d0d0d;padding:32px 40px;">
          <p style="margin:0;color:#C8922A;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">STR Software</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">Novo lead recebido</h1>
        </td></tr>

        <tr><td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="16" cellspacing="0" style="background:#faf6ec;border-radius:10px;">
            <tr><td>
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#a3781f;">Contato</p>
              <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;">${name}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#4a4a4a;">${email}</p>
              <p style="margin:2px 0 0;font-size:14px;color:#4a4a4a;">${phone}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px 40px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a7a7a;">Mensagem completa</p>
          <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;background:#f4f2ed;border-left:3px solid #C8922A;padding:12px 16px;border-radius:0 8px 8px 0;white-space:pre-wrap;">${release}</p>
        </td></tr>

        <tr><td style="padding:0 40px 32px;">
          <hr style="border:none;border-top:1px solid #e8dfc8;margin:0 0 20px;">
          <a href="${process.env.NEXTAUTH_URL ?? ""}/admin"
             style="display:inline-block;background:#C8922A;color:#000000;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;text-decoration:none;">
            Acessar painel admin
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#7a7a7a;line-height:1.6;">
            Recebido em ${new Date().toLocaleString("pt-BR")} &middot; Gerado automaticamente pelo site STR Software.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function notifyEmail(name: string, email: string, phone: string, release: string) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.NOTIFY_EMAIL!,
      subject: `\u{1F514} Novo Lead: ${name}`,
      html: gerarHtmlLead({ name, email, phone, release }),
    });
  } catch (err) {
    console.error("ERRO_EMAIL:", err);
  }
}

async function notifyWhatsApp(name: string, phone: string, release: string) {
  try {
    await fetch(process.env.ZAPI_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: process.env.NOTIFY_PHONE!,
        message: `\u{1F514} *Novo Lead STR*\n\n\u{1F464} *Nome:* ${name}\n\u{1F4DE} *Telefone:* ${phone}\n\n\u{1F4DD} *Mensagem:*\n${release}`,
      }),
    });
  } catch (err) {
    console.error("ERRO_WHATSAPP:", err);
  }
}

export async function saveLead(formData: FormData) {
  try {
    const name    = formData.get("name")    as string;
    const email   = formData.get("email")   as string;
    const phone   = formData.get("phone")   as string;
    const release = formData.get("release") as string;

    await prisma.lead.create({
      data: { name, email, phone, release },
    });

    Promise.allSettled([
      notifyEmail(name, email, phone, release),
      notifyWhatsApp(name, phone, release),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("ERRO_AO_SALVAR_LEAD:", error);
    return { success: false };
  }
}
'''

path = r"C:\str_software\str-software\app\actions\save-lead.ts"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Arquivo atualizado com sucesso:", path)
print("Total de caracteres escritos:", len(content))
