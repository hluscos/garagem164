import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

console.log(
  "WEBHOOK SERVICE ROLE:",
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "OK"
    : "MISSING",
);

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature.",
      },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error(
      "❌ Webhook signature failed:",
      err,
    );

    return NextResponse.json(
      {
        error: "Invalid signature.",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    /*
     * ---------------------------------------------------------
     * PAGAMENTO CONCLUÍDO
     * ---------------------------------------------------------
     */

    case "checkout.session.completed": {
      console.log("✅ Checkout completed!");

      const session =
        event.data.object as Stripe.Checkout.Session;

      /*
       * Evitar processar o mesmo pagamento duas vezes.
       */

      const { data: existingPayment } =
        await supabaseAdmin
          .from("stripe_payments")
          .select("id")
          .eq(
            "stripe_session_id",
            session.id,
          )
          .maybeSingle();

      if (existingPayment) {
        console.log(
          "⚠️ Webhook já processado:",
          session.id,
        );

        return NextResponse.json({
          received: true,
        });
      }

      /*
       * Metadata
       */

      const raffleId =
        session.metadata?.listingId;

      const userId =
        session.metadata?.userId;

      const quantity = Number(
        session.metadata?.quantity || 0,
      );

      let selectedTickets: number[] = [];

      try {
        selectedTickets = JSON.parse(
          session.metadata?.selectedTickets ||
            "[]",
        );
      } catch (error) {
        console.error(
          "❌ Erro ao interpretar selectedTickets:",
          error,
        );

        return NextResponse.json(
          {
            error: "Invalid ticket metadata.",
          },
          { status: 400 },
        );
      }

      console.log(
        "====================================",
      );

      console.log(
        "METADATA:",
        session.metadata,
      );

      console.log(
        "SELECTED TICKETS:",
        selectedTickets,
      );

      console.log(
        "RAFFLE ID:",
        raffleId,
      );

      console.log(
        "USER ID:",
        userId,
      );

      console.log(
        "QUANTITY:",
        quantity,
      );

      console.log(
        "SESSION ID:",
        session.id,
      );

      console.log(
        "AMOUNT:",
        session.amount_total,
      );

      console.log(
        "====================================",
      );

      /*
       * Validações básicas.
       */

      if (
        !raffleId ||
        !userId ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Array.isArray(selectedTickets) ||
        selectedTickets.length !== quantity
      ) {
        console.error(
          "❌ Metadata inválida no Checkout:",
          {
            raffleId,
            userId,
            quantity,
            selectedTickets,
          },
        );

        return NextResponse.json(
          {
            error: "Invalid checkout metadata.",
          },
          { status: 400 },
        );
      }

      /*
       * ---------------------------------------------------------
       * REGISTAR PAGAMENTO
       * ---------------------------------------------------------
       */

      const { error: paymentError } =
        await supabaseAdmin
          .from("stripe_payments")
          .insert({
            stripe_session_id: session.id,
            payment_intent:
              typeof session.payment_intent ===
              "string"
                ? session.payment_intent
                : null,
            raffle_id: raffleId,
            user_id: userId,
            quantity,
            amount:
              session.amount_total ?? 0,
          });

      if (paymentError) {
        console.error(
          "❌ Erro ao gravar pagamento:",
          paymentError,
        );

        return NextResponse.json(
          {
            error: "Failed to record payment.",
          },
          { status: 500 },
        );
      }

      console.log(
        "✅ Pagamento gravado no Supabase.",
      );

      /*
       * ---------------------------------------------------------
       * CRIAR BILHETES VENDIDOS
       * ---------------------------------------------------------
       */

      const ticketPrice =
        (session.amount_total ?? 0) /
        quantity /
        100;

      const tickets = selectedTickets.map(
        (ticketNumber: number) => ({
          raffle_id: raffleId,
          user_id: userId,
          ticket_number: ticketNumber,
          quantity: 1,
          total_price: ticketPrice,
          stripe_session_id: session.id,
          payment_intent:
            typeof session.payment_intent ===
            "string"
              ? session.payment_intent
              : null,
        }),
      );

      const { error: ticketError } =
        await supabaseAdmin
          .from("raffle_tickets")
          .insert(tickets);

      if (ticketError) {
        console.error(
          "❌ Erro ao gravar bilhetes:",
          ticketError,
        );

        return NextResponse.json(
          {
            error: "Failed to create tickets.",
          },
          { status: 500 },
        );
      }

      console.log(
        `🎟️ ${tickets.length} bilhetes gravados.`,
      );

      /*
       * ---------------------------------------------------------
       * REMOVER RESERVAS
       * ---------------------------------------------------------
       *
       * Só removemos as reservas deste utilizador.
       */

      const {
        error: reservationError,
      } = await supabaseAdmin
        .from("raffle_ticket_reservations")
        .delete()
        .eq("raffle_id", raffleId)
        .eq("user_id", userId)
        .in(
          "ticket_number",
          selectedTickets,
        );

      if (reservationError) {
        console.error(
          "❌ Erro ao remover reservas:",
          reservationError,
        );
      } else {
        console.log(
          "🗑️ Reservas removidas.",
        );
      }

      break;
    }

    /*
     * ---------------------------------------------------------
     * CHECKOUT EXPIRADO / ABANDONADO
     * ---------------------------------------------------------
     */

    case "checkout.session.expired": {
      console.log(
        "⏱️ Checkout expired.",
      );

      const session =
        event.data.object as Stripe.Checkout.Session;

      const raffleId =
        session.metadata?.listingId;

      const userId =
        session.metadata?.userId;

      let selectedTickets: number[] = [];

      try {
        selectedTickets = JSON.parse(
          session.metadata?.selectedTickets ||
            "[]",
        );
      } catch {
        console.error(
          "❌ Metadata selectedTickets inválida no checkout expirado.",
        );
      }

      if (
        raffleId &&
        userId &&
        Array.isArray(selectedTickets) &&
        selectedTickets.length > 0
      ) {
        const {
          error: reservationError,
        } = await supabaseAdmin
          .from(
            "raffle_ticket_reservations",
          )
          .delete()
          .eq("raffle_id", raffleId)
          .eq("user_id", userId)
          .in(
            "ticket_number",
            selectedTickets,
          );

        if (reservationError) {
          console.error(
            "❌ Erro ao libertar reservas expiradas:",
            reservationError,
          );
        } else {
          console.log(
            "🟢 Reservas libertadas após checkout expirado.",
          );
        }
      }

      break;
    }

    default:
      console.log(
        `Ignored event: ${event.type}`,
      );
  }

  return NextResponse.json({
    received: true,
  });
}