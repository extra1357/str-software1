"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import {
  ADMIN_COOKIE_NAME,
  isAdminCookieAutenticado,
} from "../../lib/auth-admin";

const ALLOWED_STATUS = ["NEW", "CONTACTED", "CLOSED", "ARCHIVED"];

export async function updateLeadStatus(formData: FormData) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isAdminCookieAutenticado(adminCookie)) {
    console.warn("[ADMIN][LEAD] Tentativa nao autorizada de alterar status.");
    return;
  }

  const leadId = formData.get("leadId");
  const status = formData.get("status");

  if (
    typeof leadId !== "string" ||
    typeof status !== "string" ||
    !leadId.trim() ||
    !status.trim()
  ) {
    console.warn("[ADMIN][LEAD] Dados invalidos na alteracao de status.");
    return;
  }

  if (!ALLOWED_STATUS.includes(status)) {
    console.warn(
      `[ADMIN][LEAD] Status invalido rejeitado: ${status}`
    );
    return;
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    console.info(
      `[ADMIN][LEAD] Status atualizado | leadId=${leadId} | status=${status}`
    );

    revalidatePath("/admin");
  } catch (error) {
    console.error(
      `[ADMIN][LEAD] Falha ao atualizar status | leadId=${leadId}`,
      error
    );

    throw new Error("Falha ao atualizar status do lead.");
  }
}