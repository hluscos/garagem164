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

  /*
   * ---------------------------------------------------------
   * VALIDAR ASSINATURA STRIPE
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * EVENTOS STRIPE
   * ---------------------------------------------------------
   */

  switch (event.type) {
    /*
     * =========================================================
     * CHECKOUT CONCLUÍDO
     * =========================================================
     */

    case "checkout.session.completed": {
      console.log(
        "✅ Checkout completed!",
      );

      const session =
        event.data.object as Stripe.Checkout.Session;

      const metadata =
        session.metadata ?? {};

      const type =
        metadata.type || "raffle";

      console.log(
        "====================================",
      );

      console.log(
        "STRIPE EVENT:",
        event.type,
      );

      console.log(
        "CHECKOUT TYPE:",
        type,
      );

      console.log(
        "METADATA:",
        metadata,
      );

      console.log(
        "SESSION ID:",
        session.id,
      );

      console.log(
        "PAYMENT STATUS:",
        session.payment_status,
      );

      console.log(
        "AMOUNT:",
        session.amount_total,
      );

      console.log(
        "====================================",
      );

      /*
       * =======================================================
       * FLUXO DE LEILÃO
       * =======================================================
       */

      if (type === "auction") {
        const auctionId =
          metadata.auctionId ||
          metadata.listingId;

        const userId =
          metadata.userId;

        const bidId =
          metadata.bidId;

        /*
         * -----------------------------------------------------
         * VALIDAR METADATA
         * -----------------------------------------------------
         */

        const metadataAmount =
          Number(metadata.amount);

        if (
          !auctionId ||
          !userId ||
          !bidId ||
          !Number.isFinite(
            metadataAmount,
          ) ||
          metadataAmount <= 0
        ) {
          console.error(
            "❌ Metadata de leilão inválida:",
            {
              auctionId,
              userId,
              bidId,
              metadataAmount,
            },
          );

          return NextResponse.json(
            {
              error:
                "Invalid auction metadata.",
            },
            { status: 400 },
          );
        }

        /*
         * -----------------------------------------------------
         * CHECKOUT TEM DE ESTAR PAGO
         * -----------------------------------------------------
         */

        if (
          session.payment_status !==
          "paid"
        ) {
          console.log(
            "⏳ Checkout de leilão ainda não está pago:",
            session.id,
          );

          return NextResponse.json({
            received: true,
          });
        }

        /*
         * -----------------------------------------------------
         * BUSCAR LEILÃO
         * -----------------------------------------------------
         */

        const {
          data: auction,
          error: auctionError,
        } = await supabaseAdmin
          .from("listings")
          .select(
            `
              id,
              user_id,
              listing_type,
              duration_days,
              created_at
            `,
          )
          .eq("id", auctionId)
          .maybeSingle();

        if (auctionError) {
          console.error(
            "❌ AUCTION QUERY ERROR:",
            auctionError,
          );

          return NextResponse.json(
            {
              error:
                "Failed to verify auction.",
            },
            { status: 500 },
          );
        }

        if (!auction) {
          console.error(
            "❌ Leilão não encontrado:",
            auctionId,
          );

          return NextResponse.json(
            {
              error:
                "Auction not found.",
            },
            { status: 404 },
          );
        }

        /*
         * -----------------------------------------------------
         * GARANTIR QUE É LEILÃO
         * -----------------------------------------------------
         */

        if (
          auction.listing_type !==
          "auction"
        ) {
          console.error(
            "❌ Listing não é leilão:",
            auctionId,
          );

          return NextResponse.json(
            {
              error:
                "Listing is not an auction.",
            },
            { status: 400 },
          );
        }

        /*
         * -----------------------------------------------------
         * GARANTIR QUE O LEILÃO TERMINOU
         * -----------------------------------------------------
         */

        const endTime =
          new Date(
            auction.created_at,
          ).getTime() +
          Number(
            auction.duration_days,
          ) *
            24 *
            60 *
            60 *
            1000;

        if (
          Date.now() <
          endTime
        ) {
          console.error(
            "❌ Tentativa de pagamento antes do fim do leilão:",
            auctionId,
          );

          return NextResponse.json(
            {
              error:
                "Auction has not ended.",
            },
            { status: 409 },
          );
        }

        /*
         * -----------------------------------------------------
         * OBTER MAIOR LANCE REAL
         * -----------------------------------------------------
         */

        const {
          data: winningBid,
          error: winningBidError,
        } = await supabaseAdmin
          .from("auction_bids")
          .select(
            `
              id,
              auction_id,
              user_id,
              amount,
              created_at
            `,
          )
          .eq(
            "auction_id",
            auctionId,
          )
          .order("amount", {
            ascending: false,
          })
          .order("created_at", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

        if (winningBidError) {
          console.error(
            "❌ WINNING BID QUERY ERROR:",
            winningBidError,
          );

          return NextResponse.json(
            {
              error:
                "Failed to verify winning bid.",
            },
            { status: 500 },
          );
        }

        if (!winningBid) {
          console.error(
            "❌ Leilão sem vencedor:",
            auctionId,
          );

          return NextResponse.json(
            {
              error:
                "Auction has no winning bid.",
            },
            { status: 409 },
          );
        }

        /*
         * -----------------------------------------------------
         * VALIDAR VENCEDOR
         * -----------------------------------------------------
         */

        if (
          winningBid.id !== bidId
        ) {
          console.error(
            "❌ BID ID não corresponde ao vencedor:",
            {
              metadataBidId: bidId,
              winningBidId:
                winningBid.id,
            },
          );

          return NextResponse.json(
            {
              error:
                "Winning bid mismatch.",
            },
            { status: 409 },
          );
        }

        if (
          winningBid.user_id !==
          userId
        ) {
          console.error(
            "❌ Utilizador não corresponde ao vencedor:",
            {
              metadataUserId: userId,
              winningUserId:
                winningBid.user_id,
            },
          );

          return NextResponse.json(
            {
              error:
                "Winner mismatch.",
            },
            { status: 403 },
          );
        }

        /*
         * -----------------------------------------------------
         * VALIDAR VALOR
         * -----------------------------------------------------
         */

        const winningAmount =
          Number(
            winningBid.amount,
          );

        const stripeAmount =
          Number(
            session.amount_total ?? 0,
          );

        const expectedStripeAmount =
          Math.round(
            winningAmount * 100,
          );

        if (
          stripeAmount !==
          expectedStripeAmount
        ) {
          console.error(
            "❌ Valor Stripe diferente do lance vencedor:",
            {
              stripeAmount,
              expectedStripeAmount,
              winningAmount,
            },
          );

          return NextResponse.json(
            {
              error:
                "Payment amount does not match winning bid.",
            },
            { status: 409 },
          );
        }

        /*
         * -----------------------------------------------------
         * PAGAMENTO STRIPE
         * -----------------------------------------------------
         *
         * Pode já existir se o webhook estiver a ser repetido.
         * Nesse caso NÃO saímos do webhook.
         */

        const {
          data: existingAuctionPayment,
          error:
            existingAuctionPaymentError,
        } = await supabaseAdmin
          .from("stripe_payments")
          .select(
            `
              id,
              stripe_session_id,
              payment_intent,
              auction_id,
              user_id,
              amount
            `,
          )
          .eq(
            "auction_id",
            auctionId,
          )
          .maybeSingle();

        if (
          existingAuctionPaymentError
        ) {
          console.error(
            "❌ EXISTING AUCTION PAYMENT ERROR:",
            existingAuctionPaymentError,
          );

          return NextResponse.json(
            {
              error:
                "Failed to verify existing auction payment.",
            },
            { status: 500 },
          );
        }

        /*
         * -----------------------------------------------------
         * REGISTAR PAGAMENTO SE AINDA NÃO EXISTIR
         * -----------------------------------------------------
         */

        if (
          !existingAuctionPayment
        ) {
          const {
            error: paymentError,
          } = await supabaseAdmin
            .from("stripe_payments")
            .insert({
              stripe_session_id:
                session.id,

              payment_intent:
                typeof session.payment_intent ===
                "string"
                  ? session.payment_intent
                  : null,

              raffle_id:
                null,

              auction_id:
                auctionId,

              user_id:
                userId,

              quantity:
                null,

              amount:
                session.amount_total ??
                0,
            });

          if (paymentError) {
            console.error(
              "❌ Erro ao gravar pagamento do leilão:",
              paymentError,
            );

            return NextResponse.json(
              {
                error:
                  "Failed to record auction payment.",
              },
              { status: 500 },
            );
          }

          console.log(
            "🏆 PAGAMENTO DO LEILÃO REGISTADO:",
            {
              auctionId,
              userId,
              bidId,
              amount:
                winningAmount,
              stripeSessionId:
                session.id,
            },
          );
        } else {
          console.log(
            "ℹ️ Pagamento do leilão já existe:",
            auctionId,
          );
        }

        /*
         * =====================================================
         * TRANSACTION / ESCROW INTERNO
         * =====================================================
         */

        const {
          data: existingTransaction,
          error:
            transactionQueryError,
        } = await supabaseAdmin
          .from("transactions")
          .select(
            `
              id,
              amount,
              platform_fee,
              seller_amount,
              currency,
              commercial_status,
              financial_status,
              stripe_payment_intent,
              stripe_checkout_session
            `,
          )
          .eq(
            "auction_id",
            auctionId,
          )
          .maybeSingle();

        if (transactionQueryError) {
          console.error(
            "❌ TRANSACTION QUERY ERROR:",
            transactionQueryError,
          );

          return NextResponse.json(
            {
              error:
                "Failed to verify transaction.",
            },
            { status: 500 },
          );
        }

        let transactionId =
          existingTransaction?.id;

        /*
         * -----------------------------------------------------
         * CRIAR TRANSACTION
         * -----------------------------------------------------
         */

        if (
          !existingTransaction
        ) {
          const amount =
            winningAmount;

          const platformFee =
            Math.round(
              amount * 0.03 * 100,
            ) / 100;

          const sellerAmount =
            Math.round(
              (amount -
                platformFee) *
                100,
            ) / 100;

          const {
            data: newTransaction,
            error:
              transactionInsertError,
          } = await supabaseAdmin
            .from("transactions")
            .insert({
              listing_id:
                auctionId,

              auction_id:
                auctionId,

              buyer_id:
                userId,

              seller_id:
                auction.user_id,

              amount,

              platform_fee:
                platformFee,

              seller_amount:
                sellerAmount,

              currency:
                "eur",

              commercial_status:
                "paid",

              financial_status:
                "held",

              stripe_payment_intent:
                typeof session.payment_intent ===
                "string"
                  ? session.payment_intent
                  : null,

              stripe_checkout_session:
                session.id,

              paid_at:
                new Date().toISOString(),
            })
            .select(
              "id",
            )
            .single();

          if (
            transactionInsertError
          ) {
            console.error(
              "❌ TRANSACTION INSERT ERROR:",
              transactionInsertError,
            );

            return NextResponse.json(
              {
                error:
                  "Failed to create transaction.",
              },
              { status: 500 },
            );
          }

          transactionId =
            newTransaction.id;

          console.log(
            "💰 TRANSACTION CRIADA:",
            {
              transactionId,
              auctionId,
              amount,
              platformFee,
              sellerAmount,
            },
          );
        } else {
          console.log(
            "ℹ️ Transaction já existe:",
            transactionId,
          );
        }

        /*
         * -----------------------------------------------------
         * GARANTIR ESTADO FINANCEIRO
         * -----------------------------------------------------
         */

        if (
          existingTransaction &&
          existingTransaction.financial_status !==
            "held"
        ) {
          console.warn(
            "⚠️ Transaction existente com estado financeiro inesperado:",
            existingTransaction.financial_status,
          );
        }

        /*
         * =====================================================
         * TRANSACTION EVENT
         * =====================================================
         *
         * Idempotente:
         * PAYMENT_RECEIVED só pode existir uma vez
         * para esta transaction.
         */

        if (transactionId) {
          const {
            data: existingEvent,
            error:
              eventQueryError,
          } = await supabaseAdmin
            .from("transaction_events")
            .select("id")
            .eq(
              "transaction_id",
              transactionId,
            )
            .eq(
              "event_type",
              "PAYMENT_RECEIVED",
            )
            .maybeSingle();

          if (eventQueryError) {
            console.error(
              "❌ TRANSACTION EVENT QUERY ERROR:",
              eventQueryError,
            );

            return NextResponse.json(
              {
                error:
                  "Failed to verify transaction event.",
              },
              { status: 500 },
            );
          }

          if (!existingEvent) {
            const {
              data: transactionForEvent,
              error:
                transactionForEventError,
            } = await supabaseAdmin
              .from("transactions")
              .select(
                `
                  id,
                  amount,
                  currency,
                  financial_status,
                  stripe_payment_intent,
                  buyer_id
                `,
              )
              .eq(
                "id",
                transactionId,
              )
              .single();

            if (
              transactionForEventError ||
              !transactionForEvent
            ) {
              console.error(
                "❌ TRANSACTION FOR EVENT ERROR:",
                transactionForEventError,
              );

              return NextResponse.json(
                {
                  error:
                    "Failed to load transaction for event.",
                },
                { status: 500 },
              );
            }

            const {
              error:
                transactionEventError,
            } = await supabaseAdmin
              .from("transaction_events")
              .insert({
                transaction_id:
                  transactionId,

                event_type:
                  "PAYMENT_RECEIVED",

                description:
                  "Pagamento do leilão recebido e fundos colocados em retenção.",

                metadata: {
                  amount:
                    transactionForEvent.amount,

                  currency:
                    transactionForEvent.currency,

                  financial_status:
                    transactionForEvent.financial_status,

                  stripe_payment_intent:
                    transactionForEvent.stripe_payment_intent,
                },

                created_by:
                  transactionForEvent.buyer_id,
              });

            if (
              transactionEventError
            ) {
              console.error(
                "❌ TRANSACTION EVENT INSERT ERROR:",
                transactionEventError,
              );

              return NextResponse.json(
                {
                  error:
                    "Failed to create transaction event.",
                },
                { status: 500 },
              );
            }

            console.log(
              "📝 PAYMENT_RECEIVED EVENT CRIADO:",
              transactionId,
            );
          } else {
            console.log(
              "ℹ️ PAYMENT_RECEIVED event já existe:",
              transactionId,
            );
          }
        }

        break;
      }

      /*
       * =======================================================
       * FLUXO DE SORTEIO
       * =======================================================
       */

      if (type !== "raffle") {
        console.error(
          "❌ Tipo de checkout desconhecido:",
          type,
        );

        return NextResponse.json(
          {
            error:
              "Unknown checkout type.",
          },
          { status: 400 },
        );
      }

      /*
       * -------------------------------------------------------
       * IMPEDIR DUPLICAÇÃO DE PAGAMENTO DE SORTEIO
       * -------------------------------------------------------
       */

      const {
        data: existingRafflePayment,
      } = await supabaseAdmin
        .from("stripe_payments")
        .select("id")
        .eq(
          "stripe_session_id",
          session.id,
        )
        .maybeSingle();

      if (existingRafflePayment) {
        console.log(
          "⚠️ Webhook de sorteio já processado:",
          session.id,
        );

        return NextResponse.json({
          received: true,
        });
      }

      /*
       * -------------------------------------------------------
       * DADOS DO SORTEIO
       * -------------------------------------------------------
       */

      const raffleId =
        metadata.listingId;

      const raffleUserId =
        metadata.userId;

      const quantity = Number(
        metadata.quantity || 0,
      );

      let selectedTickets: number[] =
        [];

      try {
        selectedTickets =
          JSON.parse(
            metadata.selectedTickets ||
              "[]",
          );
      } catch (error) {
        console.error(
          "❌ Erro ao interpretar selectedTickets:",
          error,
        );

        return NextResponse.json(
          {
            error:
              "Invalid ticket metadata.",
          },
          { status: 400 },
        );
      }

      /*
       * -------------------------------------------------------
       * VALIDAR METADATA DO SORTEIO
       * -------------------------------------------------------
       */

      if (
        !raffleId ||
        !raffleUserId ||
        !Number.isInteger(
          quantity,
        ) ||
        quantity <= 0 ||
        !Array.isArray(
          selectedTickets,
        ) ||
        selectedTickets.length !==
          quantity
      ) {
        console.error(
          "❌ Metadata inválida no Checkout:",
          {
            raffleId,
            userId:
              raffleUserId,
            quantity,
            selectedTickets,
          },
        );

        return NextResponse.json(
          {
            error:
              "Invalid checkout metadata.",
          },
          { status: 400 },
        );
      }

      /*
       * -------------------------------------------------------
       * REGISTAR PAGAMENTO
       * -------------------------------------------------------
       */

      const {
        error: paymentError,
      } = await supabaseAdmin
        .from("stripe_payments")
        .insert({
          stripe_session_id:
            session.id,

          payment_intent:
            typeof session.payment_intent ===
            "string"
              ? session.payment_intent
              : null,

          raffle_id:
            raffleId,

          auction_id:
            null,

          user_id:
            raffleUserId,

          quantity,

          amount:
            session.amount_total ??
            0,
        });

      if (paymentError) {
        console.error(
          "❌ Erro ao gravar pagamento:",
          paymentError,
        );

        return NextResponse.json(
          {
            error:
              "Failed to record payment.",
          },
          { status: 500 },
        );
      }

      console.log(
        "✅ Pagamento do sorteio gravado no Supabase.",
      );

      /*
       * -------------------------------------------------------
       * CRIAR BILHETES VENDIDOS
       * -------------------------------------------------------
       */

      const ticketPrice =
        (session.amount_total ?? 0) /
        quantity /
        100;

      const tickets =
        selectedTickets.map(
          (
            ticketNumber: number,
          ) => ({
            raffle_id:
              raffleId,

            user_id:
              raffleUserId,

            ticket_number:
              ticketNumber,

            quantity: 1,

            total_price:
              ticketPrice,

            stripe_session_id:
              session.id,

            payment_intent:
              typeof session.payment_intent ===
              "string"
                ? session.payment_intent
                : null,
          }),
        );

      const {
        error: ticketError,
      } = await supabaseAdmin
        .from("raffle_tickets")
        .insert(tickets);

      if (ticketError) {
        console.error(
          "❌ Erro ao gravar bilhetes:",
          ticketError,
        );

        return NextResponse.json(
          {
            error:
              "Failed to create tickets.",
          },
          { status: 500 },
        );
      }

      console.log(
        `🎟️ ${tickets.length} bilhetes gravados.`,
      );

      /*
       * -------------------------------------------------------
       * REMOVER RESERVAS
       * -------------------------------------------------------
       */

      const {
        error: reservationError,
      } = await supabaseAdmin
        .from(
          "raffle_ticket_reservations",
        )
        .delete()
        .eq(
          "raffle_id",
          raffleId,
        )
        .eq(
          "user_id",
          raffleUserId,
        )
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
     * =========================================================
     * CHECKOUT EXPIRADO
     * =========================================================
     */

    case "checkout.session.expired": {
      console.log(
        "⏱️ Checkout expired.",
      );

      const session =
        event.data.object as Stripe.Checkout.Session;

      const metadata =
        session.metadata ?? {};

      const type =
        metadata.type || "raffle";

      /*
       * -------------------------------------------------------
       * LEILÃO
       * -------------------------------------------------------
       */

      if (type === "auction") {
        console.log(
          "ℹ️ Checkout de leilão expirado:",
          session.id,
        );

        break;
      }

      /*
       * -------------------------------------------------------
       * SORTEIO
       * -------------------------------------------------------
       */

      const raffleId =
        metadata.listingId;

      const raffleUserId =
        metadata.userId;

      let selectedTickets: number[] =
        [];

      try {
        selectedTickets =
          JSON.parse(
            metadata.selectedTickets ||
              "[]",
          );
      } catch {
        console.error(
          "❌ Metadata selectedTickets inválida no checkout expirado.",
        );
      }

      if (
        raffleId &&
        raffleUserId &&
        Array.isArray(
          selectedTickets,
        ) &&
        selectedTickets.length >
          0
      ) {
        const {
          error: reservationError,
        } = await supabaseAdmin
          .from(
            "raffle_ticket_reservations",
          )
          .delete()
          .eq(
            "raffle_id",
            raffleId,
          )
          .eq(
            "user_id",
            raffleUserId,
          )
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