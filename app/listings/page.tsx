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
  const [activeBrand, setActiveBrand] = useState("Todos");

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
      const requestedBrand = new URLSearchParams(
        window.location.search,
      ).get("brand")?.trim();

      if (requestedBrand) {
        setActiveBrand(requestedBrand);
      }
      setLoading(false);
    }

    void loadListings();
  }, []);

  const brands = [
    "Todos",
    ...Array.from(
      new Set(
        listings
          .map((listing) => listing.brand.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "pt")),
  ];

  const filteredListings =
    activeBrand === "Todos"
      ? listings
      : listings.filter(
          (listing) => listing.brand.trim() === activeBrand,
        );

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="relative h-[340px] overflow-hidden border-b border-white/5">

        <div className="absolute inset-0">
          <img
            src="/images/hero/backgrounds/listings-bg.webp"
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-[1480px] flex-col justify-center px-6 lg:px-12">

          <div className="text-[12px] font-black uppercase tracking-[3px] text-[#ffb800]">
            Garagem164
          </div>

          <h1 className="mt-4 text-[58px] font-black italic uppercase leading-none tracking-[-4px] sm:text-[64px] lg:text-[68px]">
            Anúncios
          </h1>

          <p className="mt-5 max-w-[700px] text-[17px] leading-relaxed text-zinc-300 lg:text-[18px]">
            Compra miniaturas 1:64 directamente a coleccionadores
            da comunidade Garagem164.
          </p>

        </div>

      </section>

      {/* SUPPLIER FILTER */}

      <section className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:px-12">
          <div className="shrink-0 text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
            Filtrar por fornecedor
          </div>

          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 lg:pb-0">
            {brands.map((brand) => {
              const selected = brand === activeBrand;

              return (
                <button
                  key={brand}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveBrand(brand)}
                  className={`h-[44px] whitespace-nowrap rounded-2xl border px-5 text-[12px] font-black uppercase tracking-[1px] transition-all duration-300 ${
                    selected
                      ? "border-[#ffb800] bg-[#ffb800] text-black"
                      : "border-white/10 bg-black text-white hover:border-[#ffb800] hover:text-[#ffb800]"
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {!loading && listings.length > 0 && (
            <div className="shrink-0 text-[11px] font-bold uppercase tracking-[1px] text-zinc-600 lg:ml-auto">
              {filteredListings.length}{" "}
              {filteredListings.length === 1 ? "anúncio" : "anúncios"}
            </div>
          )}
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

        ) : filteredListings.length === 0 ? (

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 px-8 py-16 text-center">
            <h2 className="text-2xl font-black uppercase">
              Não existem anúncios de {activeBrand}
            </h2>
            <p className="mt-3 text-zinc-500">
              Seleciona outro fornecedor para veres os anúncios disponíveis.
            </p>
          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredListings.map((listing) => {

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
