import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err);

    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      console.log("✅ Checkout completed!");

      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Session ID:", session.id);
      console.log("Customer:", session.customer);
      console.log("Amount:", session.amount_total);

      break;

    default:
      console.log(`Ignored event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}