"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  criarAdminSessionToken,
} from "@/lib/auth-admin";

const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 24;

export async function adminLogin(formData: FormData) {
  const user = formData.get("user");
  const password = formData.get("password");

  if (
    typeof user !== "string" ||
    typeof password !== "string" ||
    user !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    console.warn(
      "[admin-login] tentativa de login administrativo invalida"
    );

    redirect("/login?error=true");
  }

  let token: string;

  try {
    token = criarAdminSessionToken();
  } catch (erro) {
    console.error(
      "[admin-login] falha ao criar sessao administrativa",
      erro
    );

    throw new Error(
      "Nao foi possivel iniciar a sessao administrativa."
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    }
  );

  console.log(
    "[admin-login] sessao administrativa criada com sucesso"
  );

  redirect("/admin");
}
