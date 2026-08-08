import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    /*
     * 1. AUTENTICAÇÃO
     *
     * O userId enviado pelo browser nunca é considerado
     * uma fonte de verdade.
     */
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Utilizador não autenticado.",
        },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return NextResponse.json(
        {
          error: "Sessão inválida. Faz login novamente.",
        },
        { status: 401 },
      );
    }

    /*
     * 2. DADOS DO FRONTEND
     *
     * Só aceitamos:
     * - listingId
     * - selectedTickets
     *
     * NÃO aceitamos preço nem userId como fonte de verdade.
     */
    const { listingId, selectedTickets } = await req.json();

    /*
     * 3. VALIDAR LISTING
     */
    if (typeof listingId !== "string" || !listingId.trim()) {
      return NextResponse.json(
        {
          error: "Sorteio inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * 4. VALIDAR BILHETES
     */
    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum bilhete selecionado.",
        },
        { status: 400 },
      );
    }

    if (selectedTickets.length > 10) {
      return NextResponse.json(
        {
          error: "Podes comprar no máximo 10 bilhetes de cada vez.",
        },
        { status: 400 },
      );
    }

    const uniqueTickets = [...new Set(selectedTickets)];

    if (uniqueTickets.length !== selectedTickets.length) {
      return NextResponse.json(
        {
          error: "Existem bilhetes duplicados.",
        },
        { status: 400 },
      );
    }

    const validTickets = uniqueTickets.every(
      (ticketNumber) =>
        typeof ticketNumber === "number" &&
        Number.isInteger(ticketNumber),
    );

    if (!validTickets) {
      return NextResponse.json(
        {
          error: "Número de bilhete inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * 5. BUSCAR O SORTEIO DIRETAMENTE DA BD
     *
     * O preço, proprietário, tipo e número total de bilhetes
     * vêm sempre da base de dados.
     */
    const { data: raffle, error: raffleError } = await supabaseAdmin
      .from("listings")
      .select(
        "id, user_id, listing_type, total_tickets, ticket_price, model, brand",
      )
      .eq("id", listingId)
      .maybeSingle();

    if (raffleError) {
      console.error("RAFFLE QUERY ERROR:", raffleError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar o sorteio.",
        },
        { status: 500 },
      );
    }

    if (!raffle) {
      return NextResponse.json(
        {
          error: "Sorteio não encontrado.",
        },
        { status: 404 },
      );
    }

    /*
     * 6. GARANTIR QUE É UM SORTEIO
     */
    if (raffle.listing_type !== "raffle") {
      return NextResponse.json(
        {
          error: "Este anúncio não é um sorteio.",
        },
        { status: 400 },
      );
    }

    /*
     * 7. O DONO NUNCA PODE COMPRAR O PRÓPRIO SORTEIO
     */
    if (raffle.user_id === user.id) {
      return NextResponse.json(
        {
          error: "Não podes comprar bilhetes do teu próprio sorteio.",
        },
        { status: 403 },
      );
    }

    /*
     * 8. VALIDAR NÚMEROS DOS BILHETES
     */
    const invalidTicket = uniqueTickets.find(
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
     * 9. VERIFICAR BILHETES JÁ VENDIDOS
     */
    const { data: soldTickets, error: soldError } = await supabaseAdmin
      .from("raffle_tickets")
      .select("ticket_number")
      .eq("raffle_id", listingId)
      .in("ticket_number", uniqueTickets);

    if (soldError) {
      console.error("SOLD TICKETS ERROR:", soldError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar os bilhetes vendidos.",
        },
        { status: 500 },
      );
    }

    if (soldTickets && soldTickets.length > 0) {
      return NextResponse.json(
        {
          error: "Alguns bilhetes já foram vendidos.",
        },
        { status: 409 },
      );
    }

    /*
     * 10. VERIFICAR RESERVAS
     *
     * Os bilhetes têm de estar reservados pelo utilizador
     * autenticado e ainda dentro do prazo.
     */
    const now = new Date().toISOString();

    const {
      data: reservations,
      error: reservationError,
    } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .select("ticket_number, expires_at, user_id")
      .eq("raffle_id", listingId)
      .eq("user_id", user.id)
      .gt("expires_at", now)
      .in("ticket_number", uniqueTickets);

    if (reservationError) {
      console.error(
        "RESERVATION QUERY ERROR:",
        reservationError,
      );

      return NextResponse.json(
        {
          error: "Não foi possível verificar as reservas.",
        },
        { status: 500 },
      );
    }

    if (!reservations || reservations.length !== uniqueTickets.length) {
      return NextResponse.json(
        {
          error:
            "Alguns bilhetes já não estão reservados para esta compra. Volta a selecioná-los.",
        },
        { status: 409 },
      );
    }

    /*
     * 11. PREÇO REAL
     *
     * MUITO IMPORTANTE:
     *
     * Nunca usamos:
     *
     * ticketPrice
     *
     * enviado pelo browser.
     *
     * O preço vem diretamente da BD.
     */
    const ticketPrice = Number(raffle.ticket_price);

    if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
      console.error(
        "INVALID RAFFLE PRICE:",
        raffle.ticket_price,
      );

      return NextResponse.json(
        {
          error: "Preço do sorteio inválido.",
        },
        { status: 500 },
      );
    }

    /*
     * 12. QUANTIDADE REAL
     *
     * Também não confiamos numa quantity enviada pelo browser.
     */
    const quantity = uniqueTickets.length;

    /*
     * 13. CRIAR CHECKOUT STRIPE
     */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "eur",

            product_data: {
              name: `${raffle.brand} ${raffle.model} — Bilhete de Sorteio`,
            },

            unit_amount: Math.round(ticketPrice * 100),
          },

          quantity,
        },
      ],

      /*
       * Metadata criada pelo servidor.
       *
       * Não vem do browser.
       */
      metadata: {
        listingId: raffle.id,
        userId: user.id,
        quantity: quantity.toString(),
        selectedTickets: JSON.stringify(uniqueTickets),
      },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-cancel`,
    });

    /*
     * 14. DEVOLVER URL DO STRIPE
     */
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("CREATE CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error: "Erro ao criar checkout.",
      },
      { status: 500 },
    );
  }
}