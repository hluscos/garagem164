import { mockListing } from "@/app/listing/[id]/mockListing";

const listingType = mockListing.type;

type Props = {
  selectedTickets: number[];
};

export default function ListingSidebar({
  selectedTickets,
}: Props) {
  const raffleTotal =
    selectedTickets.length *
    mockListing.raffle.ticketPrice;

  const sortedTickets = [...selectedTickets].sort(
    (a, b) => a - b
  );

  const hasSelection =
    selectedTickets.length > 0;

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
                Seleção Atual
              </div>

              <div className="mt-3 text-sm text-zinc-400">
                Tickets Selecionados
              </div>

              <div className="mt-1 font-bold break-words">
                {sortedTickets.length > 0
                  ? sortedTickets
                      .map((n) =>
                        n.toString().padStart(2, "0")
                      )
                      .join(", ")
                  : "Nenhum"}
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-zinc-400">
                  Quantidade
                </span>

                <span className="font-bold">
                  {selectedTickets.length}
                </span>
              </div>

              <div className="mt-2 flex justify-between font-black">
                <span>Total</span>

                <span className="text-[#ffb800]">
                  {raffleTotal.toFixed(2)}€
                </span>
              </div>

            </div>
          </>
        )}

        <button
          disabled={
            listingType === "raffle" &&
            !hasSelection
          }
          className={`mt-8 w-full h-14 rounded-2xl font-black uppercase transition ${
            listingType === "raffle" && !hasSelection
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-[#ffb800] hover:bg-[#ffc933] text-black"
          }`}
        >
          {listingType === "auction" &&
            "Licitar Agora"}

          {listingType === "sale" &&
            "Comprar Agora"}

          {listingType === "raffle" &&
            (hasSelection
              ? `Comprar ${selectedTickets.length} Ticket${
                  selectedTickets.length === 1
                    ? ""
                    : "s"
                }`
              : "Seleciona os teus números")}
        </button>

        <button className="mt-3 w-full h-14 rounded-2xl border border-white/10 hover:border-[#ffb800] transition font-black uppercase">
          Favoritos
        </button>

      </div>
    </div>
  );
}