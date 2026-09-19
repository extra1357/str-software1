import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const ACADEMY_SESSION_COOKIE = "academy-session";

export const ACADEMY_SESSION_MAX_AGE =
  60 * 60 * 24 * 7;

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export type AcademySessionPayload = JwtPayload & {
  sub: string;
  tipo: "academy-aluno";
  sessionVersion: number;
};

export type AcademyAlunoAutenticado = {
  id: string;
  nome: string;
  email: string;
  sessionVersion: number;
};

function obterAcademySessionSecret(): string | null {
  const secret = process.env.ACADEMY_SESSION_SECRET;

  if (!secret || secret.trim().length < 32) {
    console.error(
      "[auth-academy] ACADEMY_SESSION_SECRET ausente ou com menos de 32 caracteres",
    );

    return null;
  }

  return secret;
}

export async function hashSenhaAcademy(
  senha: string,
): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenhaAcademy(
  senha: string,
  senhaHash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash);
}

export function criarAcademySessionToken(
  alunoId: string,
  sessionVersion: number,
): string {
  const secret = obterAcademySessionSecret();

  if (!secret) {
    throw new Error(
      "Configuracao de sessao da Academy invalida.",
    );
  }

  return jwt.sign(
    {
      tipo: "academy-aluno",
      sessionVersion,
    },
    secret,
    {
      algorithm: "HS256",
      subject: alunoId,
      expiresIn: ACADEMY_SESSION_MAX_AGE,
    },
  );
}

export function verificarAcademySessionToken(
  token: string | undefined,
): AcademySessionPayload | null {
  if (!token) {
    return null;
  }

  const secret = obterAcademySessionSecret();

  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.tipo !== "academy-aluno" ||
      typeof payload.sessionVersion !== "number"
    ) {
      console.warn(
        "[auth-academy] payload de sessao invalido",
      );

      return null;
    }

    return payload as AcademySessionPayload;
  } catch (erro) {
    if (erro instanceof jwt.TokenExpiredError) {
      console.warn(
        "[auth-academy] sessao expirada",
      );
    } else {
      console.warn(
        "[auth-academy] sessao invalida",
      );
    }

    return null;
  }
}

export async function obterAcademyAlunoPorToken(
  token: string | undefined,
): Promise<AcademyAlunoAutenticado | null> {
  const payload = verificarAcademySessionToken(token);

  if (!payload) {
    return null;
  }

  try {
    const aluno = await prisma.academyAluno.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        emailVerificadoEm: true,
        sessionVersion: true,
      },
    });

    if (!aluno || !aluno.ativo) {
      console.warn(
        "[auth-academy] aluno nao encontrado ou inativo",
      );

      return null;
    }

    if (!aluno.emailVerificadoEm) {
      console.warn(
        "[auth-academy] aluno sem e-mail verificado",
      );

      return null;
    }

    if (
      aluno.sessionVersion !==
      payload.sessionVersion
    ) {
      console.warn(
        "[auth-academy] sessao invalidada por alteracao de versao",
      );

      return null;
    }

    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      sessionVersion: aluno.sessionVersion,
    };
  } catch (erro) {
    console.error(
      "[auth-academy] falha ao validar aluno no banco:",
      erro,
    );

    return null;
  }
}

export async function estaTravadoAcademyPorRateLimit(
  email: string,
): Promise<boolean> {
  const desde = new Date(
    Date.now() -
      RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  );

  try {
    const tentativasFalhas =
      await prisma.academyLoginAttempt.count({
        where: {
          email,
          sucesso: false,
          createdAt: {
            gte: desde,
          },
        },
      });

    return (
      tentativasFalhas >=
      RATE_LIMIT_MAX_ATTEMPTS
    );
  } catch (erro) {
    console.error(
      "[auth-academy] falha ao consultar rate limit:",
      erro,
    );

    // Fail-closed.
    return true;
  }
}

export async function registrarTentativaAcademyLogin(
  email: string,
  sucesso: boolean,
  ip: string | null,
  alunoId?: string,
): Promise<void> {
  try {
    await prisma.academyLoginAttempt.create({
      data: {
        email,
        sucesso,
        ip,
        alunoId: alunoId ?? null,
      },
    });
  } catch (erro) {
    console.error(
      "[auth-academy] falha ao registrar tentativa de login:",
      erro,
    );
  }
}