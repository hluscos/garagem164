import { mockListing } from "@/app/listing/[id]/mockListing";

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <div className="text-zinc-500 text-sm">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function ListingDetails() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-8">

      <h2 className="text-3xl font-black">
        Detalhes
      </h2>

      <div className="grid md:grid-cols-2 gap-5 mt-6">

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