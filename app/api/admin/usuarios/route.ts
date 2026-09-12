import type { UsuarioPapel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashSenhaUsuario,
  obterUsuarioPorRequest,
} from "@/lib/auth-usuario";

const PAPEIS_VALIDOS: UsuarioPapel[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "COMERCIAL",
  "FINANCEIRO",
  "SUPORTE",
  "CONTEUDO",
];

function respostaNaoAutorizada() {
  return NextResponse.json(
    { erro: "Não autorizado." },
    { status: 401 },
  );
}

function respostaSemPermissao() {
  return NextResponse.json(
    {
      erro: "Somente o SUPER_ADMIN pode gerenciar usuários.",
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

export async function GET(request: NextRequest) {
  const acesso = await exigirSuperAdmin(request);

  if (acesso.resposta) {
    return acesso.resposta;
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
        ultimoLoginEm: true,
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
      usuarios,
    });
  }
  catch (erro) {
    console.error(
      "[api-admin-usuarios] falha ao listar usuários:",
      erro,
    );

    return NextResponse.json(
      { erro: "Não foi possível listar os usuários." },
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
    const body = await request.json();

    const nome =
      typeof body?.nome === "string"
        ? body.nome.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const senha =
      typeof body?.senha === "string"
        ? body.senha
        : "";

    const papel =
      typeof body?.papel === "string"
        ? body.papel
        : "";

    if (nome.length < 3 || nome.length > 120) {
      return NextResponse.json(
        {
          erro: "O nome deve ter entre 3 e 120 caracteres.",
        },
        { status: 400 },
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
      return NextResponse.json(
        { erro: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    if (senha.length < 12 || senha.length > 128) {
      return NextResponse.json(
        {
          erro: "A senha deve ter entre 12 e 128 caracteres.",
        },
        { status: 400 },
      );
    }

    if (!PAPEIS_VALIDOS.includes(papel as UsuarioPapel)) {
      return NextResponse.json(
        { erro: "Papel de usuário inválido." },
        { status: 400 },
      );
    }

    const usuarioExistente =
      await prisma.usuario.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

    if (usuarioExistente) {
      return NextResponse.json(
        {
          erro: "Já existe um usuário com este e-mail.",
        },
        { status: 409 },
      );
    }

    const senhaHash = await hashSenhaUsuario(senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        papel: papel as UsuarioPapel,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
        ultimoLoginEm: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.info(
      `[api-admin-usuarios] usuário ${usuario.id} criado por ${acesso.usuario?.id}`,
    );

    return NextResponse.json(
      {
        sucesso: true,
        usuario,
      },
      { status: 201 },
    );
  }
  catch (erro) {
    console.error(
      "[api-admin-usuarios] falha ao criar usuário:",
      erro,
    );

    return NextResponse.json(
      { erro: "Não foi possível criar o usuário." },
      { status: 500 },
    );
  }
}