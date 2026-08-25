"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FavoriteRecord {
  listing_id: string;
  created_at: string;
}

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

interface FavoriteItem extends Listing {
  favoritedAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: favoriteData, error: favoriteError } = await supabase
        .from("favorites")
        .select("listing_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (favoriteError) {
        console.error("FAVORITES LOAD ERROR:", favoriteError);
        setLoading(false);
        return;
      }

      const favoriteRecords = (favoriteData || []) as FavoriteRecord[];
      const listingIds = favoriteRecords.map((item) => item.listing_id);

      if (listingIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: listingData, error: listingError } = await supabase
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
        .in("id", listingIds);

      if (listingError) {
        console.error("FAVORITE LISTINGS LOAD ERROR:", listingError);
        setLoading(false);
        return;
      }

      const listings = (listingData || []) as Listing[];

      setFavorites(
        favoriteRecords.flatMap((favorite) => {
          const listing = listings.find(
            (item) => item.id === favorite.listing_id,
          );

          return listing
            ? [{ ...listing, favoritedAt: favorite.created_at }]
            : [];
        }),
      );
      setLoading(false);
    }

    void loadFavorites();
  }, []);

  async function removeFavorite(listingId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", session.user.id)
      .eq("listing_id", listingId);

    if (error) {
      console.error("FAVORITE DELETE ERROR:", error);
      return;
    }

    setFavorites((current) =>
      current.filter((item) => item.id !== listingId),
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
        <div className="w-full max-w-[1050px] text-zinc-500">A carregar...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="w-full max-w-[1050px]">
        <div className="text-[11px] font-bold uppercase tracking-[4px] text-[#ffb800]">
          Coleção guardada
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight">
          Os Meus Favoritos
        </h1>

        <p className="mt-2 text-zinc-400">
          Consulta os anúncios que guardaste para veres mais tarde.
        </p>

        {favorites.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Heart size={28} className="text-zinc-600" />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Ainda não tens favoritos
            </h2>

            <p className="mx-auto mt-2 max-w-md text-zinc-500">
              Guarda os anúncios de que mais gostas para os encontrares aqui.
            </p>

            <Link
              href="/listings"
              className="mt-7 inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[#ffb800] px-6 text-sm font-black text-black transition-all duration-300 hover:bg-[#ffd34d]"
            >
              Ver anúncios
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {favorites.map((favorite) => {
              const image = [...(favorite.listing_images || [])].sort(
                (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
              )[0]?.image_url;

              return (
                <article
                  key={favorite.id}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:flex-row"
                >
                  <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 sm:h-24 sm:w-24">
                    {image ? (
                      <img
                        src={image}
                        alt={favorite.model || "Anúncio"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl opacity-30">🚗</span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#ffb800]">
                      {favorite.brand || "Garagem164"}
                    </div>

                    <h2 className="mt-1 truncate text-xl font-black">
                      {favorite.model || "Sem modelo"}
                    </h2>

                    <div className="mt-1 text-xs uppercase tracking-[1px] text-zinc-500">
                      {favorite.listing_type}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <Link
                        href={`/listing/${favorite.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#ffb800] px-4 text-xs font-black uppercase text-black transition hover:bg-[#ffc933]"
                      >
                        Ver anúncio
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeFavorite(favorite.id)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/60 px-3 text-xs font-black uppercase text-red-400 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
