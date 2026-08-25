import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Utilizador não autenticado." }, { status: 401 });
  }

  const accessToken = authorization.replace("Bearer ", "").trim();
  const { data: { user }, error: userError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const carrier = typeof body.carrier === "string" ? body.carrier.trim() : "";
  const trackingCode =
    typeof body.trackingCode === "string" ? body.trackingCode.trim() : "";

  if (!carrier || carrier.length > 80) {
    return NextResponse.json(
      { error: "Indica uma transportadora válida." },
      { status: 400 },
    );
  }

  if (!trackingCode || trackingCode.length > 120) {
    return NextResponse.json(
      { error: "Indica um código de rastreio válido." },
      { status: 400 },
    );
  }

  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("id, seller_id, delivery_method, commercial_status, financial_status")
    .eq("id", id)
    .maybeSingle();

  if (transactionError) {
    return NextResponse.json(
      { error: "Não foi possível verificar a venda." },
      { status: 500 },
    );
  }

  if (!transaction || transaction.seller_id !== user.id) {
    return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  }

  if (transaction.delivery_method !== "shipping") {
    return NextResponse.json(
      { error: "Esta venda foi definida para entrega em mão." },
      { status: 409 },
    );
  }

  const canRegisterShipment =
    ["paid", "awaiting_shipment"].includes(transaction.commercial_status) &&
    transaction.financial_status === "held";
  const canCorrectTracking =
    transaction.commercial_status === "shipped" &&
    transaction.financial_status === "held";

  if (!canRegisterShipment && !canCorrectTracking) {
    return NextResponse.json(
      { error: "O envio ainda não pode ser registado nesta venda." },
      { status: 409 },
    );
  }

  const { data: updated, error: updateError } = canRegisterShipment
    ? await supabaseAdmin.rpc("mark_transaction_shipped", {
        p_transaction_id: id,
        p_carrier: carrier,
        p_tracking_number: trackingCode,
      })
    : await supabaseAdmin
        .from("transaction_shipping")
        .update({
          carrier,
          tracking_number: trackingCode,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", id)
        .select("transaction_id")
        .maybeSingle();

  if (updateError) {
    return NextResponse.json(
      { error: "Não foi possível guardar o rastreio." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    transaction: Array.isArray(updated) ? updated[0] : updated,
    shipping: { carrier, trackingCode },
  });
}
