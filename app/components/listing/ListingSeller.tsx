import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingSeller() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-8">

      <h2 className="text-2xl font-black">
        Vendedor
      </h2>

      <div className="w-20 h-20 rounded-full bg-zinc-800 mt-6" />

      <div className="mt-4 text-xl font-bold">
        {mockListing.seller.name}
      </div>

      <div className="mt-2 text-zinc-400">
        ⭐ {mockListing.seller.rating} • {mockListing.seller.sales} vendas
      </div>

      <div className="mt-2 text-zinc-500 text-sm">
        Membro desde {mockListing.seller.memberSince}
      </div>

      <button className="mt-6 w-full h-14 rounded-2xl border border-white/10 hover:border-[#ffb800] transition">
        Ver Perfil
      </button>

    </div>
  );
}