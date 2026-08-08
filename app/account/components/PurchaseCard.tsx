import Link from "next/link";
import { ArrowRight, CalendarDays, Ticket } from "lucide-react";
import TicketBadge from "./TicketBadge";

interface PurchaseCardProps {
  raffleId: string;
  model: string;
  brand: string;
  image: string;
  ticketNumbers: number[];
  totalPaid: number;
  purchaseDate: string;
}

export default function PurchaseCard({
  raffleId,
  model,
  brand,
  image,
  ticketNumbers,
  totalPaid,
  purchaseDate,
}: PurchaseCardProps) {
  const sortedTickets = [...ticketNumbers].sort(
    (a, b) => a - b,
  );

  const visibleTickets = sortedTickets.slice(0, 8);
  const remainingTickets =
    sortedTickets.length - visibleTickets.length;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/5 bg-zinc-950 transition-all duration-300 hover:border-[#ffb800]/20">

      {/* IMAGEM */}

      <div className="flex flex-col md:flex-row">

        <div className="flex w-full shrink-0 items-center justify-center bg-zinc-900/70 p-6 md:w-[190px]">

          <div className="relative flex h-[158px] w-[158px] items-center justify-center overflow-hidden rounded-2xl bg-zinc-800/70 ring-1 ring-white/5">

            {image?.trim() ? (
              <img
                src={image}
                alt={model}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-center">
                <div className="text-4xl opacity-30">
                  🚗
                </div>

                <div className="mt-2 text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
                  Garagem164
                </div>
              </div>
            )}

          </div>

        </div>

        {/* CONTEÚDO */}

        <div className="flex min-w-0 flex-1 flex-col p-7 md:p-8">

          {/* CABEÇALHO */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="text-[11px] font-bold uppercase tracking-[4px] text-zinc-500">
                  {brand}
                </span>

                <span className="rounded-full border border-[#ffb800]/20 bg-[#ffb800]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[1.5px] text-[#ffb800]">
                  Sorteio
                </span>

              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                {model}
              </h2>

            </div>

            <div className="text-left sm:text-right">

              <div className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
                Total pago
              </div>

              <div className="mt-1 text-2xl font-black text-[#ffb800]">
                €{totalPaid.toFixed(2)}
              </div>

            </div>

          </div>

          {/* DIVISOR */}

          <div className="my-6 h-px bg-white/5" />

          {/* BILHETES */}

          <div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Ticket
                  size={15}
                  className="text-[#ffb800]"
                />

                <span className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-500">
                  Bilhetes comprados
                </span>

              </div>

              <span className="text-xs font-bold text-zinc-500">
                {ticketNumbers.length}{" "}
                {ticketNumbers.length === 1
                  ? "bilhete"
                  : "bilhetes"}
              </span>

            </div>

            <div className="mt-3 flex flex-wrap gap-2">

              {visibleTickets.map((ticket) => (
                <TicketBadge
                  key={ticket}
                  number={ticket}
                />
              ))}

              {remainingTickets > 0 && (
                <div className="flex h-10 items-center justify-center rounded-xl border border-[#ffb800]/30 bg-[#ffb800]/5 px-4 text-sm font-black text-[#ffb800]">
                  +{remainingTickets}
                </div>
              )}

            </div>

          </div>

          {/* RODAPÉ */}

          <div className="mt-7 flex flex-col gap-5 border-t border-white/5 pt-6 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex items-center gap-2 text-zinc-500">

              <CalendarDays size={15} />

              <div>

                <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                  Data da compra
                </div>

                <div className="mt-1 text-sm font-bold text-zinc-300">
                  {new Date(
                    purchaseDate,
                  ).toLocaleDateString("pt-PT")}
                </div>

              </div>

            </div>

            <Link
              href={`/listing/${raffleId}`}
              className="group/button inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[#ffb800] px-6 text-sm font-black text-black transition-all duration-300 hover:bg-[#ffd34d] hover:shadow-[0_8px_30px_rgba(255,184,0,0.18)]"
            >
              Ver Sorteio

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover/button:translate-x-1"
              />
            </Link>

          </div>

        </div>

      </div>

    </article>
  );
}