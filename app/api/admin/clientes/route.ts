import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/auth-cliente";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

function textoOpcional(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function normalizarTipoPessoa(valor: unknown): string | null {
  const tipo = textoOpcional(valor)?.toUpperCase() ?? null;

  if (tipo !== null && tipo !== "PF" && tipo !== "PJ") {
    throw new Error("TIPO_PESSOA_INVALIDO");
  }

  return tipo;
}

function normalizarUf(valor: unknown): string | null {
  const uf = textoOpcional(valor)?.toUpperCase() ?? null;

  if (uf !== null && !/^[A-Z]{2}$/.test(uf)) {
    throw new Error("UF_INVALIDA");
  }

  return uf;
}

function gerarSenhaTemporaria(): string {
  return randomBytes(18).toString("base64url");
}

const selecaoCliente = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  tipoPessoa: true,
  documento: true,
  razaoSocial: true,
  nomeFantasia: true,
  nomeContato: true,
  cep: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  observacoes: true,
  ativo: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  try {
    const clientes = await prisma.cliente.findMany({
      select: selecaoCliente,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clientes });
  } catch (erro) {
    console.error("[admin/clientes] falha ao listar clientes:", erro);

    return NextResponse.json(
      { erro: "Falha ao listar clientes." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  let dados: {
    nome: string;
    email: string;
    telefone: string | null;
    tipoPessoa: string | null;
    documento: string | null;
    razaoSocial: string | null;
    nomeFantasia: string | null;
    nomeContato: string | null;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    observacoes: string | null;
  };

  try {
    const body = await request.json();

    const nome =
      typeof body.nome === "string" ? body.nome.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!nome || !email) {
      return NextResponse.json(
        { erro: "Nome e email sao obrigatorios." },
        { status: 400 },
      );
    }

    dados = {
      nome,
      email,
      telefone: textoOpcional(body.telefone),
      tipoPessoa: normalizarTipoPessoa(body.tipoPessoa),
      documento: textoOpcional(body.documento),
      razaoSocial: textoOpcional(body.razaoSocial),
      nomeFantasia: textoOpcional(body.nomeFantasia),
      nomeContato: textoOpcional(body.nomeContato),
      cep: textoOpcional(body.cep),
      logradouro: textoOpcional(body.logradouro),
      numero: textoOpcional(body.numero),
      complemento: textoOpcional(body.complemento),
      bairro: textoOpcional(body.bairro),
      cidade: textoOpcional(body.cidade),
      uf: normalizarUf(body.uf),
      observacoes: textoOpcional(body.observacoes),
    };
  } catch (erro) {
    if (erro instanceof Error && erro.message === "TIPO_PESSOA_INVALIDO") {
      return NextResponse.json(
        { erro: "Tipo de pessoa deve ser PF ou PJ." },
        { status: 400 },
      );
    }

    if (erro instanceof Error && erro.message === "UF_INVALIDA") {
      return NextResponse.json(
        { erro: "UF deve conter exatamente duas letras." },
        { status: 400 },
      );
    }

    console.error("[admin/clientes] corpo da requisicao invalido:", erro);

    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  const senhaTemporaria = gerarSenhaTemporaria();
  const senhaHash = await hashSenha(senhaTemporaria);

  try {
    const cliente = await prisma.cliente.create({
      data: {
        ...dados,
        senhaHash,
      },
      select: selecaoCliente,
    });

    return NextResponse.json(
      {
        cliente,
        senhaTemporaria,
      },
      { status: 201 },
    );
  } catch (erro: unknown) {
    const codigoPrisma = (erro as { code?: string })?.code;

    if (codigoPrisma === "P2002") {
      return NextResponse.json(
        { erro: "Ja existe um cliente com esse email." },
        { status: 409 },
      );
    }

    console.error("[admin/clientes] falha ao criar cliente:", erro);

    return NextResponse.json(
      { erro: "Falha ao criar cliente." },
      { status: 500 },
    );
  }
}