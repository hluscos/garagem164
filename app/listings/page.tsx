"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: string;
  brand: string;
  model: string;
  category: string | null;
  condition: string | null;
  listing_type: string;
  price: number | null;
  description: string | null;
  created_at: string;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images (
            image_url,
            sort_order
          )
        `)
        .eq("listing_type", "sale")
        .eq("sale_status", "available")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("LISTINGS ERROR:", error);
        setListings([]);
        setLoading(false);
        return;
      }

      setListings(data || []);
      setLoading(false);
    }

    void loadListings();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="mx-auto max-w-[1480px] px-6 py-16 lg:px-12 lg:py-20">

          <div className="text-[12px] font-black uppercase tracking-[3px] text-[#ffb800]">
            Garagem164
          </div>

          <h1 className="mt-5 text-[64px] font-black italic uppercase leading-none tracking-[-4px] sm:text-[76px] lg:text-[82px]">
            Anúncios
          </h1>

          <p className="mt-6 max-w-[700px] text-[17px] leading-relaxed text-zinc-400 lg:text-[18px]">
            Compra miniaturas 1:64 directamente a coleccionadores
            da comunidade Garagem164.
          </p>

        </div>

      </section>

      {/* LISTINGS */}

      <section className="mx-auto max-w-[1480px] px-6 py-12 lg:px-12 lg:py-16">

        {loading ? (

          <div className="py-20 text-center text-zinc-500">
            A carregar anúncios...
          </div>

        ) : listings.length === 0 ? (

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 px-8 py-20 text-center">

            <div className="text-[12px] font-black uppercase tracking-[3px] text-[#ffb800]">
              Garagem164
            </div>

            <h2 className="mt-4 text-3xl font-black uppercase">
              Ainda não existem anúncios
            </h2>

            <p className="mx-auto mt-4 max-w-[500px] text-zinc-500">
              As primeiras miniaturas colocadas à venda
              aparecerão aqui.
            </p>

            <Link
              href="/submit-listing"
              className="mt-8 inline-flex h-[54px] items-center justify-center rounded-2xl bg-[#ffb800] px-8 text-[13px] font-black uppercase tracking-[1px] text-black transition hover:bg-[#ffc933]"
            >
              Vender uma miniatura
            </Link>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {listings.map((listing) => {

              const images = [...(listing.listing_images || [])].sort(
                (a, b) =>
                  (a.sort_order ?? 0) - (b.sort_order ?? 0),
              );

              const image = images[0]?.image_url;

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group overflow-hidden rounded-[28px] border border-white/5 bg-zinc-950 transition-all duration-500 hover:-translate-y-1 hover:border-[#ffb800]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                >

                  {/* IMAGE */}

                  <div className="relative aspect-square overflow-hidden bg-zinc-900">

                    {image ? (

                      <img
                        src={image}
                        alt={`${listing.brand} ${listing.model}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-[2px] text-zinc-700">
                        Sem imagem
                      </div>

                    )}

                    <div className="absolute left-4 top-4 rounded-xl border border-[#ffb800]/30 bg-black/80 px-3 py-2 text-[10px] font-black uppercase tracking-[1.5px] text-[#ffb800] backdrop-blur-md">
                      Comprar
                    </div>

                  </div>

                  {/* INFO */}

                  <div className="p-6">

                    <div className="text-[10px] font-black uppercase tracking-[2px] text-zinc-500">
                      {listing.brand}
                    </div>

                    <h2 className="mt-2 line-clamp-2 min-h-[52px] text-[20px] font-black leading-tight">
                      {listing.model}
                    </h2>

                    {listing.condition && (
                      <div className="mt-3 text-[11px] font-bold uppercase tracking-[1px] text-zinc-600">
                        {listing.condition}
                      </div>
                    )}

                    <div className="mt-6 flex items-end justify-between gap-4">

                      <div>

                        <div className="text-[10px] font-black uppercase tracking-[1.5px] text-zinc-600">
                          Preço
                        </div>

                        <div className="mt-1 text-[25px] font-black text-[#ffb800]">
                          {listing.price !== null
                            ? `${Number(listing.price).toFixed(2).replace(".", ",")} €`
                            : "—"}
                        </div>

                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg text-zinc-500 transition group-hover:border-[#ffb800]/40 group-hover:text-[#ffb800]">
                        →
                      </div>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}
