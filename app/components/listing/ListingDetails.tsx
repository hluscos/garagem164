import { mockListing } from "@/app/listing/[id]/mockListing";

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="text-zinc-500 text-xs uppercase">
        {label}
      </div>

      <div className="font-semibold mt-1 text-sm">
        {value}
      </div>
    </div>
  );
}

export default function ListingDetails() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6">

      <h2 className="text-2xl font-black">
        Detalhes
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

        <Detail label="Marca" value={mockListing.details.brand} />
        <Detail label="Modelo" value={mockListing.details.model} />
        <Detail label="Escala" value={mockListing.details.scale} />
        <Detail label="Estado" value={mockListing.details.condition} />
        <Detail label="Caixa" value={mockListing.details.box} />
        <Detail label="Localização" value={mockListing.details.location} />

      </div>

    </div>
  );
}