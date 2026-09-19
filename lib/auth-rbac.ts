import type { UsuarioPapel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  obterUsuarioPorRequest,
  type UsuarioAutenticado,
} from "@/lib/auth-usuario";

export type ResultadoAutorizacaoAdmin =
  | {
      ok: true;
      usuario: UsuarioAutenticado;
    }
  | {
      ok: false;
      resposta: NextResponse;
    };

function respostaNaoAutenticado(): NextResponse {
  console.warn(
    "[RBAC] tentativa de acesso administrativo sem usuario autenticado",
  );

  return NextResponse.json(
    { erro: "Nao autorizado." },
    { status: 401 },
  );
}

function respostaSemPermissao(
  usuario: UsuarioAutenticado,
): NextResponse {
  console.warn(
    `[RBAC] acesso negado para usuario ${usuario.id} com papel ${usuario.papel}`,
  );

  return NextResponse.json(
    { erro: "Acesso proibido." },
    { status: 403 },
  );
}

export async function exigirUsuarioAdmin(
  request: NextRequest,
  papeisPermitidos: readonly UsuarioPapel[],
): Promise<ResultadoAutorizacaoAdmin> {
  const usuario = await obterUsuarioPorRequest(request);

  if (!usuario) {
    return {
      ok: false,
      resposta: respostaNaoAutenticado(),
    };
  }

  if (!papeisPermitidos.includes(usuario.papel)) {
    return {
      ok: false,
      resposta: respostaSemPermissao(usuario),
    };
  }

  return {
    ok: true,
    usuario,
  };
}

export function usuarioTemPapel(
  usuario: UsuarioAutenticado,
  papeisPermitidos: readonly UsuarioPapel[],
): boolean {
  return papeisPermitidos.includes(usuario.papel);
}

export function exigirPapelUsuario(
  usuario: UsuarioAutenticado,
  papeisPermitidos: readonly UsuarioPapel[],
): boolean {
  const autorizado = usuarioTemPapel(
    usuario,
    papeisPermitidos,
  );

  if (!autorizado) {
    console.warn(
      `[RBAC] acesso de pagina negado para usuario ${usuario.id} com papel ${usuario.papel}`,
    );
  }

  return autorizado;
}