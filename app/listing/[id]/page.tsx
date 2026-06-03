"use client";

import { useState } from "react";

import { mockListing } from "@/app/listing/[id]/mockListing";

import RaffleTicketGrid from "@/app/components/listing/RaffleTicketGrid";
import ListingGallery from "@/app/components/listing/ListingGallery";
import ListingSidebar from "@/app/components/listing/ListingSidebar";
import ListingDescription from "@/app/components/listing/ListingDescription";
import ListingDetails from "@/app/components/listing/ListingDetails";
import ListingSeller from "@/app/components/listing/ListingSeller";
import ListingBidHistory from "@/app/components/listing/ListingBidHistory";
import RelatedListings from "@/app/components/listing/RelatedListings";

export default function ListingPage() {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  return (
    <main className="min-h-screen bg-black text-white">

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">

        <div className="grid lg:grid-cols-[1.6fr_0.55fr] gap-8">

          <ListingGallery />

          <ListingSidebar
            selectedTickets={selectedTickets}
          />

        </div>

      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-20">

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          <div className="space-y-8">

            <ListingDescription />

            <ListingDetails />

            {mockListing.type === "raffle" && (
              <RaffleTicketGrid
                selectedTickets={selectedTickets}
                setSelectedTickets={setSelectedTickets}
              />
            )}

            {mockListing.type === "auction" && (
              <ListingBidHistory />
            )}

          </div>

          <div>
            <ListingSeller />
          </div>

        </div>

      </section>

      <RelatedListings />

    </main>
  );
}