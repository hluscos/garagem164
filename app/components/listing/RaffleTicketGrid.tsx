"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  listingId: string;
  selectedTickets: number[];
  setSelectedTickets: React.Dispatch<
    React.SetStateAction<number[]>
  >;
  setSoldCount: React.Dispatch<
    React.SetStateAction<number>
  >;
};

export default function RaffleTicketGrid({
  listingId,
  selectedTickets,
  setSelectedTickets,
  setSoldCount,
}: Props) {
  const totalTickets = 99;
const [soldTickets, setSoldTickets] = useState<number[]>([]);
useEffect(() => {
  async function loadSoldTickets() {
    const { data } = await supabase
      .from("raffle_tickets")
      .select("ticket_number")
      .eq("raffle_id", listingId);

    if (data) {
      const sold = data
        .map((ticket) => ticket.ticket_number)
        .filter(Boolean);

      setSoldTickets(sold);

console.log("SOLD LENGTH:", sold.length);

setSoldCount(sold.length);
    }
  }

  loadSoldTickets();
}, [listingId]);
  const tickets = Array.from(
    { length: totalTickets },
    (_, i) => i + 1
  );

  const reservedTickets: number[] = [];
  const maxTicketsPerUser = 10;

  function toggleTicket(ticket: number) {
    setSelectedTickets((current) => {
      if (current.includes(ticket)) {
        return current.filter((t) => t !== ticket);
      }

      if (current.length >= maxTicketsPerUser) {
        return current;
      }

      return [...current, ticket];
    });
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-8">

      <h2 className="text-2xl font-black mb-2">
        Selecionar Tickets
      </h2>

      <p className="text-zinc-400 mb-6">
        Escolhe os números que pretendes comprar.
      </p>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-700" />
          <span>Disponível</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#ffb800]" />
          <span>Selecionado</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span>Reservado</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span>Vendido</span>
        </div>

      </div>

      <div className="grid grid-cols-9 gap-3">

        {tickets.map((ticket) => {
          const isSold = soldTickets.includes(ticket);
          const isReserved = reservedTickets.includes(ticket);
          const isSelected = selectedTickets.includes(ticket);

          let buttonClass =
            "border-white/10 text-white hover:border-[#ffb800]";

          if (isSold) {
            buttonClass =
              "bg-red-600 border-red-600 text-white cursor-not-allowed";
          } else if (isReserved) {
            buttonClass =
              "bg-orange-500 border-orange-500 text-black";
          } else if (isSelected) {
            buttonClass =
              "bg-[#ffb800] border-[#ffb800] text-black";
          }

          return (
            <button
              key={ticket}
              disabled={isSold}
              onClick={() => {
                if (!isSold && !isReserved) {
                  toggleTicket(ticket);
                }
              }}
              className={`h-11 rounded-xl border font-bold transition ${buttonClass}`}
            >
              {ticket.toString().padStart(2, "0")}
            </button>
          );
        })}

      </div>

      <div className="mt-4 text-sm text-zinc-500">
        Máximo de {maxTicketsPerUser} tickets por utilizador
      </div>

    </div>
  );
}