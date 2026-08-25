import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function requestComesFromThisSite(request: NextRequest) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost || request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!requestComesFromThisSite(request)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return NextResponse.json({ error: "Pedido demasiado grande." }, { status: 413 });
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const consent = body.consent === true;
    const website = typeof body.website === "string" ? body.website.trim() : "";

    // Campo invisível preenchido apenas por robôs. A resposta neutra evita novas tentativas.
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Indica um endereço de email válido." },
        { status: 400 },
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "É necessário aceitar a subscrição da newsletter." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email,
        status: "active",
        source: "footer",
        consented_at: now,
        unsubscribed_at: null,
        unsubscribe_token: crypto.randomUUID(),
        updated_at: now,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("Erro ao guardar subscrição da newsletter:", error.code);
      return NextResponse.json(
        { error: "Não foi possível concluir a subscrição." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscrição efetuada com sucesso." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
}
