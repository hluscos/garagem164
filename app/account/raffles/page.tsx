"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PurchaseCard from "../components/PurchaseCard";

interface RaffleTicket {
  raffle_id: string;
  ticket_number: number;
  total_price: number;
  created_at: string;
}

interface Listing {
  id: string;
  brand: string | null;
  model: string | null;
}

interface ListingImage {
  listing_id: string;
  image_url: string;
}

interface RaffleEntry {
  raffleId: string;
  ticketNumbers: number[];
  totalPaid: number;
  purchaseDate: string;
  brand: string;
  model: string;
  image: string;
}

export default function AccountRafflesPage() {
  const [loading, setLoading] = useState(true);
  const [raffles, setRaffles] = useState<RaffleEntry[]>([]);

  useEffect(() => {
    async function loadRaffles() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from("raffle_tickets")
        .select("raffle_id, ticket_number, total_price, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (ticketError) {
        console.error("Erro ao carregar sorteios:", ticketError);
        setLoading(false);
        return;
      }

      const tickets = (ticketData ?? []) as RaffleTicket[];
      const raffleIds = [...new Set(tickets.map((ticket) => ticket.raffle_id))];

      let listings: Listing[] = [];
      let images: ListingImage[] = [];

      if (raffleIds.length > 0) {
        const [listingsResult, imagesResult] = await Promise.all([
          supabase
            .from("listings")
            .select("id, brand, model")
            .in("id", raffleIds),
          supabase
            .from("listing_images")
            .select("listing_id, image_url")
            .in("listing_id", raffleIds)
            .order("sort_order", { ascending: true }),
        ]);

        if (listingsResult.error) {
          console.error(
            "Erro ao carregar anúncios dos sorteios:",
            listingsResult.error,
          );
        }

        if (imagesResult.error) {
          console.error(
            "Erro ao carregar imagens dos sorteios:",
            imagesResult.error,
          );
        }

        listings = (listingsResult.data ?? []) as Listing[];
        images = (imagesResult.data ?? []) as ListingImage[];
      }

      const groupedRaffles = tickets.reduce<Record<string, RaffleEntry>>(
        (entries, ticket) => {
          if (!entries[ticket.raffle_id]) {
            const listing = listings.find((item) => item.id === ticket.raffle_id);
            const image = images.find(
              (item) => item.listing_id === ticket.raffle_id,
            );

            entries[ticket.raffle_id] = {
              raffleId: ticket.raffle_id,
              ticketNumbers: [],
              totalPaid: 0,
              purchaseDate: ticket.created_at,
              brand: listing?.brand || "Garagem164",
              model: listing?.model || "Miniatura",
              image: image?.image_url || "",
            };
          }

          entries[ticket.raffle_id].ticketNumbers.push(ticket.ticket_number);
          entries[ticket.raffle_id].totalPaid += Number(ticket.total_price);

          return entries;
        },
        {},
      );

      setRaffles(Object.values(groupedRaffles));
      setLoading(false);
    }

    void loadRaffles();
  }, []);

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
          Participações
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight">
          Os Meus Sorteios
        </h1>

        <p className="mt-2 text-zinc-400">
          Consulta os sorteios em que participas e os teus bilhetes.
        </p>

        {raffles.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Ticket size={28} className="text-zinc-600" />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Ainda não participas em sorteios
            </h2>

            <p className="mx-auto mt-2 max-w-md text-zinc-500">
              Quando comprares bilhetes para um sorteio, eles aparecerão aqui.
            </p>

            <Link
              href="/raffles"
              className="mt-7 inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[#ffb800] px-6 text-sm font-black text-black transition-all duration-300 hover:bg-[#ffd34d]"
            >
              Ver sorteios
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {raffles.map((raffle) => (
              <PurchaseCard
                key={raffle.raffleId}
                type="raffle"
                listingId={raffle.raffleId}
                model={raffle.model}
                brand={raffle.brand}
                image={raffle.image}
                ticketNumbers={raffle.ticketNumbers}
                totalPaid={raffle.totalPaid}
                purchaseDate={raffle.purchaseDate}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
