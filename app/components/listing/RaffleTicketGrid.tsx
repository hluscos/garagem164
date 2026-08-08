"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  listingId: string;
  totalTickets: number;
  selectedTickets: number[];
  setSelectedTickets: React.Dispatch<
    React.SetStateAction<number[]>
  >;
  setSoldCount: React.Dispatch<
    React.SetStateAction<number>
  >;
  disabled?: boolean;
};

export default function RaffleTicketGrid({
  listingId,
  totalTickets,
  selectedTickets,
  setSelectedTickets,
  setSoldCount,
  disabled = false,
}: Props) {
  const [soldTickets, setSoldTickets] =
    useState<number[]>([]);

  const [reservedTickets, setReservedTickets] =
    useState<number[]>([]);

  const maxTicketsPerUser = 10;

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      const now = new Date().toISOString();

      const [
        { data: soldData },
        { data: reservationData },
      ] = await Promise.all([
        supabase
          .from("raffle_tickets")
          .select("ticket_number")
          .eq("raffle_id", listingId),

        supabase
          .from("raffle_ticket_reservations")
          .select("ticket_number")
          .eq("raffle_id", listingId)
          .gt("expires_at", now),
      ]);

      if (!active) {
        return;
      }

      const sold =
        soldData
          ?.map((ticket) => ticket.ticket_number)
          .filter(
            (number): number is number =>
              typeof number === "number",
          ) || [];

      const reserved =
        reservationData
          ?.map((ticket) => ticket.ticket_number)
          .filter(
            (number): number is number =>
              typeof number === "number",
          ) || [];

      setSoldTickets(sold);
      setReservedTickets(reserved);
      setSoldCount(sold.length);

      /*
       * Se um ticket selecionado entretanto foi
       * vendido ou reservado, removê-lo da seleção.
       */

      setSelectedTickets((current) =>
        current.filter(
          (ticket) =>
            !sold.includes(ticket) &&
            !reserved.includes(ticket),
        ),
      );
    }

    void loadTickets();

    /*
     * Atualiza periodicamente o estado dos tickets.
     * Isto reduz o risco de mostrar disponibilidade
     * desatualizada enquanto outro utilizador compra.
     */

    const interval = window.setInterval(
      loadTickets,
      10000,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [
    listingId,
    setSelectedTickets,
    setSoldCount,
  ]);

  const tickets = Array.from(
    { length: totalTickets },
    (_, index) => index + 1,
  );

  function toggleTicket(ticket: number) {
    if (disabled) {
      return;
    }

    if (soldTickets.includes(ticket)) {
      return;
    }

    if (reservedTickets.includes(ticket)) {
      return;
    }

    setSelectedTickets((current) => {
      if (current.includes(ticket)) {
        return current.filter(
          (number) => number !== ticket,
        );
      }

      if (
        current.length >= maxTicketsPerUser
      ) {
        return current;
      }

      return [...current, ticket];
    });
  }

  return (
    <div>

      <h2 className="mb-2 text-2xl font-black">
        Selecionar Tickets
      </h2>

      <p className="mb-6 text-zinc-400">
        Escolhe os números que pretendes comprar.
      </p>

      <div className="mb-6 flex flex-wrap gap-4 text-sm">

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-zinc-700" />
          <span>Disponível</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#ffb800]" />
          <span>Selecionado</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-orange-500" />
          <span>Reservado</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-600" />
          <span>Vendido</span>
        </div>

      </div>

      <div className="grid grid-cols-9 gap-3">

        {tickets.map((ticket) => {
          const isSold =
            soldTickets.includes(ticket);

          const isReserved =
            reservedTickets.includes(ticket);

          const isSelected =
            selectedTickets.includes(ticket);

          let buttonClass =
            "border-white/10 bg-zinc-900 text-white hover:border-[#ffb800]";

          if (isSold) {
            buttonClass =
              "cursor-not-allowed border-red-600 bg-red-600 text-white";
          } else if (isReserved) {
            buttonClass =
              "cursor-not-allowed border-orange-500 bg-orange-500 text-white";
          } else if (isSelected) {
            buttonClass =
              "border-[#ffb800] bg-[#ffb800] text-black";
          }

          return (
            <button
              key={ticket}
              type="button"
              disabled={
                disabled ||
                isSold ||
                isReserved
              }
              onClick={() =>
                toggleTicket(ticket)
              }
              className={`h-11 rounded-xl border font-bold transition ${buttonClass}`}
            >
              {ticket
                .toString()
                .padStart(2, "0")}
            </button>
          );
        })}

      </div>

      <div className="mt-4 text-sm text-zinc-500">
        Máximo de {maxTicketsPerUser} tickets
        por compra
      </div>

    </div>
  );
}