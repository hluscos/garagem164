import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(
    authorization.replace("Bearer ", "").trim(),
  );

  return error ? null : user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Utilizador não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message || message.length > 2000) {
    return NextResponse.json(
      { error: "A mensagem deve ter entre 1 e 2000 caracteres." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (
    conversationError ||
    !conversation ||
    ![conversation.buyer_id, conversation.seller_id].includes(user.id)
  ) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("messages")
    .insert({ conversation_id: id, sender_id: user.id, body: message })
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .single();

  if (createError) {
    return NextResponse.json({ error: "Não foi possível enviar a mensagem." }, { status: 500 });
  }

  return NextResponse.json({ message: created }, { status: 201 });
}
