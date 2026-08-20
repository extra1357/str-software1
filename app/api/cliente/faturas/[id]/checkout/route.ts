import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { verificarSessionToken, CLIENTE_SESSION_COOKIE } from "@/lib/auth-cliente";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get(CLIENTE_SESSION_COOKIE)?.value;

  if (!token) {
    console.warn("[cliente/faturas/checkout] acesso sem cookie de sessao");
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  const sessao = verificarSessionToken(token);

  if (!sessao) {
    console.warn("[cliente/faturas/checkout] token de sessao invalido");
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  const { id } = await params;

  const fatura = await prisma.fatura.findUnique({ where: { id } }).catch((erro) => {
    console.error("[cliente/faturas/checkout] falha ao buscar fatura:", erro);
    return null;
  });

  if (!fatura || fatura.clienteId !== sessao.clienteId) {
    console.warn(`[cliente/faturas/checkout] fatura nao encontrada ou nao pertence ao cliente: ${id}`);
    return NextResponse.json({ erro: "Fatura nao encontrada." }, { status: 404 });
  }

  if (fatura.status !== "PENDENTE") {
    return NextResponse.json({ erro: "Fatura nao esta pendente de pagamento." }, { status: 400 });
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: sessao.clienteId },
    select: { email: true },
  });

  if (!cliente) {
    console.error("[cliente/faturas/checkout] cliente da sessao nao encontrado no banco");
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  const origem = request.nextUrl.origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: fatura.descricao },
            unit_amount: Math.round(Number(fatura.valor) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: cliente.email,
      metadata: { faturaId: fatura.id },
      success_url: `${origem}/cliente/dashboard?pagamento=sucesso`,
      cancel_url: `${origem}/cliente/dashboard?pagamento=cancelado`,
    });

    if (!checkoutSession.url) {
      console.error("[cliente/faturas/checkout] Stripe nao retornou url de checkout");
      return NextResponse.json({ erro: "Falha ao iniciar pagamento." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (erro) {
    console.error("[cliente/faturas/checkout] falha ao criar checkout session:", erro);
    return NextResponse.json({ erro: "Falha ao iniciar pagamento." }, { status: 500 });
  }
}
