import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isListingDeliveryMethod } from "@/lib/delivery";

export async function POST(req: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTENTICAÇÃO
     * ---------------------------------------------------------
     */

    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilizador não autenticado.",
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
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return NextResponse.json(
        {
          success: false,
          message: "Sessão inválida. Faz login novamente.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. DADOS RECEBIDOS
     * ---------------------------------------------------------
     *
     * O user_id NÃO é aceite do frontend.
     */

    const body = await req.json();

    const {
      brand,
      model,
      category,
      condition,
      listing_type,
      description,
      price,
      starting_bid,
      duration_days,
      ticket_price,
      total_tickets,
      delivery_method,
      pickup_location,
    } = body;

    /*
     * ---------------------------------------------------------
     * 3. VALIDAÇÕES BÁSICAS
     * ---------------------------------------------------------
     */

    if (
      typeof brand !== "string" ||
      !brand.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A marca é obrigatória.",
        },
        { status: 400 },
      );
    }

    if (!isListingDeliveryMethod(delivery_method)) {
      return NextResponse.json(
        { success: false, message: "Forma de entrega inválida." },
        { status: 400 },
      );
    }

    if (
      (delivery_method === "pickup" ||
        delivery_method === "both") &&
      (typeof pickup_location !== "string" || !pickup_location.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Indica a localidade da entrega em mão." },
        { status: 400 },
      );
    }

    if (
      typeof model !== "string" ||
      !model.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "O modelo é obrigatório.",
        },
        { status: 400 },
      );
    }

    const validListingTypes = [
      "sale",
      "auction",
      "raffle",
    ];

    if (
      typeof listing_type !== "string" ||
      !validListingTypes.includes(listing_type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipo de anúncio inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. VALIDAR VENDA
     * ---------------------------------------------------------
     */

    if (listing_type === "sale") {
      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Preço de venda inválido.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 5. VALIDAR LEILÃO
     * ---------------------------------------------------------
     */

    if (listing_type === "auction") {
      const numericStartingBid =
        Number(starting_bid);

      const numericDuration =
        Number(duration_days);

      if (
        !Number.isFinite(numericStartingBid) ||
        numericStartingBid <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A licitação inicial é inválida.",
          },
          { status: 400 },
        );
      }

      if (
        !Number.isInteger(numericDuration) ||
        ![3, 5, 7, 10].includes(
          numericDuration,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A duração do leilão é inválida.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 6. VALIDAR SORTEIO
     * ---------------------------------------------------------
     */

    if (listing_type === "raffle") {
      const numericTicketPrice =
        Number(ticket_price);

      const numericTotalTickets =
        Number(total_tickets);

      const validTicketPrices = [
        0.25,
        0.5,
        1,
        2,
      ];

      const validTotalTickets = [
        25,
        50,
        75,
        99,
      ];

      if (
        !Number.isFinite(
          numericTicketPrice,
        ) ||
        !validTicketPrices.includes(
          numericTicketPrice,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Preço por ticket inválido.",
          },
          { status: 400 },
        );
      }

      if (
        !Number.isInteger(
          numericTotalTickets,
        ) ||
        !validTotalTickets.includes(
          numericTotalTickets,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Número de tickets inválido.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 7. PREPARAR DADOS
     * ---------------------------------------------------------
     *
     * O user_id vem SEMPRE do Supabase Auth.
     */

    const listingData = {
      brand: brand.trim(),
      model: model.trim(),
      category:
        typeof category === "string" &&
        category.trim()
          ? category.trim()
          : null,
      condition:
        typeof condition === "string" &&
        condition.trim()
          ? condition.trim()
          : null,

      listing_type,

      description:
        typeof description === "string" &&
        description.trim()
          ? description.trim()
          : null,

      user_id: user.id,
      delivery_method,
      pickup_location:
        delivery_method === "pickup" ||
        delivery_method === "both"
          ? pickup_location.trim().slice(0, 120)
          : null,

      price:
        listing_type === "sale"
          ? Number(price)
          : null,

      starting_bid:
        listing_type === "auction"
          ? Number(starting_bid)
          : null,

      duration_days:
        listing_type === "auction"
          ? Number(duration_days)
          : null,

      ticket_price:
        listing_type === "raffle"
          ? Number(ticket_price)
          : null,

      total_tickets:
        listing_type === "raffle"
          ? Number(total_tickets)
          : null,
    };

    /*
     * ---------------------------------------------------------
     * 8. CRIAR ANÚNCIO
     * ---------------------------------------------------------
     */

    const {
      data: listing,
      error: listingError,
    } = await supabaseAdmin
      .from("listings")
      .insert(listingData)
      .select()
      .single();

    if (listingError) {
      console.error(
        "LISTING INSERT ERROR:",
        listingError,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível criar o anúncio.",
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. SUCESSO
     * ---------------------------------------------------------
     */

    console.log(
      "LISTING CREATED:",
      {
        listingId: listing.id,
        userId: user.id,
        listingType: listing.listing_type,
      },
    );

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error(
      "CREATE LISTING ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Erro interno ao criar o anúncio.",
      },
      { status: 500 },
    );
  }
}
