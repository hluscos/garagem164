import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTENTICAÇÃO
     * ---------------------------------------------------------
     *
     * O utilizador verdadeiro vem do access token.
     * Nunca confiamos num userId enviado pelo frontend.
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
     */

    const body = await req.json();

    const auctionId = body.auctionId;
    const amount = Number(body.amount);

    /*
     * ---------------------------------------------------------
     * 3. VALIDAR AUCTION ID
     * ---------------------------------------------------------
     */

    if (
      typeof auctionId !== "string" ||
      !auctionId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Leilão inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. VALIDAR VALOR
     * ---------------------------------------------------------
     */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valor de licitação inválido.",
        },
        { status: 400 },
      );
    }

    /*
     * Garantir máximo de 2 casas decimais.
     */

    const roundedAmount =
      Math.round(amount * 100) / 100;

    if (roundedAmount !== amount) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A licitação pode ter no máximo 2 casas decimais.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. EXECUTAR LICITAÇÃO ATÓMICA
     * ---------------------------------------------------------
     *
     * Toda a lógica crítica está agora dentro de
     * public.place_bid_atomic().
     *
     * A função:
     *
     * - bloqueia o leilão;
     * - verifica se existe;
     * - verifica se é um leilão;
     * - impede o proprietário de licitar;
     * - verifica se terminou;
     * - obtém o maior lance;
     * - calcula o mínimo;
     * - valida o novo lance;
     * - grava o lance;
     *
     * Tudo acontece numa única transação.
     */

    const {
      data,
      error: bidError,
    } = await supabaseAdmin.rpc(
      "place_bid_atomic",
      {
        p_auction_id: auctionId,
        p_user_id: user.id,
        p_amount: roundedAmount,
      },
    );

    /*
     * ---------------------------------------------------------
     * 6. TRATAR ERRO DA FUNÇÃO
     * ---------------------------------------------------------
     */

    if (bidError) {
      console.error(
        "PLACE BID RPC ERROR:",
        bidError,
      );

      const message =
        bidError.message ||
        "Não foi possível registar a licitação.";

      /*
       * Erros de validação conhecidos.
       */

      if (
        message.includes(
          "Não podes licitar no teu próprio leilão",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message,
          },
          { status: 403 },
        );
      }

      if (
        message.includes(
          "já terminou",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message,
            ended: true,
          },
          { status: 409 },
        );
      }

      if (
        message.includes(
          "licitação mínima",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message,
          },
          { status: 409 },
        );
      }

      if (
        message.includes(
          "Leilão não encontrado",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message,
          },
          { status: 404 },
        );
      }

      if (
        message.includes(
          "não é um leilão",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. VALIDAR RESULTADO
     * ---------------------------------------------------------
     */

    if (!data || data.length === 0) {
      console.error(
        "PLACE BID RPC: resposta vazia.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "A licitação não foi registada.",
        },
        { status: 500 },
      );
    }

    const result = data[0];

    /*
     * ---------------------------------------------------------
     * 8. SUCESSO
     * ---------------------------------------------------------
     */

    console.log(
      "🏁 NOVA LICITAÇÃO:",
      {
        auctionId,
        userId: user.id,
        amount: Number(result.bid_amount),
      },
    );

    return NextResponse.json({
      success: true,

      bid: {
        id: result.bid_id,
        auctionId: result.auction_id,
        amount: Number(result.bid_amount),
        createdAt: result.bid_created_at,
      },

      currentBid: Number(result.bid_amount),

      minimumNextBid:
        Number(result.minimum_next_bid),

      endTime: result.end_time,
    });
  } catch (error) {
    console.error(
      "PLACE BID ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Erro interno ao registar a licitação.",
      },
      { status: 500 },
    );
  }
}