"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { ADMIN_COOKIE_NAME, isAdminCookieAutenticado } from "../../lib/auth-admin";

const STATUS_PERMITIDOS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_CLIENTE",
  "RESOLVIDO",
  "ENCERRADO",
];

export async function updateTicketStatus(formData: FormData) {
  const cookieStore = await cookies();

  const autenticado = isAdminCookieAutenticado(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (!autenticado) {
    console.warn(
      "[admin/solicitacoes] tentativa de alterar status sem autenticacao"
    );

    return;
  }

  const ticketId = formData.get("ticketId");
  const status = formData.get("status");

  if (
    typeof ticketId !== "string" ||
    typeof status !== "string"
  ) {
    console.warn(
      "[admin/solicitacoes] dados invalidos ao alterar status"
    );

    return;
  }

  if (!STATUS_PERMITIDOS.includes(status)) {
    console.warn(
      `[admin/solicitacoes] status invalido recebido: ${status}`
    );

    return;
  }

  try {
    await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
        encerradoEm:
          status === "ENCERRADO"
            ? new Date()
            : null,
      },
    });

    revalidatePath("/admin");
  } catch (erro) {
    console.error(
      "[admin/solicitacoes] erro ao alterar status",
      erro
    );

    throw erro;
  }
}