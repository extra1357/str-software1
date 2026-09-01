"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminCookieAutenticado } from "@/lib/auth-admin";

export async function responderTicket(
  ticketId: string,
  formData: FormData
) {
  try {
    const cookieStore = await cookies();

    const autenticado = isAdminCookieAutenticado(
      cookieStore.get("admin-auth")?.value
    );

    if (!autenticado) {
      console.warn(
        "[admin/ticket] tentativa de resposta sem autenticacao"
      );

      throw new Error("Nao autorizado.");
    }

    if (
      typeof ticketId !== "string" ||
      ticketId.trim().length === 0
    ) {
      console.warn(
        "[admin/ticket] tentativa de resposta sem ticketId valido"
      );

      throw new Error("Solicitacao invalida.");
    }

    const mensagemBruta = formData.get("mensagem");

    if (typeof mensagemBruta !== "string") {
      throw new Error("Mensagem obrigatoria.");
    }

    const mensagem = mensagemBruta.trim();

    if (mensagem.length === 0) {
      throw new Error("Mensagem obrigatoria.");
    }

    if (mensagem.length > 5000) {
      throw new Error(
        "Mensagem excede o limite de 5000 caracteres."
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        protocolo: true,
        status: true,
      },
    });

    if (!ticket) {
      console.warn(
        `[admin/ticket] solicitacao inexistente: ${ticketId}`
      );

      throw new Error("Solicitacao nao encontrada.");
    }

    if (ticket.status === "ENCERRADO") {
      console.warn(
        `[admin/ticket] tentativa de responder solicitacao encerrada: ${ticket.protocolo}`
      );

      throw new Error(
        "Solicitacoes encerradas nao aceitam novas mensagens."
      );
    }

    await prisma.ticketMensagem.create({
      data: {
        ticketId: ticket.id,
        autorTipo: "ADMIN",
        mensagem,
      },
    });

    console.log(
      `[admin/ticket] resposta registrada no protocolo ${ticket.protocolo}`
    );

    revalidatePath("/admin");
  } catch (erro) {
    console.error(
      "[admin/ticket] erro ao registrar resposta",
      erro
    );

    throw erro;
  }
}