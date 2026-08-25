"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ListingImage {
  image_url: string;
  sort_order: number | null;
}

interface Listing {
  id: string;
  brand: string | null;
  model: string | null;
  listing_type: string;
  listing_images: ListingImage[] | null;
}

export default function MyListingsPage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);

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
        .select(
          `
            id,
            brand,
            model,
            listing_type,
            listing_images (
              image_url,
              sort_order
            )
          `,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setListings((data || []) as Listing[]);
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

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {listings.map((listing) => {
            const image = [...(listing.listing_images || [])].sort(
              (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
            )[0]?.image_url;

            return (
              <article
                key={listing.id}
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:flex-row"
              >
                <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 sm:h-28 sm:w-28">
                  {image ? (
                    <img
                      src={image}
                      alt={listing.model || "Anúncio"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl opacity-30">🚗</span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#ffb800]">
                    {listing.brand || "Garagem164"}
                  </div>

                  <h2 className="mt-1 truncate text-xl font-black">
                    {listing.model || "Sem modelo"}
                  </h2>

                  <div className="mt-1 text-xs uppercase tracking-[1px] text-zinc-500">
                    {listing.listing_type}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <a
                      href={`/listing/${listing.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#ffb800] px-4 text-xs font-black uppercase text-black transition-all duration-300 hover:bg-[#ffc933]"
                    >
                      Ver anúncio
                    </a>

                    <a
                      href={`/account/listings/${listing.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-white/20 px-4 text-xs font-black uppercase transition-all duration-300 hover:border-white/40"
                    >
                      Editar
                    </a>

                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-500 px-4 text-xs font-black uppercase text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
