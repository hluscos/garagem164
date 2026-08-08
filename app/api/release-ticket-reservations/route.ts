import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
     * 2. DADOS RECEBIDOS
     * ---------------------------------------------------------
     */

    const {
      listingId,
      ticketNumbers,
    } = await req.json();

    /*
     * ---------------------------------------------------------
     * 3. VALIDAR SORTEIO
     * ---------------------------------------------------------
     */

    if (
      typeof listingId !== "string" ||
      !listingId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Sorteio inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. VALIDAR TICKETS
     * ---------------------------------------------------------
     */

    if (
      !Array.isArray(ticketNumbers) ||
      ticketNumbers.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Nenhum bilhete indicado.",
        },
        { status: 400 },
      );
    }

    if (ticketNumbers.length > 10) {
      return NextResponse.json(
        {
          error:
            "Número de bilhetes inválido.",
        },
        { status: 400 },
      );
    }

    const uniqueTickets = [
      ...new Set(ticketNumbers),
    ];

    const validTickets =
      uniqueTickets.every(
        (ticketNumber) =>
          typeof ticketNumber === "number" &&
          Number.isInteger(ticketNumber) &&
          ticketNumber > 0,
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
     * 5. CONFIRMAR QUE AS RESERVAS PERTENCEM
     * AO UTILIZADOR
     * ---------------------------------------------------------
     */

    const {
      data: reservations,
      error: reservationQueryError,
    } = await supabaseAdmin
      .from(
        "raffle_ticket_reservations",
      )
      .select(
        "ticket_number, user_id",
      )
      .eq(
        "raffle_id",
        listingId,
      )
      .eq(
        "user_id",
        user.id,
      )
      .in(
        "ticket_number",
        uniqueTickets,
      );

    if (reservationQueryError) {
      console.error(
        "RESERVATION QUERY ERROR:",
        reservationQueryError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar as reservas.",
        },
        { status: 500 },
      );
    }

    /*
     * Se não houver nenhuma reserva,
     * não há nada para libertar.
     */

    if (
      !reservations ||
      reservations.length === 0
    ) {
      return NextResponse.json({
        success: true,
        released: 0,
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. APAGAR APENAS AS RESERVAS DO UTILIZADOR
     * ---------------------------------------------------------
     */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from(
        "raffle_ticket_reservations",
      )
      .delete()
      .eq(
        "raffle_id",
        listingId,
      )
      .eq(
        "user_id",
        user.id,
      )
      .in(
        "ticket_number",
        uniqueTickets,
      );

    if (deleteError) {
      console.error(
        "RELEASE RESERVATIONS ERROR:",
        deleteError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível libertar os bilhetes.",
        },
        { status: 500 },
      );
    }

    console.log(
      "🟢 RESERVAS LIBERTADAS:",
      {
        userId: user.id,
        listingId,
        tickets: uniqueTickets,
      },
    );

    return NextResponse.json({
      success: true,
      released: reservations.length,
    });
  } catch (error) {
    console.error(
      "RELEASE RESERVATIONS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao libertar reservas.",
      },
      { status: 500 },
    );
  }
}