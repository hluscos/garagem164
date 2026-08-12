import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          paid: false,
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
      return NextResponse.json(
        {
          paid: false,
          message: "Sessão inválida.",
        },
        { status: 401 },
      );
    }

    const auctionId =
      req.nextUrl.searchParams.get("auctionId");

    if (!auctionId) {
      return NextResponse.json(
        {
          paid: false,
          message: "Leilão inválido.",
        },
        { status: 400 },
      );
    }

    const { data: payment, error: paymentError } =
      await supabaseAdmin
        .from("stripe_payments")
        .select("id, status")
        .eq("auction_id", auctionId)
        .eq("user_id", user.id)
        .eq("status", "paid")
        .maybeSingle();

    if (paymentError) {
      console.error(
        "AUCTION PAYMENT STATUS ERROR:",
        paymentError,
      );

      return NextResponse.json(
        {
          paid: false,
          message: "Não foi possível verificar o pagamento.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      paid: Boolean(payment),
    });
  } catch (error) {
    console.error(
      "AUCTION PAYMENT STATUS ROUTE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        paid: false,
        message: "Erro interno.",
      },
      { status: 500 },
    );
  }
}