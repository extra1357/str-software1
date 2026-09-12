import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { obterUsuarioPorRequest } from "@/lib/auth-usuario";
import { prisma } from "@/lib/prisma";

function respostaNaoAutorizada() {
  return NextResponse.json(
    { erro: "Não autorizado." },
    { status: 401 },
  );
}

function respostaSemPermissao() {
  return NextResponse.json(
    {
      erro:
        "Somente o SUPER_ADMIN pode gerenciar destinatários de leads.",
    },
    { status: 403 },
  );
}

async function exigirSuperAdmin(request: NextRequest) {
  const usuario = await obterUsuarioPorRequest(request);

  if (!usuario) {
    return {
      usuario: null,
      resposta: respostaNaoAutorizada(),
    };
  }

  if (usuario.papel !== "SUPER_ADMIN") {
    return {
      usuario: null,
      resposta: respostaSemPermissao(),
    };
  }

  return {
    usuario,
    resposta: null,
  };
}

function emailValido(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  );
}

export async function GET(request: NextRequest) {
  const acesso = await exigirSuperAdmin(request);

  if (acesso.resposta) {
    return acesso.resposta;
  }

  try {
    const destinatarios =
      await prisma.leadEmailRecipient.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          {
            ativo: "desc",
          },
          {
            nome: "asc",
          },
        ],
      });

    return NextResponse.json({
      destinatarios,
    });
  } catch (erro) {
    console.error(
      "[api-destinatarios-leads] falha ao listar:",
      erro,
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível listar os destinatários.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const acesso = await exigirSuperAdmin(request);

  if (acesso.resposta) {
    return acesso.resposta;
  }

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { erro: "Solicitação inválida." },
        { status: 400 },
      );
    }

    const nome =
      typeof body === "object" &&
      body !== null &&
      "nome" in body &&
      typeof body.nome === "string"
        ? body.nome.trim()
        : "";

    const email =
      typeof body === "object" &&
      body !== null &&
      "email" in body &&
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (nome.length < 2 || nome.length > 120) {
      return NextResponse.json(
        {
          erro:
            "O nome deve ter entre 2 e 120 caracteres.",
        },
        { status: 400 },
      );
    }

    if (!email || !emailValido(email)) {
      return NextResponse.json(
        { erro: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    const existente =
      await prisma.leadEmailRecipient.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

    if (existente) {
      return NextResponse.json(
        {
          erro:
            "Este e-mail já está cadastrado como destinatário.",
        },
        { status: 409 },
      );
    }

    const destinatario =
      await prisma.leadEmailRecipient.create({
        data: {
          nome,
          email,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    console.info(
      `[api-destinatarios-leads] destinatário ${destinatario.id} criado por ${acesso.usuario?.id}`,
    );

    return NextResponse.json(
      {
        sucesso: true,
        destinatario,
      },
      { status: 201 },
    );
  } catch (erro) {
    if (
      erro instanceof
        Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return NextResponse.json(
        {
          erro:
            "Este e-mail já está cadastrado como destinatário.",
        },
        { status: 409 },
      );
    }

    console.error(
      "[api-destinatarios-leads] falha ao cadastrar:",
      erro,
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível cadastrar o destinatário.",
      },
      { status: 500 },
    );
  }
}