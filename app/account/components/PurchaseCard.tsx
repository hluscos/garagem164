import Link from "next/link";
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
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition-all duration-300 hover:border-[#ffb800]/60 hover:shadow-[0_0_40px_rgba(255,184,0,0.08)]">

      <div className="grid md:grid-cols-[320px_1fr]">

        <div className="flex items-center justify-center bg-zinc-900 p-6">

          {image ? (
            <img
              src={image}
              alt={model}
              className="h-44 w-44 rounded-2xl object-cover"
            />
          ) : (
            <div className="ml-auto flex h-11 w-44 items-center justify-center rounded-xl bg-[#ffb800] font-black text-black transition-all duration-300 hover:scale-105 hover:bg-[#ffd24a]">
              📦
            </div>
          )}

        </div>

        <div className="flex flex-col p-8">

          <div className="text-xs uppercase tracking-[3px] text-zinc-500">
            {brand}
          </div>

          <h2 className="mt-2 text-3xl font-black">
            {model}
          </h2>

          <div className="mt-8">

            <div className="text-xs uppercase tracking-[3px] text-zinc-500">
              Bilhetes Comprados
            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              <div className="flex flex-wrap gap-2">

  {ticketNumbers
    .sort((a, b) => a - b)
    .slice(0, 8)
    .map((ticket) => (
      <TicketBadge
        key={ticket}
        number={ticket}
      />
    ))}

  {ticketNumbers.length > 8 && (
    <div className="flex h-10 items-center rounded-xl border border-[#ffb800]/40 px-4 text-sm font-bold text-[#ffb800]">
      +{ticketNumbers.length - 8}
    </div>
  )}

</div>

            </div>

          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">

            <div>

              <div className="text-xs uppercase tracking-[3px] text-zinc-500">
                Total Pago
              </div>

              <div className="mt-2 text-3xl font-black text-[#ffb800]">
                €{totalPaid.toFixed(2)}
              </div>

            </div>

            <div>

              <div className="text-xs uppercase tracking-[3px] text-zinc-500">
                Data da Compra
              </div>

              <div className="mt-2 font-semibold">
                {new Date(purchaseDate).toLocaleDateString("pt-PT")}
              </div>

            </div>

          </div>

          <div className="mt-auto pt-10">

            <Link
              href={`/raffles/${raffleId}`}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#ffb800] font-black text-black transition-all duration-300 hover:scale-[1.02] hover:bg-[#ffd24a]"
            >
              Ver Sorteio
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}