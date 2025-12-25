"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(formData: FormData) {
  const leadId = formData.get("leadId");
  const status = formData.get("status");

  if (
    typeof leadId !== "string" ||
    typeof status !== "string"
  ) {
    return;
  }

  // Validação defensiva (evita status inválido)
  const allowedStatus = ["NEW", "CONTACTED", "CLOSED"];
  if (!allowedStatus.includes(status)) {
    return;
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  // Revalida a dashboard para atualizar KPIs e tabela
  revalidatePath("/admin");
}
