import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: NextRequest) {
  const assinatura = request.headers.get("stripe-signature");

  if (!assinatura) {
    console.error("[webhooks/stripe] requisicao sem header stripe-signature");
    return NextResponse.json({ erro: "Assinatura ausente." }, { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET nao definido no ambiente");
    return NextResponse.json({ erro: "Configuracao ausente." }, { status: 500 });
  }

  const corpoBruto = await request.text();

  let evento: Stripe.Event;

  try {
    evento = stripe.webhooks.constructEvent(corpoBruto, assinatura, STRIPE_WEBHOOK_SECRET);
  } catch (erro) {
    console.error("[webhooks/stripe] falha ao validar assinatura do webhook:", erro);
    return NextResponse.json({ erro: "Assinatura invalida." }, { status: 400 });
  }

  if (evento.type === "checkout.session.completed") {
    const session = evento.data.object as Stripe.Checkout.Session;
    const faturaId = session.metadata?.faturaId;

    if (!faturaId) {
      console.error("[webhooks/stripe] checkout.session.completed sem faturaId no metadata");
      return NextResponse.json({ recebido: true });
    }

    try {
      await prisma.fatura.update({
        where: { id: faturaId },
        data: {
          status: "PAGO",
          pagoEm: new Date(),
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
        },
      });
      console.log(`[webhooks/stripe] fatura ${faturaId} marcada como PAGO`);
    } catch (erro) {
      console.error(`[webhooks/stripe] falha ao atualizar fatura ${faturaId}:`, erro);
      return NextResponse.json({ erro: "Falha ao atualizar fatura." }, { status: 500 });
    }
  }

  return NextResponse.json({ recebido: true });
}
