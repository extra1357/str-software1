import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  isAdminCookieAutenticado,
} from "@/lib/auth-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isAdminCookieAutenticado(adminCookie)) {
    console.warn(
      "[ADMIN][LAYOUT] Acesso administrativo sem sessao valida."
    );

    redirect("/login");
  }

  return children;
}
