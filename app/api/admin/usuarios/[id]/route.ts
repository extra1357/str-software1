import {
  Prisma,
  type UsuarioPapel,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obterUsuarioPorRequest } from "@/lib/auth-usuario";

const PAPEIS_VALIDOS: UsuarioPapel[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "COMERCIAL",
  "FINANCEIRO",
  "SUPORTE",
  "CONTEUDO",
];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const administrador =
    await obterUsuarioPorRequest(request);

  if (!administrador) {
    return NextResponse.json(
      { erro: "Não autorizado." },
      { status: 401 },
    );
  }

  if (administrador.papel !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        erro: "Somente o SUPER_ADMIN pode gerenciar usuários.",
      },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const usuarioAtual = await prisma.usuario.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
      },
    });

    if (!usuarioAtual) {
      return NextResponse.json(
        { erro: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const data: Prisma.UsuarioUpdateInput = {};
    let invalidarSessoes = false;

    if (body.nome !== undefined) {
      const nome =
        typeof body.nome === "string"
          ? body.nome.trim()
          : "";

      if (nome.length < 3 || nome.length > 120) {
        return NextResponse.json(
          {
            erro: "O nome deve ter entre 3 e 120 caracteres.",
          },
          { status: 400 },
        );
      }

      data.nome = nome;
    }

    if (body.email !== undefined) {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

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

      const emailEmUso = await prisma.usuario.findFirst({
        where: {
          email,
          id: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      if (emailEmUso) {
        return NextResponse.json(
          {
            erro: "Já existe um usuário com este e-mail.",
          },
          { status: 409 },
        );
      }

      data.email = email;
    }

    if (body.papel !== undefined) {
      const papel =
        typeof body.papel === "string"
          ? body.papel
          : "";

      if (!PAPEIS_VALIDOS.includes(papel as UsuarioPapel)) {
        return NextResponse.json(
          { erro: "Papel de usuário inválido." },
          { status: 400 },
        );
      }

      if (
        id === administrador.id &&
        papel !== "SUPER_ADMIN"
      ) {
        return NextResponse.json(
          {
            erro: "Você não pode retirar seu próprio papel de SUPER_ADMIN.",
          },
          { status: 400 },
        );
      }

      if (papel !== usuarioAtual.papel) {
        data.papel = papel as UsuarioPapel;
        invalidarSessoes = true;
      }
    }

    if (body.ativo !== undefined) {
      if (typeof body.ativo !== "boolean") {
        return NextResponse.json(
          { erro: "Estado do usuário inválido." },
          { status: 400 },
        );
      }

      if (
        id === administrador.id &&
        body.ativo === false
      ) {
        return NextResponse.json(
          {
            erro: "Você não pode desativar sua própria conta.",
          },
          { status: 400 },
        );
      }

      if (body.ativo !== usuarioAtual.ativo) {
        data.ativo = body.ativo;
        invalidarSessoes = true;
      }
    }

    const novoPapel =
      typeof data.papel === "string"
        ? data.papel
        : usuarioAtual.papel;

    const novoAtivo =
      typeof data.ativo === "boolean"
        ? data.ativo
        : usuarioAtual.ativo;

    const removeSuperAdminAtivo =
      usuarioAtual.papel === "SUPER_ADMIN" &&
      usuarioAtual.ativo &&
      (
        novoPapel !== "SUPER_ADMIN" ||
        novoAtivo === false
      );

    if (removeSuperAdminAtivo) {
      const totalSuperAdminsAtivos =
        await prisma.usuario.count({
          where: {
            papel: "SUPER_ADMIN",
            ativo: true,
          },
        });

      if (totalSuperAdminsAtivos <= 1) {
        return NextResponse.json(
          {
            erro: "O último SUPER_ADMIN ativo não pode ser bloqueado ou rebaixado.",
          },
          { status: 400 },
        );
      }
    }

    if (invalidarSessoes) {
      data.sessionVersion = {
        increment: 1,
      };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { erro: "Nenhuma alteração foi informada." },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.update({
      where: {
        id,
      },
      data,
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
      `[api-admin-usuarios] usuário ${id} alterado por ${administrador.id}`,
    );

    return NextResponse.json({
      sucesso: true,
      usuario,
    });
  }
  catch (erro) {
    console.error(
      "[api-admin-usuarios] falha ao atualizar usuário:",
      erro,
    );

    return NextResponse.json(
      { erro: "Não foi possível atualizar o usuário." },
      { status: 500 },
    );
  }
}