"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

import RaffleTicketGrid from "@/app/components/listing/RaffleTicketGrid";
import ListingGallery from "@/app/components/listing/ListingGallery";
import ListingSidebar from "@/app/components/listing/ListingSidebar";
import ListingDescription from "@/app/components/listing/ListingDescription";
import ListingDetails from "@/app/components/listing/ListingDetails";
import ListingSeller from "@/app/components/listing/ListingSeller";
import ListingBidHistory from "@/app/components/listing/ListingBidHistory";
import RelatedListings from "@/app/components/listing/RelatedListings";

export default function ListingPage() {
  const params = useParams();

  const id = params.id as string;

  const [listing, setListing] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedTickets, setSelectedTickets] =
    useState<number[]>([]);

  const [soldCount, setSoldCount] =
    useState(0);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      if (!id) {
        return;
      }

      const [
        { data: listingData, error: listingError },
        {
          data: { user },
        },
      ] = await Promise.all([
        supabase
          .from("listings")
          .select(
            `
              *,
              listing_images (
                image_url,
                sort_order
              )
            `,
          )
          .eq("id", id)
          .single(),

        supabase.auth.getUser(),
      ]);

      console.log(
        "LISTING:",
        listingData,
      );

      console.log(
        "ERROR:",
        listingError,
      );

      if (user) {
        setCurrentUserId(user.id);
      }

      if (listingData) {
        setListing(listingData);
      }

      setLoading(false);
    }

    void loadListing();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-12 py-20 text-white">
        A carregar anúncio...
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-black px-12 py-20 text-white">
        Anúncio não encontrado.
      </main>
    );
  }

  const isRaffle =
    listing.listing_type === "raffle";

  const isOwner =
    Boolean(
      currentUserId &&
      listing.user_id === currentUserId,
    );

  return (
    <main className="min-h-screen bg-black text-white">

      {/* CONTEXT NAVIGATION */}

      <section className="mx-auto max-w-[1600px] px-6 pt-8 lg:px-12">

        <Link
          href={
            isRaffle
              ? "/raffles"
              : listing.listing_type ===
                  "auction"
                ? "/auctions"
                : "/"
          }
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-[#ffb800]"
        >
          ←{" "}
          {isRaffle
            ? "Voltar aos Sorteios"
            : listing.listing_type ===
                "auction"
              ? "Voltar aos Leilões"
              : "Voltar"}
        </Link>

      </section>

      {/* MAIN */}

      <section className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.55fr]">

          <ListingGallery
            listing={listing}
          />

          <ListingSidebar
            listing={listing}
            listingId={listing.id}
            selectedTickets={
              selectedTickets
            }
            soldCount={soldCount}
            isOwner={isOwner}
          />

        </div>

      </section>

      {/* DETAILS */}

      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          <div className="space-y-8">

            <ListingDescription
              description={
                listing.description
              }
            />

            {isRaffle && (
              <RaffleTicketGrid
                listingId={listing.id}
                totalTickets={
                  Number(
                    listing.total_tickets || 0,
                  )
                }
                selectedTickets={
                  selectedTickets
                }
                setSelectedTickets={
                  setSelectedTickets
                }
                setSoldCount={
                  setSoldCount
                }
                disabled={isOwner}
              />
            )}

            {listing.listing_type ===
              "auction" && (
              <ListingBidHistory />
            )}

            <ListingDetails
              listing={listing}
            />

          </div>

          <div>
            <ListingSeller
              listing={listing}
            />
          </div>

        </div>

      </section>

      <RelatedListings
        listings={[]}
      />

    </main>
  );
}