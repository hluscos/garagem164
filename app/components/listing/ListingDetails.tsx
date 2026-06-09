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

type Props = {
  listing: any;
};

export default function ListingDetails({
  listing,
}: Props) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6">

      <h2 className="text-2xl font-black">
        Detalhes
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

        <Detail label="Marca" value={listing.brand || "-"} />
        <Detail label="Modelo" value={listing.model || "-"} />
        <Detail label="Categoria" value={listing.category || "-"} />
        <Detail label="Estado" value={listing.condition || "-"} />
        <Detail label="Tipo" value={listing.listing_type || "-"} />
        <Detail label="Preço" value={`${listing.price || 0}€`} />

      </div>

    </div>
  );
}