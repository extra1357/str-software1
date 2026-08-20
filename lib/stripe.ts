import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

if (!STRIPE_SECRET_KEY) {
  console.error("[stripe] STRIPE_SECRET_KEY nao definido no ambiente");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY);
