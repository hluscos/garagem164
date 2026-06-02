import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingSidebar() {
  return (
    <div className="sticky top-24">
      <div className="rounded-[32px] border border-[#ffb800]/20 bg-zinc-950 p-8">

        <div className="text-zinc-500 text-xs uppercase tracking-[2px]">
          Licitação Atual
        </div>

        <div className="mt-2 text-[58px] font-black text-[#ffb800]">
          {mockListing.currentBid}€
        </div>

        <div className="h-px bg-white/10 my-8" />

        <div className="text-zinc-500 text-xs uppercase tracking-[2px]">
          Termina em
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">

          <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">
              {mockListing.auction.days}
            </span>
            <span className="text-xs text-zinc-500">Dias</span>
          </div>

          <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">
              {mockListing.auction.hours}
            </span>
            <span className="text-xs text-zinc-500">Horas</span>
          </div>

          <div className="h-24 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">
              {mockListing.auction.minutes}
            </span>
            <span className="text-xs text-zinc-500">Min</span>
          </div>

        </div>

        <button className="mt-8 w-full h-14 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition text-black font-black uppercase">
          Licitar Agora
        </button>

        <button className="mt-3 w-full h-14 rounded-2xl border border-white/10 hover:border-[#ffb800] transition font-black uppercase">
          Favoritos
        </button>

      </div>
    </div>
  );
}