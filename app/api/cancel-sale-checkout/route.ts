import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Utilizador não autenticado." },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 },
      );
    }

    const { transactionId } = await req.json();

    if (typeof transactionId !== "string" || !transactionId) {
      return NextResponse.json(
        { error: "Transação inválida." },
        { status: 400 },
      );
    }

    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("transactions")
        .select(
          "id, buyer_id, commercial_status, financial_status, stripe_checkout_session",
        )
        .eq("id", transactionId)
        .maybeSingle();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada." },
        { status: 404 },
      );
    }

    if (transaction.buyer_id !== user.id) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 },
      );
    }

    if (
      transaction.commercial_status !== "pending_payment" ||
      transaction.financial_status !== "unpaid"
    ) {
      return NextResponse.json({ cancelled: false });
    }

    if (transaction.stripe_checkout_session) {
      const session = await stripe.checkout.sessions.retrieve(
        transaction.stripe_checkout_session,
      );

      if (session.status === "open") {
        await stripe.checkout.sessions.expire(session.id);
      }

      if (session.status === "complete") {
        return NextResponse.json(
          { error: "O pagamento já foi concluído." },
          { status: 409 },
        );
      }
    }

    const { error: cancelError } = await supabaseAdmin
      .from("transactions")
      .update({
        commercial_status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)
      .eq("commercial_status", "pending_payment")
      .eq("financial_status", "unpaid");

    if (cancelError) {
      throw cancelError;
    }

    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error("CANCEL SALE CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Não foi possível cancelar a reserva." },
      { status: 500 },
    );
  }
}