// ============================================
// ARQUIVO 1: app/actions/admin-login.ts
// ============================================
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(formData: FormData) {
  const user = formData.get("user");
  const password = formData.get("password");

  // Validação de credenciais
  if (
    user !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    // Redireciona com erro
    redirect("/login?error=true");
  }

  // Define o cookie de autenticação
  const cookieStore = await cookies();
  cookieStore.set("admin-auth", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 horas
  });

  // Redireciona para o dashboard admin
  redirect("/admin");
}
