import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

  const { id } = await params;
  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("id, buyer_id, seller_id, delivery_method, commercial_status, financial_status")
    .eq("id", id)
    .maybeSingle();

  if (transactionError) {
    return NextResponse.json({ error: "Não foi possível verificar a compra." }, { status: 500 });
  }

  if (!transaction || transaction.buyer_id !== user.id) {
    return NextResponse.json({ error: "Compra não encontrada." }, { status: 404 });
  }

  if (
    transaction.delivery_method !== "shipping" ||
    transaction.commercial_status !== "shipped" ||
    transaction.financial_status !== "held"
  ) {
    return NextResponse.json(
      { error: "A receção ainda não pode ser confirmada nesta compra." },
      { status: 409 },
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "confirm_transaction_delivery",
    {
      p_transaction_id: id,
      p_confirmation_method: "buyer_receipt",
    },
  );

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível confirmar a receção." },
      { status: 409 },
    );
  }

  await queueTransactionalEmailOnce({
    eventKey: `delivery-confirmed:${id}:buyer_receipt`,
    eventType: "delivery_confirmed",
    recipientUserId: transaction.seller_id,
    subject: "O comprador confirmou a receção — Garagem164",
    entityType: "transaction",
    entityId: id,
    heading: "Receção confirmada",
    paragraphs: [
      "O comprador confirmou que recebeu a encomenda.",
      "O pagamento já está disponível para levantamento na área das tuas vendas.",
    ],
    action: { label: "Ver venda", path: "/account/sales" },
  });

  return NextResponse.json({ success: true, transaction: data?.[0] ?? null });
}
