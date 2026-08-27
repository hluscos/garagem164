import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Utilizador não autenticado." }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
    authorization.replace("Bearer ", "").trim(),
  );

  if (userError || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { id } = await params;
  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (
    conversationError ||
    !conversation ||
    ![conversation.buyer_id, conversation.seller_id].includes(user.id)
  ) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  const { error: readError } = await supabaseAdmin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (readError) {
    return NextResponse.json({ error: "Não foi possível atualizar as mensagens." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
