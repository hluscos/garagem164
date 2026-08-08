import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    /*
     * 1. AUTENTICAÇÃO
     *
     * O userId enviado pelo frontend não é confiável.
     * O utilizador verdadeiro vem do access token.
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

    const accessToken = authorization.replace("Bearer ", "").trim();

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
     * 2. DADOS RECEBIDOS
     */
    const body = await req.json();

    const raffleId = body.raffleId;
    const selectedTickets = body.selectedTickets;

    /*
     * 3. VALIDAR SORTEIO
     */
    if (typeof raffleId !== "string" || !raffleId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Sorteio inválido.",
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
          success: false,
          message: "Seleciona pelo menos um bilhete.",
        },
        { status: 400 },
      );
    }

    if (selectedTickets.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Podes comprar no máximo 10 bilhetes de cada vez.",
        },
        { status: 400 },
      );
    }

    const validTicketNumbers = selectedTickets.every(
      (ticketNumber) =>
        typeof ticketNumber === "number" &&
        Number.isInteger(ticketNumber),
    );

    if (!validTicketNumbers) {
      return NextResponse.json(
        {
          success: false,
          message: "Número de bilhete inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * 5. REMOVER DUPLICADOS DA SELEÇÃO
     */
    const uniqueTickets = [...new Set(selectedTickets)];

    if (uniqueTickets.length !== selectedTickets.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Existem bilhetes duplicados na seleção.",
        },
        { status: 400 },
      );
    }

    /*
     * 6. BUSCAR O SORTEIO NA BD
     */
    const { data: raffle, error: raffleError } = await supabaseAdmin
      .from("listings")
      .select(
        "id, user_id, listing_type, total_tickets, ticket_price",
      )
      .eq("id", raffleId)
      .maybeSingle();

    if (raffleError) {
      console.error("RAFFLE QUERY ERROR:", raffleError);

      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível verificar o sorteio.",
        },
        { status: 500 },
      );
    }

    if (!raffle) {
      return NextResponse.json(
        {
          success: false,
          message: "Sorteio não encontrado.",
        },
        { status: 404 },
      );
    }

    /*
     * 7. GARANTIR QUE É UM SORTEIO
     */
    if (raffle.listing_type !== "raffle") {
      return NextResponse.json(
        {
          success: false,
          message: "Este anúncio não é um sorteio.",
        },
        { status: 400 },
      );
    }

    /*
     * 8. O DONO NÃO PODE COMPRAR O PRÓPRIO SORTEIO
     */
    if (raffle.user_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Não podes comprar bilhetes do teu próprio sorteio.",
        },
        { status: 403 },
      );
    }

    /*
     * 9. VALIDAR INTERVALO DOS BILHETES
     */
    const invalidTicket = uniqueTickets.find(
      (ticketNumber) =>
        ticketNumber < 1 ||
        ticketNumber > raffle.total_tickets,
    );

    if (invalidTicket !== undefined) {
      return NextResponse.json(
        {
          success: false,
          message: `O bilhete #${invalidTicket} não é válido para este sorteio.`,
        },
        { status: 400 },
      );
    }

    /*
     * 10. VERIFICAR BILHETES JÁ VENDIDOS
     */
    const { data: soldTickets, error: soldError } = await supabaseAdmin
      .from("raffle_tickets")
      .select("ticket_number")
      .eq("raffle_id", raffleId)
      .in("ticket_number", uniqueTickets);

    if (soldError) {
      console.error("SOLD TICKETS ERROR:", soldError);

      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível verificar os bilhetes vendidos.",
        },
        { status: 500 },
      );
    }

    if (soldTickets && soldTickets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Alguns bilhetes já foram vendidos.",
        },
        { status: 409 },
      );
    }

    /*
     * 11. HORA ATUAL
     */
    const now = new Date().toISOString();

    /*
     * 12. LIMPAR RESERVAS EXPIRADAS
     *
     * Só apagamos reservas expiradas destes bilhetes.
     */
    const { error: expiredDeleteError } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .delete()
      .eq("raffle_id", raffleId)
      .in("ticket_number", uniqueTickets)
      .lte("expires_at", now);

    if (expiredDeleteError) {
      console.error(
        "EXPIRED RESERVATIONS DELETE ERROR:",
        expiredDeleteError,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível atualizar as reservas.",
        },
        { status: 500 },
      );
    }

    /*
     * 13. VERIFICAR RESERVAS ATIVAS
     */
    const {
      data: reservedTickets,
      error: reservationCheckError,
    } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .select("ticket_number, expires_at, user_id")
      .eq("raffle_id", raffleId)
      .gt("expires_at", now)
      .in("ticket_number", uniqueTickets);

    if (reservationCheckError) {
      console.error(
        "RESERVATION CHECK ERROR:",
        reservationCheckError,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível verificar as reservas.",
        },
        { status: 500 },
      );
    }

    if (reservedTickets && reservedTickets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Alguns bilhetes estão temporariamente reservados.",
        },
        { status: 409 },
      );
    }

    /*
     * 14. CRIAR RESERVAS
     *
     * A BD possui agora uma UNIQUE:
     *
     * (raffle_id, ticket_number)
     *
     * Portanto dois utilizadores não conseguem
     * reservar simultaneamente o mesmo bilhete.
     */
    const expiresAt = new Date(
      Date.now() + 4 * 60 * 1000,
    ).toISOString();

    const reservations = uniqueTickets.map(
      (ticketNumber: number) => ({
        raffle_id: raffleId,
        user_id: user.id,
        ticket_number: ticketNumber,
        expires_at: expiresAt,
      }),
    );

    const { error: insertError } = await supabaseAdmin
      .from("raffle_ticket_reservations")
      .insert(reservations);

    /*
     * 15. TRATAR CONFLITO DA UNIQUE
     */
    if (insertError) {
      console.error("RESERVATION INSERT ERROR:", insertError);

      /*
       * PostgreSQL duplicate key / UNIQUE violation.
       */
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Alguns bilhetes acabaram de ser reservados por outro utilizador.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível reservar os bilhetes. Tenta novamente.",
        },
        { status: 409 },
      );
    }

    /*
     * 16. SUCESSO
     */
    return NextResponse.json({
      success: true,
      expiresAt,
    });
  } catch (error) {
    console.error("RESERVE TICKETS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao reservar os bilhetes.",
      },
      { status: 500 },
    );
  }
}