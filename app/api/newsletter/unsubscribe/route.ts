import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!UUID_PATTERN.test(token)) {
      return NextResponse.json({ error: "Ligação de cancelamento inválida." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: now,
        updated_at: now,
      })
      .eq("unsubscribe_token", token)
      .eq("status", "active");

    if (error) {
      console.error("Erro ao cancelar subscrição da newsletter:", error.code);
      return NextResponse.json(
        { error: "Não foi possível cancelar a subscrição." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "A subscrição foi cancelada." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
}
