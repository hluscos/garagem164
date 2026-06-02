import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingDescription() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-8">

      <h2 className="text-3xl font-black">
        Descrição
      </h2>

      <p className="mt-6 text-zinc-400 leading-relaxed">
        {mockListing.description}
      </p>

    </div>
  );
}