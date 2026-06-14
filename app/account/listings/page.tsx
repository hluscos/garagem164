"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyListingsPage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function loadListings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setListings(data || []);
      setLoading(false);
    }

    loadListings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        A carregar anúncios...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <h1 className="text-[64px] font-black italic uppercase tracking-[-3px]">
          Meus Anúncios
        </h1>

        <p className="mt-4 text-zinc-400">
          Gestão dos anúncios publicados.
        </p>

        <div className="mt-10 space-y-4">

          {listings.map((listing) => (
  <div
    key={listing.id}
    className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
  >
    <div className="text-2xl font-black">
      {listing.model}
    </div>

    <div className="mt-2 text-zinc-400">
      {listing.listing_type}
    </div>

    <a
      href={`/listing/${listing.id}`}
      className="mt-4 inline-flex items-center justify-center h-[44px] px-5 rounded-xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-sm font-black uppercase"
    >
      Ver Anúncio
    </a>
  </div>
))}

        </div>

      </section>
    </main>
  );
}