import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingDescription() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6">

      <h2 className="text-2xl font-black">
        Descrição
      </h2>

      <p className="mt-4 text-zinc-400 leading-relaxed text-sm">
        {mockListing.description}
      </p>

    </div>
  );
}