import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verificarSenha,
  gerarSessionToken,
  estaTravadoPorRateLimit,
  registrarTentativaLogin,
  CLIENTE_SESSION_COOKIE,
  CLIENTE_SESSION_MAX_AGE,
} from "@/lib/auth-cliente";

const MENSAGEM_ERRO_GENERICA = "Credenciais invalidas.";

export async function POST(request: NextRequest) {
  let email: string | undefined;
  let senha: string | undefined;

  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    senha = typeof body.senha === "string" ? body.senha : undefined;
  } catch (erro) {
    console.error("[cliente/login] corpo da requisicao invalido:", erro);
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  if (!email || !senha) {
    return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  if (await estaTravadoPorRateLimit(email)) {
    console.warn(`[cliente/login] bloqueado por rate limit: ${email}`);
    return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 429 });
  }

  const cliente = await prisma.cliente.findUnique({ where: { email } }).catch((erro) => {
    console.error("[cliente/login] falha ao consultar cliente:", erro);
    return null;
  });

  const senhaValida = cliente ? await verificarSenha(senha, cliente.senhaHash) : false;

  if (!cliente || !cliente.ativo || !senhaValida) {
    await registrarTentativaLogin(email, false, ip);
    return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 401 });
  }

  await registrarTentativaLogin(email, true, ip);

  const token = gerarSessionToken(cliente.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CLIENTE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CLIENTE_SESSION_MAX_AGE,
  });

  return response;
}
