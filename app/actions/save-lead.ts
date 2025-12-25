"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveLead(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const release = formData.get("release") as string;

    await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        release,
      },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("ERRO_AO_SALVAR_LEAD:", error);
    return { success: false };
  }
}
