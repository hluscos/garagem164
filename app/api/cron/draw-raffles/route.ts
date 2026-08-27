import { NextRequest, NextResponse } from "next/server";
import { hasMatchingValue } from "@/lib/pickupConfirmation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { queueTransactionalEmailOnce } from "@/lib/transactionalEmail";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const suppliedSecret = request.headers.get("authorization")?.startsWith("Bearer ")
    ? request.headers.get("authorization")!.replace("Bearer ", "")
    : "";

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado." }, { status: 500 });
  }

  if (!hasMatchingValue(cronSecret, suppliedSecret)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (process.env.RAFFLE_DRAW_ENABLED !== "true") {
    return NextResponse.json({ drawn: 0, skipped: 0, disabled: true });
  }

  const { data: raffles, error: rafflesError } = await supabaseAdmin
    .from("listings")
    .select("id, user_id, brand, model")
    .eq("listing_type", "raffle")
    .limit(100);

  if (rafflesError) {
    return NextResponse.json({ error: "Não foi possível procurar sorteios." }, { status: 500 });
  }

  let drawn = 0;
  let skipped = 0;

  for (const raffle of raffles ?? []) {
    const { data, error } = await supabaseAdmin.rpc("draw_raffle_winner", {
      p_raffle_id: raffle.id,
    });

    if (error || !data?.[0]) {
      skipped += 1;
      continue;
    }

    const result = data[0] as {
      winner_user_id: string;
      winning_ticket_number: number;
      created_new: boolean;
    };

    if (!result.created_new) {
      skipped += 1;
      continue;
    }

    drawn += 1;
    const raffleName = `${raffle.brand || ""} ${raffle.model || "sorteio"}`.trim();

    await queueTransactionalEmailOnce({
      eventKey: `raffle-winner:${raffle.id}:${result.winning_ticket_number}`,
      eventType: "raffle_winner",
      recipientUserId: result.winner_user_id,
      subject: "Ganhaste um sorteio — Garagem164",
      entityType: "raffle",
      entityId: raffle.id,
      heading: "Parabéns, ganhaste!",
      paragraphs: [
        `O teu bilhete nº ${String(result.winning_ticket_number).padStart(2, "0")} foi o vencedor de ${raffleName}.`,
        "Consulta os próximos passos na tua área de sorteios.",
      ],
      action: { label: "Ver sorteios", path: "/account/raffles" },
    });

    await queueTransactionalEmailOnce({
      eventKey: `raffle-drawn:${raffle.id}:seller`,
      eventType: "raffle_drawn",
      recipientUserId: raffle.user_id,
      subject: "O teu sorteio já tem vencedor — Garagem164",
      entityType: "raffle",
      entityId: raffle.id,
      heading: "Sorteio concluído",
      paragraphs: [
        `${raffleName} foi concluído e o vencedor foi registado de forma auditável.`,
        "Prepara a entrega do prémio de acordo com as regras do sorteio.",
      ],
      action: { label: "Ver anúncio", path: `/raffles/${raffle.id}` },
    });
  }

  return NextResponse.json({ drawn, skipped, disabled: false });
}
