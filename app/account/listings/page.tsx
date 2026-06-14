"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyListingsPage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  async function deleteListing(id: string) {
    const confirmed = window.confirm(
      "Tem a certeza que pretende eliminar este anúncio?"
    );

    if (!confirmed) return;

   const {
  data: { session },
} = await supabase.auth.getSession();

const { error } = await supabase
  .from("listings")
  .delete()
  .eq("id", id)
  .eq("user_id", session?.user.id);

    if (error) {
  console.error(error);
  alert(error.message);
  return;
}

console.log("DELETE OK");

    setListings((current) =>
      current.filter((listing) => listing.id !== id)
    );
  }

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

              <div className="mt-4 flex gap-3">
  <a
    href={`/listing/${listing.id}`}
    className="inline-flex items-center justify-center h-[44px] px-5 rounded-xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-sm font-black uppercase"
  >
    Ver Anúncio
  </a>

  <a
    href={`/account/listings/${listing.id}/edit`}
    className="inline-flex items-center justify-center h-[44px] px-5 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-sm font-black uppercase"
  >
    Editar
  </a>

  <button
    onClick={() => deleteListing(listing.id)}
    className="inline-flex items-center justify-center h-[44px] px-5 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-black uppercase"
  >
    Eliminar
  </button>
</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}