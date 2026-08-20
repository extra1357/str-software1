const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const EMAIL_TESTE = "teste@strsoftware.com.br";
const SENHA_TESTE = "SenhaTeste123!";

async function main() {
  const senhaHash = await bcrypt.hash(SENHA_TESTE, 12);

  const cliente = await prisma.cliente.upsert({
    where: { email: EMAIL_TESTE },
    update: { senhaHash, ativo: true },
    create: {
      nome: "Cliente Teste",
      email: EMAIL_TESTE,
      senhaHash,
      ativo: true,
    },
  });

  console.log("Cliente de teste pronto:");
  console.log("  id:", cliente.id);
  console.log("  email:", cliente.email);
  console.log("  senha (apenas para teste local):", SENHA_TESTE);
}

main()
  .catch((erro) => {
    console.error("[criar-cliente-teste] falha:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
