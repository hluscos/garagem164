"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type Profile = { id: string; display_name: string | null };
type Listing = { id: string; brand: string | null; model: string | null };

function MessagesScreen() {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversation");
  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [listings, setListings] = useState<Record<string, Listing>>({});
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const loadConversations = async (currentUserId?: string) => {
    const activeUserId = currentUserId || userId;
    if (!activeUserId) return;

    const { data, error: conversationsError } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, updated_at")
      .or(`buyer_id.eq.${activeUserId},seller_id.eq.${activeUserId}`)
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      setError("Não foi possível carregar as conversas.");
      return;
    }

    const nextConversations = (data ?? []) as Conversation[];
    setConversations(nextConversations);

    const listingIds = [...new Set(nextConversations.map((conversation) => conversation.listing_id))];
    const counterpartIds = [...new Set(nextConversations.map((conversation) =>
      conversation.buyer_id === activeUserId ? conversation.seller_id : conversation.buyer_id,
    ))];

    const [listingResult, profileResult] = await Promise.all([
      listingIds.length
        ? supabase.from("listings").select("id, brand, model").in("id", listingIds)
        : Promise.resolve({ data: [] as Listing[] }),
      counterpartIds.length
        ? supabase.from("profiles").select("id, display_name").in("id", counterpartIds)
        : Promise.resolve({ data: [] as Profile[] }),
    ]);

    setListings(Object.fromEntries((listingResult.data ?? []).map((listing) => [listing.id, listing])));
    setProfiles(Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])));

    setSelectedConversationId((current) => {
      if (current && nextConversations.some((conversation) => conversation.id === current)) return current;
      if (requestedConversationId && nextConversations.some((conversation) => conversation.id === requestedConversationId)) {
        return requestedConversationId;
      }
      return nextConversations[0]?.id ?? "";
    });
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      if (!active) return;
      setUserId(session.user.id);
      await loadConversations(session.user.id);
      if (active) setLoading(false);
    };

    void load();
    return () => { active = false; };
    // loadConversations deliberately runs only when the page starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedConversationId || !userId) {
      return;
    }

    let active = true;
    const markRead = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/conversations/${selectedConversationId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    };
    const loadMessages = async () => {
      const { data, error: messagesError } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at, read_at")
        .eq("conversation_id", selectedConversationId)
        .order("created_at", { ascending: true });

      if (!active) return;
      if (messagesError) {
        setError("Não foi possível carregar as mensagens.");
        return;
      }

      setMessages((data ?? []) as Message[]);
      void markRead();
    };

    void loadMessages();
    const channel = supabase
      .channel(`conversation-${selectedConversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversationId}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming]);
          if (incoming.sender_id !== userId) void markRead();
          void loadConversations();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  // loadConversations is deliberately used as a refresh callback here; adding
  // it would resubscribe whenever its page-level closure is recreated.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, userId]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedConversationId || sending) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSending(true);
    setError("");
    const response = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ message: text }),
    });
    const result = await response.json();

    if (!response.ok || !result.message) {
      setError(result.error || "Não foi possível enviar a mensagem.");
      setSending(false);
      return;
    }

    setMessages((current) => current.some((message) => message.id === result.message.id) ? current : [...current, result.message]);
    setDraft("");
    setSending(false);
    void loadConversations();
  };

  if (loading) {
    return <main className="min-h-screen bg-black px-6 pt-36 text-white">A carregar mensagens...</main>;
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link href="/account" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-zinc-400 transition hover:text-[#ffb800]">
          <ArrowLeft size={16} /> Voltar à conta
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <Mail className="text-[#ffb800]" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[3px] text-[#ffb800]">Conversas privadas</p>
            <h1 className="text-4xl font-black">Mensagens</h1>
          </div>
        </div>

        {error && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-white/10 lg:border-b-0 lg:border-r">
            {conversations.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">Ainda não tens conversas. Podes iniciar uma num anúncio.</p>
            ) : conversations.map((conversation) => {
              const counterpartId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
              const listing = listings[conversation.listing_id];
              const counterpart = profiles[counterpartId];
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full border-b border-white/5 p-5 text-left transition ${selectedConversationId === conversation.id ? "bg-[#ffb800]/10" : "hover:bg-white/5"}`}
                >
                  <p className="truncate text-sm font-black">{counterpart?.display_name || "Utilizador Garagem164"}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{listing ? `${listing.brand || ""} ${listing.model || "Anúncio"}`.trim() : "Anúncio"}</p>
                </button>
              );
            })}
          </aside>

          <section className="flex min-h-[480px] flex-col">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-zinc-500">Escolhe uma conversa para começar.</div>
            ) : (
              <>
                <div className="border-b border-white/10 px-6 py-5">
                  <p className="font-black">{profiles[selectedConversation.buyer_id === userId ? selectedConversation.seller_id : selectedConversation.buyer_id]?.display_name || "Utilizador Garagem164"}</p>
                  <p className="mt-1 text-xs text-zinc-500">Conversa associada ao anúncio</p>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === userId ? "self-end bg-[#ffb800] text-black" : "self-start bg-white/10 text-zinc-100"}`}>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p className={`mt-1 text-[10px] ${message.sender_id === userId ? "text-black/60" : "text-zinc-500"}`}>{new Date(message.created_at).toLocaleString("pt-PT")}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-3 border-t border-white/10 p-4">
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder="Escreve uma mensagem..." className="min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-black p-3 text-sm outline-none focus:border-[#ffb800]" />
                  <button type="submit" disabled={!draft.trim() || sending} className="flex h-12 self-end items-center gap-2 rounded-xl bg-[#ffb800] px-4 text-xs font-black uppercase text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
                    <Send size={16} /> {sending ? "..." : "Enviar"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<main className="min-h-screen bg-black px-6 pt-36 text-white">A carregar mensagens...</main>}><MessagesScreen /></Suspense>;
}
