import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function AdminAccess() {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin-auth");

  if (!isAuth) {
    redirect("/?login=required");
  }

  return null;
}
