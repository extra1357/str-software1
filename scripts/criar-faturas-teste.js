const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const EMAIL_CLIENTE_TESTE = "teste@strsoftware.com.br";

async function main() {
  const cliente = await prisma.cliente.findUnique({ where: { email: EMAIL_CLIENTE_TESTE } });

  if (!cliente) {
    console.error("[criar-faturas-teste] cliente de teste nao encontrado. Rode primeiro criar-cliente-teste.js");
    process.exit(1);
  }

  const faturas = await prisma.$transaction([
    prisma.fatura.create({
      data: {
        clienteId: cliente.id,
        descricao: "Manutencao mensal - Agosto/2026",
        valor: 450.0,
        status: "PENDENTE",
        vencimento: new Date("2026-08-30"),
      },
    }),
    prisma.fatura.create({
      data: {
        clienteId: cliente.id,
        descricao: "Manutencao mensal - Julho/2026",
        valor: 450.0,
        status: "PAGO",
        vencimento: new Date("2026-07-30"),
        pagoEm: new Date("2026-07-28"),
      },
    }),
  ]);

  console.log("Faturas de teste criadas:", faturas.length);
  faturas.forEach((fatura) => {
    console.log(`  - ${fatura.descricao} | ${fatura.status} | R$ ${fatura.valor}`);
  });
}

main()
  .catch((erro) => {
    console.error("[criar-faturas-teste] falha:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
