function BidRow({
  user,
  bid,
}: {
  user: string;
  bid: number;
}) {
  return (
    <div className="flex items-center justify-between border border-white/10 rounded-2xl p-4">
      <span>{user}</span>

      <span className="font-bold text-[#ffb800]">
        {bid}€
      </span>
    </div>
  );
}

export default function ListingBidHistory() {
  const bids = [
    {
      user: "Utilizador",
      amount: 0,
    },
  ];

  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-8">

      <h2 className="text-3xl font-black">
        Histórico de Lances
      </h2>

      <div className="mt-6 space-y-4">

        {bids.map((bid, index) => (
          <BidRow
            key={index}
            user={bid.user}
            bid={bid.amount}
          />
        ))}

      </div>

    </div>
  );
}