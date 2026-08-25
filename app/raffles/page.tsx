"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Raffle = {
  id: string;
  brand: string | null;
  model: string;
  ticket_price: number;
  total_tickets: number;
  created_at: string;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

type RaffleFilter = "active" | "ending" | "new";

const raffleFilters: {
  value: RaffleFilter;
  label: string;
  description: string;
}[] = [
  {
    value: "active",
    label: "Ativos",
    description: "Sorteios com bilhetes disponíveis",
  },
  {
    value: "ending",
    label: "A Terminar",
    description: "Sorteios com 25% ou menos dos bilhetes disponíveis",
  },
  {
    value: "new",
    label: "Novos Sorteios",
    description: "Sorteios publicados nos últimos 7 dias",
  },
];

const newRaffleWindow = 7 * 24 * 60 * 60 * 1000;
const endingRaffleAvailabilityRatio = 0.25;

export default function RafflesPage() {

  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<RaffleFilter>("active");
  const [filterReferenceTime, setFilterReferenceTime] = useState(0);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function loadRaffles() {
    const { data, error } = await supabase
  .from("listings")
.select(`
  *,
  listing_images (
    image_url,
    sort_order
  )
`)
.eq("listing_type", "raffle")
.order("created_at", { ascending: false });

console.log("USER:", await supabase.auth.getUser());
console.log("DATA:", data);
console.log("ERROR:", error);

    console.log("TESTE HUGO", data);
    console.log("ERROR:", error);

    if (data) {
      setRaffles(data);
      setFilterReferenceTime(Date.now());
      const { data: tickets } = await supabase
  .from("raffle_tickets")
  .select("raffle_id");

if (tickets) {
  const counts: Record<string, number> = {};

  tickets.forEach((ticket) => {
    counts[ticket.raffle_id] =
      (counts[ticket.raffle_id] || 0) + 1;
  });

  setSoldCounts(counts);
}
    }

    setLoading(false);
  }

  loadRaffles();
}, []);

  const rafflesWithAvailability = raffles.map((raffle) => {
    const sold = soldCounts[raffle.id] || 0;
    const totalTickets = Number(raffle.total_tickets || 0);

    return {
      ...raffle,
      available: Math.max(0, totalTickets - sold),
      totalTickets,
    };
  });

  const filteredRaffles = rafflesWithAvailability.filter((raffle) => {
    if (raffle.available <= 0) {
      return false;
    }

    if (activeFilter === "ending") {
      return (
        raffle.totalTickets > 0 &&
        raffle.available / raffle.totalTickets <=
          endingRaffleAvailabilityRatio
      );
    }

    if (activeFilter === "new") {
      return (
        filterReferenceTime > 0 &&
        new Date(raffle.created_at).getTime() >=
        filterReferenceTime - newRaffleWindow
      );
    }

    return true;
  });

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}

      <section className="relative h-[420px] border-b border-white/5 overflow-hidden">

        {/* BACKGROUND */}

<div className="absolute inset-0 overflow-hidden">

  <img
    src="/images/cards/raffle-background.png"
    alt=""
    className="absolute inset-0 h-full w-full object-cover opacity-75"
  />

  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/80" />

  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />

</div>

        <div className="relative z-10 max-w-[1480px] mx-auto px-12 h-full flex flex-col justify-center">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">

            Sorteios Exclusivos

          </div>

          <h1 className="mt-5 text-[82px] leading-none font-black italic uppercase tracking-[-4px]">

            Sorteios

          </h1>

          <p className="mt-6 text-zinc-400 text-[18px] max-w-[620px] leading-relaxed">

            Participa para ganhar miniaturas raras,
            edições limitadas e peças exclusivas para a tua coleção.

          </p>

        </div>

      </section>

      {/* STATUS */}

      <section className="border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 py-8 flex flex-wrap gap-4">

          {raffleFilters.map((filter) => {
            const selected = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={selected}
                title={filter.description}
                onClick={() => setActiveFilter(filter.value)}
                className={`flex h-[42px] items-center justify-center rounded-full border px-5 text-[12px] font-black uppercase tracking-[1px] transition-all duration-300 ${
                  selected
                    ? "border-[#ffb800] bg-[#ffb800] text-black"
                    : "border-white/10 bg-zinc-950 text-white hover:border-[#ffb800] hover:text-[#ffb800]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}

        </div>

      </section>

      {/* GRID */}

      <section className="max-w-[1480px] mx-auto px-12 py-14">

        {loading ? (
          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-12 text-center">
            <div className="text-lg font-black">
              A carregar sorteios...
            </div>
          </div>
        ) : filteredRaffles.length === 0 ? (
          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-12 text-center">
            <div className="text-2xl font-black">
              {activeFilter === "ending"
                ? "Não existem sorteios a terminar."
                : "Não existem sorteios neste filtro."}
            </div>
            <p className="mt-3 text-zinc-500">
              Seleciona outra opção para veres os sorteios disponíveis.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

  {filteredRaffles.map((item) => {

  const available = item.available;

  return (

    <div
      key={item.id}
              className="group rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/30 transition-all duration-500"
            >

              <div className="relative h-[260px] overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-[180px] h-[90px] rounded-full bg-[#ffb800]/20 blur-[70px]" />

                </div>

                <img
  src={
    item.listing_images?.[0]?.image_url ||
    "/images/hero/cars/clio-williams.png"
  }
  alt={item.model}
  className="relative z-10 w-[82%] mx-auto mt-10 group-hover:scale-105 transition-all duration-700"
/>

                <div className="absolute top-4 left-4 h-[32px] px-4 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">

                  Sorteio

                </div>

              </div>

              <div className="p-6">

                <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">

                  Ticket €{item.ticket_price}

                </div>

                <h3 className="mt-3 text-[22px] font-black leading-tight">

                  {item.model}

                </h3>

                <div className="mt-6 flex items-center justify-between">

                  <div>

                    <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">
  Bilhetes Disponíveis

                    </div>

                    <div className="mt-1 text-[28px] font-black text-[#ffb800]">

                      {available}

                    </div>

                  </div>

                  <a
  href={available > 0 ? `/raffles/${item.id}` : "#"}
  className={`h-[48px] px-5 rounded-2xl text-[12px] font-black uppercase tracking-[1px] inline-flex items-center justify-center transition-all duration-300 ${
    available > 0
      ? "bg-[#ffb800] hover:bg-[#ffc933] text-black"
      : "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none"
  }`}
>
  {available > 0 ? "Participar" : "Esgotado"}
</a>
              </div>

            </div>

          </div>

        );

      })}

      </div>
        )}

    </section>

  </main>

);
}
