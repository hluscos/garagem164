"use client";

import { useState } from "react";
import { mockListing } from "@/app/listing/[id]/mockListing";

export default function RaffleTicketGrid() {
  const tickets = Array.from(
    { length: mockListing.raffle.totalTickets },
    (_, i) => i + 1
  );

  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  const ticketPrice = mockListing.raffle.ticketPrice;

  const soldTickets = mockListing.raffle.soldTickets;
  const reservedTickets = mockListing.raffle.reservedTickets;
  const maxTicketsPerUser = mockListing.raffle.maxTicketsPerUser;

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

  const totalPrice =
    selectedTickets.length * ticketPrice;

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

      <div className="mt-8 rounded-2xl border border-white/10 p-5">

        <div className="text-sm text-zinc-500 uppercase tracking-wider">
          Resumo
        </div>

        <div className="mt-4">

          <div className="text-zinc-400">
            Tickets Selecionados
          </div>

          <div className="mt-2 font-bold break-words">
            {selectedTickets.length > 0
              ? selectedTickets
                  .map((n) => n.toString().padStart(2, "0"))
                  .join(", ")
              : "Nenhum"}
          </div>

        </div>

        <div className="mt-4 flex justify-between">
          <span className="text-zinc-400">
            Quantidade
          </span>

          <span className="font-bold">
            {selectedTickets.length}
          </span>
        </div>

        <div className="mt-2 flex justify-between text-xl font-black">

          <span>Total</span>

          <span className="text-[#ffb800]">
            {totalPrice.toFixed(2)}€
          </span>

        </div>

      </div>

    </div>
  );
}