import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingSeller() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6">

      <h2 className="text-xl font-black">
        Vendedor
      </h2>

      <div className="flex items-center gap-4 mt-5">

        <div className="w-16 h-16 rounded-full bg-zinc-800" />

        <div>

          <div className="text-lg font-bold">
            {mockListing.seller.name}
          </div>

          <div className="text-zinc-400 text-sm">
            ⭐ {mockListing.seller.rating}
          </div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs text-zinc-500 uppercase">
            Vendas
          </div>

          <div className="font-bold mt-1">
            {mockListing.seller.sales}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs text-zinc-500 uppercase">
            Membro
          </div>

          <div className="font-bold mt-1">
            {mockListing.seller.memberSince}
          </div>
        </div>

      </div>

      <button className="mt-5 w-full h-12 rounded-xl border border-white/10 hover:border-[#ffb800] transition font-semibold">
        Ver Perfil
      </button>

    </div>
  );
}