"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function rafflePage() {

  const [raffles, setRaffles] = useState<any[]>([]);
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});

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
  }

  loadRaffles();
}, []);

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

          <div className="h-[42px] px-5 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Ativos

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            A Terminar

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Novos Sorteios

          </div>

        </div>

      </section>

      {/* GRID */}

      <section className="max-w-[1480px] mx-auto px-12 py-14">

        <div className="grid grid-cols-4 gap-6">

  {raffles.map((item) => {

  const sold = soldCounts[item.id] || 0;
  const available = item.total_tickets - sold;

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

    </section>

  </main>

);
}