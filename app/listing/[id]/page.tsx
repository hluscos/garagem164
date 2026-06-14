"use client";

import { useEffect, useState } from "react";
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

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [soldCount, setSoldCount] = useState(0);

  console.log("SOLD COUNT:", soldCount);

  useEffect(() => {
    async function loadListing() {
      if (!id) return;

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      console.log("LISTING:", data);
      console.log("ERROR:", error);

      if (data) {
        setListing(data);
      }

      setLoading(false);
    }

    loadListing();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        A carregar anúncio...
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Anúncio não encontrado.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">

        <div className="grid lg:grid-cols-[1.6fr_0.55fr] gap-8">

          <ListingGallery
  listing={listing}
/>

          <ListingSidebar
  listing={listing}
  selectedTickets={selectedTickets}
  soldCount={soldCount}
/>

        </div>

      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-20">

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          <div className="space-y-8">

            <ListingDescription
  description={listing.description}
/>
            <ListingDetails
  listing={listing}
/>

            {listing.listing_type === "raffle" && (
              <RaffleTicketGrid
  listingId={listing.id}
  selectedTickets={selectedTickets}
  setSelectedTickets={setSelectedTickets}
  setSoldCount={setSoldCount}
/>
            )}

            {listing.listing_type === "auction" && (
              <ListingBidHistory />
            )}

          </div>

          <div>
           <ListingSeller />
          </div>

        </div>

      </section>

      <RelatedListings
  listings={[]}
/>

    </main>
  );
}