"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, PackageCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SellerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type SellerListing = {
  id: string;
  brand: string | null;
  model: string | null;
  listing_type: "sale" | "auction" | "raffle";
  price: number | null;
  starting_bid: number | null;
  ticket_price: number | null;
  sale_status: string | null;
  duration_days: number | null;
  created_at: string;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

function formatMemberSince(createdAt: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt));
}

function getListingLink(listing: SellerListing) {
  if (listing.listing_type === "auction") {
    return `/auctions/${listing.id}`;
  }

  if (listing.listing_type === "raffle") {
    return `/raffles/${listing.id}`;
  }

  return `/listing/${listing.id}`;
}

function getListingType(listingType: SellerListing["listing_type"]) {
  if (listingType === "auction") {
    return "Leilão";
  }

  if (listingType === "raffle") {
    return "Sorteio";
  }

  return "Venda";
}

function getListingPrice(listing: SellerListing) {
  const value =
    listing.listing_type === "auction"
      ? listing.starting_bid
      : listing.listing_type === "raffle"
        ? listing.ticket_price
        : listing.price;

  if (value === null) {
    return "—";
  }

  return `${Number(value).toFixed(2).replace(".", ",")} €`;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [completedSales, setCompletedSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSellerProfile() {
      if (!sellerId) {
        return;
      }

      setLoading(true);
      setError("");

      const [profileResult, listingsResult, salesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, created_at")
          .eq("id", sellerId)
          .maybeSingle(),
        supabase
          .from("listings")
          .select(`
            id,
            brand,
            model,
            listing_type,
            price,
            starting_bid,
            ticket_price,
            sale_status,
            duration_days,
            created_at,
            listing_images (
              image_url,
              sort_order
            )
          `)
          .eq("user_id", sellerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", sellerId)
          .eq("listing_type", "sale")
          .eq("sale_status", "sold"),
      ]);

      if (profileResult.error || !profileResult.data) {
        console.error("PUBLIC PROFILE ERROR:", profileResult.error);
        setError("Este perfil não está disponível.");
        setLoading(false);
        return;
      }

      if (listingsResult.error) {
        console.error("SELLER LISTINGS ERROR:", listingsResult.error);
      }

      if (salesResult.error) {
        console.error("SELLER SALES ERROR:", salesResult.error);
      }

      const now = Date.now();
      const visibleListings = ((listingsResult.data ?? []) as SellerListing[])
        .filter((listing) => {
          if (listing.listing_type === "sale") {
            return listing.sale_status === "available";
          }

          if (listing.listing_type === "auction") {
            const endTime =
              new Date(listing.created_at).getTime() +
              Number(listing.duration_days ?? 0) * 24 * 60 * 60 * 1000;

            return endTime > now;
          }

          return true;
        });

      setProfile(profileResult.data);
      setListings(visibleListings);
      setCompletedSales(salesResult.count ?? 0);
      setLoading(false);
    }

    void loadSellerProfile();
  }, [sellerId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white lg:px-12">
        <div className="mx-auto max-w-[1200px] text-zinc-500">
          A carregar perfil...
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white lg:px-12">
        <div className="mx-auto max-w-[1200px] rounded-[28px] border border-white/10 bg-zinc-950 p-10 text-center">
          <h1 className="text-3xl font-black">Perfil indisponível</h1>
          <p className="mt-3 text-zinc-500">{error}</p>
          <Link
            href="/listings"
            className="mt-7 inline-flex h-11 items-center rounded-xl bg-[#ffb800] px-5 text-sm font-black text-black"
          >
            Ver anúncios
          </Link>
        </div>
      </main>
    );
  }

  const displayName = profile.display_name?.trim() || "Colecionador";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">
          <Link
            href="/listings"
            className="text-sm font-bold text-zinc-500 transition hover:text-[#ffb800]"
          >
            ← Voltar aos anúncios
          </Link>

          <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ffb800]/30 bg-[#ffb800]/10">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`Foto de perfil de ${displayName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={50} className="text-[#ffb800]" />
              )}
            </div>

            <div>
              <div className="text-[11px] font-black uppercase tracking-[3px] text-[#ffb800]">
                Perfil do vendedor
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-zinc-400">
                <CalendarDays size={17} />
                Membro desde {formatMemberSince(profile.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-10 grid max-w-[520px] grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <PackageCheck size={19} className="text-[#ffb800]" />
              <div className="mt-3 text-3xl font-black">{completedSales}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[1px] text-zinc-500">
                Vendas concluídas
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="text-3xl font-black text-[#ffb800]">
                {listings.length}
              </div>
              <div className="mt-5 text-xs font-bold uppercase tracking-[1px] text-zinc-500">
                Anúncios ativos
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-12 lg:py-16">
        <h2 className="text-3xl font-black">Anúncios do vendedor</h2>

        {listings.length === 0 ? (
          <div className="mt-7 rounded-[28px] border border-white/10 bg-zinc-950 p-10 text-center text-zinc-500">
            Este vendedor não tem anúncios ativos neste momento.
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const image = [...(listing.listing_images ?? [])].sort(
                (a, b) => Number(a.sort_order ?? 999) - Number(b.sort_order ?? 999),
              )[0]?.image_url;

              return (
                <Link
                  key={listing.id}
                  href={getListingLink(listing)}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950 transition hover:border-[#ffb800]/50"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    {image ? (
                      <img
                        src={image}
                        alt={`${listing.brand ?? ""} ${listing.model ?? ""}`.trim()}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-black uppercase tracking-[2px] text-zinc-700">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] font-black uppercase tracking-[2px] text-[#ffb800]">
                        {getListingType(listing.listing_type)}
                      </div>
                      <div className="text-sm font-black text-[#ffb800]">
                        {getListingPrice(listing)}
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-bold uppercase tracking-[1.5px] text-zinc-500">
                      {listing.brand || "Garagem164"}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-xl font-black">
                      {listing.model || "Miniatura"}
                    </h3>
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
