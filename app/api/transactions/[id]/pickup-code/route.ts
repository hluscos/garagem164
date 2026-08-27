import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
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
  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("id, buyer_id, delivery_method, commercial_status, financial_status")
    .eq("id", id)
    .maybeSingle();

  if (transactionError) {
    return NextResponse.json({ error: "Não foi possível verificar a compra." }, { status: 500 });
  }

  if (!transaction || transaction.buyer_id !== user.id) {
    return NextResponse.json({ error: "Compra não encontrada." }, { status: 404 });
  }

  if (
    transaction.delivery_method !== "pickup" ||
    !["paid", "awaiting_shipment"].includes(transaction.commercial_status) ||
    transaction.financial_status !== "held"
  ) {
    return NextResponse.json(
      { error: "O código de entrega não está disponível." },
      { status: 409 },
    );
  }

  const { data: pickupCode, error: pickupCodeError } = await supabaseAdmin
    .from("transaction_pickup_codes")
    .select("confirmation_code")
    .eq("transaction_id", id)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (pickupCodeError) {
    return NextResponse.json({ error: "Não foi possível obter o código." }, { status: 500 });
  }

  if (!pickupCode) {
    return NextResponse.json(
      { error: "O código de entrega ainda está a ser preparado." },
      { status: 409 },
    );
  }

  return NextResponse.json({ code: pickupCode.confirmation_code });
}
