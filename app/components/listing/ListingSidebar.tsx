import { mockListing } from "@/app/listing/[id]/mockListing";

const listingType = mockListing.type;

export default function ListingSidebar() {
  return (
    <div className="sticky top-24">
      <div className="rounded-[32px] border border-[#ffb800]/20 bg-zinc-950 p-8">

        <div className="text-zinc-500 text-xs uppercase tracking-[2px]">
          {listingType === "auction" && "Licitação Atual"}
          {listingType === "sale" && "Preço"}
          {listingType === "raffle" && "Preço por Ticket"}
        </div>

        <div className="mt-2 text-[42px] font-black text-[#ffb800]">
          {listingType === "auction" && `${mockListing.currentBid}€`}
          {listingType === "sale" && `${mockListing.price}€`}
          {listingType === "raffle" &&
            `${mockListing.raffle.ticketPrice}€`}
        </div>

        {listingType === "auction" && (
          <>
            <div className="h-px bg-white/10 my-8" />

            <div className="text-zinc-500 text-xs uppercase tracking-[2px]">
              Termina em
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">

              <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">
                  {mockListing.auction.days}
                </span>
                <span className="text-xs text-zinc-500">
                  Dias
                </span>
              </div>

              <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">
                  {mockListing.auction.hours}
                </span>
                <span className="text-xs text-zinc-500">
                  Horas
                </span>
              </div>

              <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">
                  {mockListing.auction.minutes}
                </span>
                <span className="text-xs text-zinc-500">
                  Min
                </span>
              </div>

            </div>
          </>
        )}

        {listingType === "raffle" && (
          <>
            <div className="h-px bg-white/10 my-8" />

            <div className="text-zinc-500 text-xs uppercase tracking-[2px]">
              Tickets Vendidos
            </div>

            <div className="mt-3 text-2xl font-black">
              {mockListing.raffle.soldTickets.length} / {mockListing.raffle.totalTickets}
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              {Math.round(
                (mockListing.raffle.soldTickets.length /
                  mockListing.raffle.totalTickets) *
                  100
              )}
              % vendido
            </div>

            <div className="mt-4 h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#ffb800]"
                style={{
                  width: `${
                    (mockListing.raffle.soldTickets.length /
                      mockListing.raffle.totalTickets) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 p-4">

              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Sorteio
              </div>

              <div className="mt-2 text-sm text-zinc-300">
                Máximo de {mockListing.raffle.totalTickets} números.
              </div>

              <div className="mt-1 text-sm text-zinc-300">
                Máximo de {mockListing.raffle.maxTicketsPerUser} tickets por utilizador.
              </div>

            </div>
          </>
        )}

        <button className="mt-8 w-full h-14 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition text-black font-black uppercase">

          {listingType === "auction" && "Licitar Agora"}
          {listingType === "sale" && "Comprar Agora"}
          {listingType === "raffle" && "Escolher Números"}

        </button>

        <button className="mt-3 w-full h-14 rounded-2xl border border-white/10 hover:border-[#ffb800] transition font-black uppercase">
          Favoritos
        </button>

      </div>
    </div>
  );
}