import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

console.log(
  "WEBHOOK SERVICE ROLE:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING"
);

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

      const raffleId = session.metadata?.listingId;
      const userId = session.metadata?.userId;
      const quantity = Number(session.metadata?.quantity);

      console.log("Raffle ID:", raffleId);
      console.log("User ID:", userId);
      console.log("Quantity:", quantity);
      console.log("Payment Intent:", session.payment_intent);

      console.log("Session ID:", session.id);
      console.log("Customer:", session.customer);
      console.log("Amount:", session.amount_total);

      const { error } = await supabaseAdmin
  .from("stripe_payments")
  .insert({
    stripe_session_id: session.id,
    payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null,
    raffle_id: raffleId,
    user_id: userId,
    quantity,
    amount: session.amount_total ?? 0,
  });

if (error) {
  console.error("❌ Erro ao gravar pagamento:", error);
} else {
  console.log("✅ Pagamento gravado no Supabase.");
}

const { data: lastTicket } = await supabaseAdmin
  .from("raffle_tickets")
  .select("ticket_number")
  .eq("raffle_id", raffleId)
  .order("ticket_number", { ascending: false })
  .limit(1)
  .maybeSingle();

const startNumber = lastTicket?.ticket_number
  ? lastTicket.ticket_number + 1
  : 1;

const tickets = [];

for (let i = 0; i < quantity; i++) {
  tickets.push({
    raffle_id: raffleId,
    user_id: userId,
    quantity: 1,
    total_price: (session.amount_total ?? 0) / quantity / 100,
    ticket_number: startNumber + i,
    stripe_session_id: session.id,
    payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null,
  });
}

const { error: ticketError } = await supabaseAdmin
  .from("raffle_tickets")
  .insert(tickets);

if (ticketError) {
  console.error("❌ Erro ao criar bilhetes:", ticketError);
} else {
  console.log(`🎟️ ${tickets.length} bilhetes criados.`);
}
      break;

    default:
      console.log(`Ignored event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}