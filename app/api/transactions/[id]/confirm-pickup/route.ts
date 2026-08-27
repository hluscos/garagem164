import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasMatchingConfirmationCode } from "@/lib/pickupConfirmation";
import { queueTransactionalEmailOnce } from "@/lib/transactionalEmail";

export async function POST(
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

  const body = await request.json();
  const confirmationCode =
    typeof body?.confirmationCode === "string"
      ? body.confirmationCode.trim()
      : "";

  if (!/^\d{6}$/.test(confirmationCode)) {
    return NextResponse.json({ error: "Indica o código de seis dígitos." }, { status: 400 });
  }

  const { id } = await params;
  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("id, buyer_id, seller_id, delivery_method, commercial_status, financial_status")
    .eq("id", id)
    .maybeSingle();

  if (transactionError) {
    return NextResponse.json({ error: "Não foi possível verificar a venda." }, { status: 500 });
  }

  if (!transaction || transaction.seller_id !== user.id) {
    return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  }

  if (
    transaction.delivery_method !== "pickup" ||
    !["paid", "awaiting_shipment"].includes(transaction.commercial_status) ||
    transaction.financial_status !== "held"
  ) {
    return NextResponse.json(
      { error: "A entrega em mão ainda não pode ser confirmada." },
      { status: 409 },
    );
  }

  const { data: pickupCode, error: pickupCodeError } = await supabaseAdmin
    .from("transaction_pickup_codes")
    .select("confirmation_code, failed_attempts, last_attempt_at")
    .eq("transaction_id", id)
    .eq("buyer_id", transaction.buyer_id)
    .maybeSingle();

  if (pickupCodeError || !pickupCode) {
    return NextResponse.json({ error: "Não foi possível validar o código." }, { status: 409 });
  }

  const latestAttempt = pickupCode.last_attempt_at
    ? new Date(pickupCode.last_attempt_at).getTime()
    : 0;
  const retryBlocked = pickupCode.failed_attempts >= 5
    && latestAttempt > Date.now() - 15 * 60 * 1000;

  if (retryBlocked) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Aguarda 15 minutos antes de voltares a tentar." },
      { status: 429 },
    );
  }

  if (!hasMatchingConfirmationCode(pickupCode.confirmation_code, confirmationCode)) {
    await supabaseAdmin
      .from("transaction_pickup_codes")
      .update({
        failed_attempts: pickupCode.failed_attempts + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", id);

    return NextResponse.json({ error: "O código de confirmação não corresponde." }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin.rpc(
    "confirm_transaction_delivery",
    {
      p_transaction_id: id,
      p_confirmation_method: "pickup_code",
    },
  );

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível confirmar a entrega em mão." },
      { status: 409 },
    );
  }

  await supabaseAdmin
    .from("transaction_pickup_codes")
    .update({
      used_at: new Date().toISOString(),
      failed_attempts: 0,
      last_attempt_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("transaction_id", id);

  await queueTransactionalEmailOnce({
    eventKey: `delivery-confirmed:${id}:pickup_code`,
    eventType: "delivery_confirmed",
    recipientUserId: transaction.buyer_id,
    subject: "A entrega em mão foi confirmada — Garagem164",
    entityType: "transaction",
    entityId: id,
    heading: "Entrega em mão confirmada",
    paragraphs: [
      "A entrega foi confirmada com o teu código de seis dígitos.",
      "Se existir algum problema, contacta o apoio Garagem164 de imediato.",
    ],
    action: { label: "Ver compra", path: "/account/purchases" },
  });

  return NextResponse.json({ success: true, transaction: data?.[0] ?? null });
}
