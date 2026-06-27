type Props = {
  open: boolean;
  onClose: () => void;
  selectedTickets: number[];
  ticketPrice: number;
};

export default function RaffleCheckoutModal({
  open,
  onClose,
  selectedTickets,
  ticketPrice,
}: Props) {
  if (!open) return null;

  const total = selectedTickets.length * ticketPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-[#ffb800]/20 p-8">

        <h2 className="text-2xl font-black">
          TESTE HUGO
        </h2>

        <div className="mt-6">
          <div className="text-zinc-400">
            Tickets:
          </div>

          <div className="mt-2 font-bold">
            {selectedTickets
              .sort((a, b) => a - b)
              .map((n) => n.toString().padStart(2, "0"))
              .join(", ")}
          </div>

          <div className="mt-6 flex justify-between">
            <span>Total</span>

            <span className="font-black text-[#ffb800]">
              {total.toFixed(2)}€
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border border-white/10"
          >
            Cancelar
          </button>

          <button
  onClick={() => {
    alert("Checkout Stripe será aberto aqui.");
  }}
  className="flex-1 h-12 rounded-2xl bg-[#ffb800] text-black font-black"
>
  Pagar
</button>

        </div>

      </div>

    </div>
  );
}