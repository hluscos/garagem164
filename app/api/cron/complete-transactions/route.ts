import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasMatchingValue } from "@/lib/pickupConfirmation";
import { flushTransactionalEmailOutbox } from "@/lib/transactionalEmail";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const suppliedSecret = authorization?.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : "";

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET não configurado." },
      { status: 500 },
    );
  }

  if (!hasMatchingValue(cronSecret, suppliedSecret)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { data: transactions, error: queryError } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("delivery_method", "shipping")
    .eq("commercial_status", "shipped")
    .eq("financial_status", "held")
    .lte("auto_confirm_at", new Date().toISOString())
    .limit(100);

  if (queryError) {
    return NextResponse.json(
      { error: "Não foi possível procurar transações elegíveis." },
      { status: 500 },
    );
  }

  let completed = 0;
  let skipped = 0;

  for (const transaction of transactions ?? []) {
    const { error } = await supabaseAdmin.rpc(
      "confirm_transaction_delivery",
      {
        p_transaction_id: transaction.id,
        p_confirmation_method: "automatic_timeout",
      },
    );

    if (error) {
      skipped += 1;
    } else {
      completed += 1;
    }
  }

  const emailOutbox = await flushTransactionalEmailOutbox();

  return NextResponse.json({ completed, skipped, emailOutbox });
}
