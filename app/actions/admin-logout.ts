"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  USUARIO_ADMIN_COOKIE,
} from "@/lib/auth-usuario-token";

export async function adminLogout() {
  const cookieStore = await cookies();
  const sessaoExistia =
    cookieStore.has(USUARIO_ADMIN_COOKIE);

  cookieStore.delete(USUARIO_ADMIN_COOKIE);

  console.info(
    `[admin-logout] sessao administrativa encerrada; cookie_existia=${sessaoExistia}`,
  );

  redirect("/login");
}