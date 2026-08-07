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
      const selectedTickets = JSON.parse(
  session.metadata?.selectedTickets || "[]"
);
      console.log("====================================");
console.log("METADATA:", session.metadata);
console.log("SELECTED TICKETS:", selectedTickets);
console.log("====================================");

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
const ticketPrice =
  (session.amount_total ?? 0) / quantity / 100;

const tickets = selectedTickets.map((ticketNumber: number) => ({
  raffle_id: raffleId,
  user_id: userId,
  ticket_number: ticketNumber,
  quantity: 1,
  total_price: ticketPrice,
  stripe_session_id: session.id,
  payment_intent:
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : null,
}));

const { error: ticketError } = await supabaseAdmin
  .from("raffle_tickets")
  .insert(tickets);

if (ticketError) {
  console.error("❌ Erro ao gravar bilhetes:", ticketError);
} else {
  console.log(`🎟️ ${tickets.length} bilhetes gravados.`);
}
const { error: reservationError } = await supabaseAdmin
  .from("raffle_ticket_reservations")
  .delete()
  .eq("raffle_id", raffleId)
  .in("ticket_number", selectedTickets);

if (reservationError) {
  console.error("❌ Erro ao remover reservas:", reservationError);
} else {
  console.log("🗑️ Reservas removidas.");
}
      break;

    default:
      console.log(`Ignored event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}