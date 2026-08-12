import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTENTICAÇÃO
     * ---------------------------------------------------------
     */

    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Utilizador não autenticado.",
        },
        { status: 401 },
      );
    }

    const accessToken = authorization
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      console.error(
        "AUTH ERROR:",
        userError,
      );

      return NextResponse.json(
        {
          error:
            "Sessão inválida. Faz login novamente.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. DADOS DO FRONTEND
     * ---------------------------------------------------------
     *
     * Para sorteios:
     * - type
     * - listingId
     * - selectedTickets
     *
     * Para leilões:
     * - type
     * - listingId
     *
     * O preço nunca vem do frontend.
     */

    const body = await req.json();

    const {
      type = "raffle",
      listingId,
      selectedTickets,
    } = body;

    /*
     * ---------------------------------------------------------
     * 3. VALIDAR LISTING ID
     * ---------------------------------------------------------
     */

    if (
      typeof listingId !== "string" ||
      !listingId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Anúncio inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. FLUXO DE LEILÃO
     * ---------------------------------------------------------
     */

    if (type === "auction") {
      /*
       * -------------------------------------------------------
       * 4.1 BUSCAR LEILÃO
       * -------------------------------------------------------
       */

      const {
        data: auction,
        error: auctionError,
      } = await supabaseAdmin
        .from("listings")
        .select(
          "id, user_id, listing_type, starting_bid, duration_days, created_at, brand, model",
        )
        .eq("id", listingId)
        .maybeSingle();

      if (auctionError) {
        console.error(
          "AUCTION QUERY ERROR:",
          auctionError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível verificar o leilão.",
          },
          { status: 500 },
        );
      }

      if (!auction) {
        return NextResponse.json(
          {
            error: "Leilão não encontrado.",
          },
          { status: 404 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.2 GARANTIR QUE É LEILÃO
       * -------------------------------------------------------
       */

      if (auction.listing_type !== "auction") {
        return NextResponse.json(
          {
            error:
              "Este anúncio não é um leilão.",
          },
          { status: 400 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.3 CALCULAR FIM DO LEILÃO
       * -------------------------------------------------------
       */

      const createdAt =
        new Date(auction.created_at);

      const endTime = new Date(
        createdAt.getTime() +
          Number(auction.duration_days) *
            24 *
            60 *
            60 *
            1000,
      );

      /*
       * O leilão tem obrigatoriamente de estar terminado
       * para poder ser pago.
       */

      if (new Date() < endTime) {
        return NextResponse.json(
          {
            error:
              "Este leilão ainda não terminou.",
            endTime: endTime.toISOString(),
          },
          { status: 409 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.4 OBTER O MAIOR LANCE
       * -------------------------------------------------------
       */

      const {
        data: winningBid,
        error: winningBidError,
      } = await supabaseAdmin
        .from("auction_bids")
        .select(
          "id, auction_id, user_id, amount, created_at",
        )
        .eq("auction_id", auction.id)
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
          "WINNING BID QUERY ERROR:",
          winningBidError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível determinar o vencedor.",
          },
          { status: 500 },
        );
      }

      /*
       * Um leilão sem lances não pode ser pago.
       */

      if (!winningBid) {
        return NextResponse.json(
          {
            error:
              "Este leilão terminou sem licitações.",
          },
          { status: 409 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.5 CONFIRMAR QUE O UTILIZADOR É O VENCEDOR
       * -------------------------------------------------------
       */

      if (winningBid.user_id !== user.id) {
        return NextResponse.json(
          {
            error:
              "Apenas o vencedor do leilão pode efetuar o pagamento.",
          },
          { status: 403 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.6 GARANTIR QUE O VENCEDOR NÃO É O PROPRIETÁRIO
       * -------------------------------------------------------
       */

      if (auction.user_id === user.id) {
        return NextResponse.json(
          {
            error:
              "O proprietário não pode efetuar o pagamento deste leilão.",
          },
          { status: 403 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.7 VERIFICAR SE JÁ EXISTE PAGAMENTO
       * -------------------------------------------------------
       */

      const {
        data: existingPayment,
        error: existingPaymentError,
      } = await supabaseAdmin
        .from("stripe_payments")
        .select(
          "id, stripe_session_id, status, amount",
        )
        .eq("auction_id", auction.id)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (existingPaymentError) {
        console.error(
          "EXISTING AUCTION PAYMENT ERROR:",
          existingPaymentError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível verificar o pagamento.",
          },
          { status: 500 },
        );
      }

      if (existingPayment) {
        return NextResponse.json(
          {
            error:
              "Este leilão já tem um pagamento registado.",
            paid: true,
          },
          { status: 409 },
        );
      }

      /*
       * -------------------------------------------------------
       * 4.8 VALIDAR VALOR DO LANCE
       * -------------------------------------------------------
       *
       * O valor vem exclusivamente da BD.
       */

      const winningAmount =
        Number(winningBid.amount);

      if (
        !Number.isFinite(winningAmount) ||
        winningAmount <= 0
      ) {
        console.error(
          "INVALID WINNING AMOUNT:",
          winningBid.amount,
        );

        return NextResponse.json(
          {
            error:
              "Valor do lance vencedor inválido.",
          },
          { status: 500 },
        );
      }

      /*
       * Stripe trabalha em cêntimos.
       */

      const amountInCents =
        Math.round(winningAmount * 100);

      /*
       * -------------------------------------------------------
       * 4.9 CRIAR CHECKOUT STRIPE
       * -------------------------------------------------------
       */

      const session =
        await stripe.checkout.sessions.create({
          mode: "payment",

          payment_method_types: ["card"],

          ...(user.email
            ? {
                customer_email: user.email,
              }
            : {}),

          line_items: [
            {
              price_data: {
                currency: "eur",

                product_data: {
                  name:
                    `${auction.brand} ${auction.model}` +
                    " — Leilão Garagem164",
                },

                unit_amount:
                  amountInCents,
              },

              quantity: 1,
            },
          ],

          /*
           * Metadata criada exclusivamente pelo servidor.
           */

          metadata: {
            type: "auction",
            listingId: auction.id,
            auctionId: auction.id,
            userId: user.id,
            bidId: winningBid.id,
            amount: winningAmount.toFixed(2),
          },

          success_url:
            `${process.env.NEXT_PUBLIC_SITE_URL}` +
            `/payment-success` +
            `?type=auction` +
            `&listingId=${encodeURIComponent(
              auction.id,
            )}`,

          cancel_url:
            `${process.env.NEXT_PUBLIC_SITE_URL}` +
            `/auctions/${encodeURIComponent(
              auction.id,
            )}`,
        });

      /*
       * -------------------------------------------------------
       * 4.10 DEVOLVER URL DO STRIPE
       * -------------------------------------------------------
       */

      return NextResponse.json({
        url: session.url,
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. FLUXO DE SORTEIO
     * ---------------------------------------------------------
     *
     * A partir daqui mantemos o comportamento original.
     */

    if (type !== "raffle") {
      return NextResponse.json(
        {
          error:
            "Tipo de checkout inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.1 VALIDAR BILHETES
     * ---------------------------------------------------------
     */

    if (
      !Array.isArray(selectedTickets) ||
      selectedTickets.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Nenhum bilhete selecionado.",
        },
        { status: 400 },
      );
    }

    if (selectedTickets.length > 10) {
      return NextResponse.json(
        {
          error:
            "Podes comprar no máximo 10 bilhetes de cada vez.",
        },
        { status: 400 },
      );
    }

    const uniqueTickets = [
      ...new Set(selectedTickets),
    ];

    if (
      uniqueTickets.length !==
      selectedTickets.length
    ) {
      return NextResponse.json(
        {
          error:
            "Existem bilhetes duplicados.",
        },
        { status: 400 },
      );
    }

    const validTickets =
      uniqueTickets.every(
        (ticketNumber) =>
          typeof ticketNumber === "number" &&
          Number.isInteger(ticketNumber),
      );

    if (!validTickets) {
      return NextResponse.json(
        {
          error:
            "Número de bilhete inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.2 BUSCAR SORTEIO
     * ---------------------------------------------------------
     */

    const {
      data: raffle,
      error: raffleError,
    } = await supabaseAdmin
      .from("listings")
      .select(
        "id, user_id, listing_type, total_tickets, ticket_price, model, brand",
      )
      .eq("id", listingId)
      .maybeSingle();

    if (raffleError) {
      console.error(
        "RAFFLE QUERY ERROR:",
        raffleError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar o sorteio.",
        },
        { status: 500 },
      );
    }

    if (!raffle) {
      return NextResponse.json(
        {
          error:
            "Sorteio não encontrado.",
        },
        { status: 404 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.3 GARANTIR QUE É SORTEIO
     * ---------------------------------------------------------
     */

    if (raffle.listing_type !== "raffle") {
      return NextResponse.json(
        {
          error:
            "Este anúncio não é um sorteio.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.4 O DONO NÃO PODE COMPRAR
     * ---------------------------------------------------------
     */

    if (raffle.user_id === user.id) {
      return NextResponse.json(
        {
          error:
            "Não podes comprar bilhetes do teu próprio sorteio.",
        },
        { status: 403 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.5 VALIDAR NÚMEROS
     * ---------------------------------------------------------
     */

    const invalidTicket =
      uniqueTickets.find(
        (ticketNumber) =>
          ticketNumber < 1 ||
          ticketNumber > raffle.total_tickets,
      );

    if (invalidTicket !== undefined) {
      return NextResponse.json(
        {
          error: `O bilhete #${invalidTicket} não é válido para este sorteio.`,
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.6 VERIFICAR BILHETES VENDIDOS
     * ---------------------------------------------------------
     */

    const {
      data: soldTickets,
      error: soldError,
    } = await supabaseAdmin
      .from("raffle_tickets")
      .select("ticket_number")
      .eq("raffle_id", listingId)
      .in(
        "ticket_number",
        uniqueTickets,
      );

    if (soldError) {
      console.error(
        "SOLD TICKETS ERROR:",
        soldError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar os bilhetes vendidos.",
        },
        { status: 500 },
      );
    }

    if (
      soldTickets &&
      soldTickets.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Alguns bilhetes já foram vendidos.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.7 VERIFICAR RESERVAS
     * ---------------------------------------------------------
     */

    const now =
      new Date().toISOString();

    const {
      data: reservations,
      error: reservationError,
    } = await supabaseAdmin
      .from(
        "raffle_ticket_reservations",
      )
      .select(
        "ticket_number, expires_at, user_id",
      )
      .eq("raffle_id", listingId)
      .eq("user_id", user.id)
      .gt("expires_at", now)
      .in(
        "ticket_number",
        uniqueTickets,
      );

    if (reservationError) {
      console.error(
        "RESERVATION QUERY ERROR:",
        reservationError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar as reservas.",
        },
        { status: 500 },
      );
    }

    if (
      !reservations ||
      reservations.length !==
        uniqueTickets.length
    ) {
      return NextResponse.json(
        {
          error:
            "Alguns bilhetes já não estão reservados para esta compra. Volta a selecioná-los.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.8 PREÇO REAL
     * ---------------------------------------------------------
     */

    const ticketPrice = Number(
      raffle.ticket_price,
    );

    if (
      !Number.isFinite(ticketPrice) ||
      ticketPrice <= 0
    ) {
      console.error(
        "INVALID RAFFLE PRICE:",
        raffle.ticket_price,
      );

      return NextResponse.json(
        {
          error:
            "Preço do sorteio inválido.",
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5.9 QUANTIDADE REAL
     * ---------------------------------------------------------
     */

    const quantity =
      uniqueTickets.length;

    /*
     * ---------------------------------------------------------
     * 5.10 URL DE CANCELAMENTO
     * ---------------------------------------------------------
     */

    const cancelUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL}` +
      `/payment-cancel` +
      `?listingId=${encodeURIComponent(
        raffle.id,
      )}` +
      `&tickets=${encodeURIComponent(
        uniqueTickets.join(","),
      )}`;

    /*
     * ---------------------------------------------------------
     * 5.11 CRIAR CHECKOUT STRIPE
     * ---------------------------------------------------------
     */

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        ...(user.email
          ? {
              customer_email: user.email,
            }
          : {}),

        line_items: [
          {
            price_data: {
              currency: "eur",

              product_data: {
                name: `${raffle.brand} ${raffle.model} — Bilhete de Sorteio`,
              },

              unit_amount: Math.round(
                ticketPrice * 100,
              ),
            },

            quantity,
          },
        ],

        /*
         * Metadata criada pelo servidor.
         */

        metadata: {
          type: "raffle",
          listingId: raffle.id,
          userId: user.id,
          quantity: quantity.toString(),
          selectedTickets:
            JSON.stringify(uniqueTickets),
        },

        success_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}` +
          `/payment-success`,

        cancel_url: cancelUrl,
      });

    /*
     * ---------------------------------------------------------
     * 5.12 DEVOLVER URL
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "CREATE CHECKOUT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao criar checkout.",
      },
      { status: 500 },
    );
  }
}