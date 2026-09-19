import type { UsuarioPapel } from "@prisma/client";

export const PAPEIS_ACADEMY_ADMIN: readonly UsuarioPapel[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CONTEUDO",
];

export function papelPodeAcessarAcademy(
  papel: UsuarioPapel | string | undefined,
): boolean {
  if (!papel) {
    return false;
  }

  return PAPEIS_ACADEMY_ADMIN.includes(
    papel as UsuarioPapel,
  );
}
