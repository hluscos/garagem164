import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const {
      raffleId,
      userId,
      selectedTickets,
    } = await req.json();

    // Verifica bilhetes já vendidos
    const { data: soldTickets } = await supabaseAdmin
      .from("raffle_tickets")
      .select("ticket_number")
      .eq("raffle_id", raffleId)
      .in("ticket_number", selectedTickets);

    if (soldTickets && soldTickets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Alguns bilhetes já foram vendidos.",
        },
        { status: 409 }
      );
    }

    // Verifica reservas ainda válidas
    const now = new Date().toISOString();

    const { data: reservedTickets } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .select("ticket_number")
      .eq("raffle_id", raffleId)
      .gt("expires_at", now)
      .in("ticket_number", selectedTickets);

    if (reservedTickets && reservedTickets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Alguns bilhetes estão temporariamente reservados.",
        },
        { status: 409 }
      );
    }

    // Reserva durante 10 minutos
    const expiresAt = new Date(
      Date.now() + 4 * 60 * 1000
    ).toISOString();

    const reservations = selectedTickets.map(
      (ticketNumber: number) => ({
        raffle_id: raffleId,
        user_id: userId,
        ticket_number: ticketNumber,
        expires_at: expiresAt,
      })
    );

    const { error } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .insert(reservations);

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar reservas.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno.",
      },
      { status: 500 }
    );
  }
}