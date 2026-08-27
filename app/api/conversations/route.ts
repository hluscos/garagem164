import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(
    authorization.replace("Bearer ", "").trim(),
  );

  return error ? null : user;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Utilizador não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const listingId = typeof body?.listingId === "string" ? body.listingId : "";

  if (!listingId) {
    return NextResponse.json({ error: "Anúncio inválido." }, { status: 400 });
  }

  const { data: listing, error: listingError } = await supabaseAdmin
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
  }

  if (listing.user_id === user.id) {
    return NextResponse.json({ error: "Não podes iniciar uma conversa contigo." }, { status: 409 });
  }

  const filters = () => supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("buyer_id", user.id)
    .eq("seller_id", listing.user_id)
    .maybeSingle();

  const { data: existing, error: existingError } = await filters();

  if (existingError) {
    return NextResponse.json({ error: "Não foi possível iniciar a conversa." }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const { data: conversation, error: createError } = await supabaseAdmin
    .from("conversations")
    .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.user_id })
    .select("id")
    .single();

  if (createError) {
    // A second tab can create the same thread first; return that thread instead.
    const { data: concurrent } = await filters();

    if (concurrent) {
      return NextResponse.json({ conversationId: concurrent.id });
    }

    return NextResponse.json({ error: "Não foi possível iniciar a conversa." }, { status: 500 });
  }

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
