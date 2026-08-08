"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ListingImage = {
  image_url: string | null;
  sort_order: number | null;
};
type Raffle = {
  id: string;
  model: string;
  brand: string;
  condition: string;
  category: string;
  ticket_price: number;
  total_tickets: number;
  description: string | null;
  listing_images?: ListingImage[] | null;
};
type ReservationResponse = {
  success: boolean;
  message: string;
};
type CheckoutSessionResponse = {
  url?: string;
};
export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paramId = params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [soldTickets, setSoldTickets] = useState<number[]>([]);
  const [reservedTickets, setReservedTickets] = useState<number[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

    useEffect(() => {
    if (!id) {
      return;
    }
let isActive = true;

async function loadRaffle() {
  const { data: raffleData } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        image_url,
        sort_order
      )
    `)
    .eq("id", id)
    .single();

  if (!raffleData || !isActive) {
    return;
  }

  setRaffle(raffleData as Raffle);

  const { data: tickets } = await supabase
    .from("raffle_tickets")
    .select("ticket_number")
    .eq("raffle_id", id);

  if (!tickets || !isActive) {
    return;
  }

  setSoldTickets(
    tickets
      .map((ticket) => ticket.ticket_number)
      .filter(
        (ticketNumber): ticketNumber is number =>
          typeof ticketNumber === "number",
      ),
  );
  const { data: reservations } = await supabase
  .from("raffle_ticket_reservations")
  .select("ticket_number")
  .eq("raffle_id", id)
  .gt("expires_at", new Date().toISOString());

if (reservations && isActive) {
  setReservedTickets(
    reservations
      .map((ticket) => ticket.ticket_number)
      .filter(
        (ticketNumber): ticketNumber is number =>
          typeof ticketNumber === "number",
      ),
  );
}
}

void loadRaffle();

return () => {
  isActive = false;
};
  }, [id]);
  const getValidatedSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
if (!session) {
  router.push("/login");
  return null;
}

return session;
  };
  if (!raffle) {
    return (
      <main className="min-h-screen bg-black text-white">
        A carregar...
      </main>
    );
  }
  
  const soldCount = soldTickets.length;
  const percentage =
    raffle.total_tickets > 0
      ? Math.round((soldCount / raffle.total_tickets) * 100)
      : 0;
  const handleOpenPurchaseModal = async () => {
    const session = await getValidatedSession();
if (!session) {
  return;
}

setShowModal(true);
  };
  const handleCheckout = async () => {
    try {
      const session = await getValidatedSession();
  if (!session) {
    return;
  }

  const reserveResponse = await fetch("/api/reserve-tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      raffleId: raffle.id,
      userId: session.user.id,
      selectedTickets,
    }),
  });

  const reserveData =
    (await reserveResponse.json()) as ReservationResponse;

  if (!reserveData.success) {
    alert(reserveData.message);
    return;
  }

  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      listingId: raffle.id,
      userId: session.user.id,
      selectedTickets,
      quantity: selectedTickets.length,
      ticketPrice: raffle.ticket_price,
    }),
  });

  const data = (await response.json()) as CheckoutSessionResponse;

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Não foi possível iniciar o pagamento.");
  }
} catch (error) {
  console.error(error);
  alert("Erro ao iniciar o checkout.");
}
  };
  return (
    <>
      <main className="min-h-screen bg-black text-white">
        {/* HERO */}
        <section className="max-w-[1480px] mx-auto px-12 py-16">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* IMAGE */}
            <div className="relative rounded-[32px] border border-white/5 bg-zinc-950 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[300px] h-[150px] rounded-full bg-[#ffb800]/20 blur-[120px]" />
          </div>

          <img
            src={
              raffle.listing_images?.[0]?.image_url ||
              "/images/hero/cars/clio-williams.png"
            }
            alt={raffle.model}
            className="relative z-10 w-[75%] mx-auto py-16"
          />
        </div>

        {/* INFO */}
        <div>
          <div className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#ffb800] text-black text-[11px] font-black uppercase tracking-[1px]">
            Sorteio Ativo
          </div>

          <h1 className="mt-6 text-[64px] leading-none font-black italic uppercase tracking-[-3px]">
            {raffle.model}
          </h1>

          <div className="mt-6 flex gap-3 flex-wrap">
            <div className="h-[36px] px-4 rounded-full border border-white/10 bg-zinc-950 flex items-center text-[12px] font-bold">
              {raffle.brand}
            </div>

            <div className="h-[36px] px-4 rounded-full border border-white/10 bg-zinc-950 flex items-center text-[12px] font-bold">
              {raffle.condition}
            </div>

            <div className="h-[36px] px-4 rounded-full border border-white/10 bg-zinc-950 flex items-center text-[12px] font-bold">
              {raffle.category}
            </div>
          </div>

          {/* STATS */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                Ticket
              </div>

              <div className="mt-2 text-3xl font-black text-[#ffb800]">
                €{raffle.ticket_price}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                Vendidos
              </div>

              <div className="mt-2 text-3xl font-black">{soldCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                Limite
              </div>

              <div className="mt-2 text-3xl font-black">
                {raffle.total_tickets}
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-10">
            <div className="flex justify-between text-sm text-zinc-400 mb-3">
              <span>
                {soldCount} / {raffle.total_tickets} bilhetes vendidos
              </span>

              <span>{percentage}%</span>
            </div>

            <div className="h-4 rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-[#ffb800] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* BUTTON */}

<button
  onClick={handleOpenPurchaseModal}
  className="mt-10 h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)]"
>
  Comprar Tickets
</button>

<div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
  <p className="text-sm text-amber-300">
    Após clicar em <strong>Confirmar</strong>, os bilhetes ficam reservados durante
    <strong> 4 minutos</strong> para concluíres o pagamento.
  </p>
</div>

{/* DESCRIÇÃO */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-8">
            <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
              Descrição
            </div>

            <p className="mt-4 text-zinc-300 leading-relaxed">
              {raffle.description}
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* DETAILS */}
    <section className="max-w-[1480px] mx-auto px-12 pb-20">
      <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">
        <h2 className="text-3xl font-black uppercase">Como Funciona</h2>

        <div className="mt-8 grid grid-cols-3 gap-8">
          <div>
            <div className="text-[#ffb800] font-black text-2xl">01</div>

            <p className="mt-3 text-zinc-400 leading-relaxed">
              Compra os bilhetes que desejares para aumentar as tuas
              hipóteses.
            </p>
          </div>

          <div>
            <div className="text-[#ffb800] font-black text-2xl">02</div>

            <p className="mt-3 text-zinc-400 leading-relaxed">
              Quando o limite for atingido, o sorteio é realizado.
            </p>
          </div>

          <div>
            <div className="text-[#ffb800] font-black text-2xl">03</div>

            <p className="mt-3 text-zinc-400 leading-relaxed">
              O vencedor é contactado e recebe a miniatura em casa.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>

  {showModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-zinc-950 p-8">
        <h2 className="text-3xl font-black text-white">
          Comprar Tickets
        </h2>

        <div className="mt-8">
          <div className="grid grid-cols-10 gap-2">
            {Array.from(
              { length: raffle.total_tickets },
              (_, index) => index + 1,
            ).map((number) => {
              const sold = soldTickets.includes(number);
const reserved = reservedTickets.includes(number);
const selected = selectedTickets.includes(number);

              return (
                <button
                  key={number}
                  disabled={sold || reserved}
                  onClick={() => {
                    if (sold || reserved) {
  return;
}

                    setSelectedTickets((currentTickets) =>
                      selected
                        ? currentTickets.filter(
                            (ticketNumber) => ticketNumber !== number,
                          )
                        : [...currentTickets, number],
                    );
                  }}
                  className={`aspect-square rounded-lg text-sm font-black transition-all
                    ${
  sold
    ? "bg-red-600 text-white cursor-not-allowed"
    : reserved
      ? "bg-orange-500 text-white cursor-not-allowed"
      : selected
        ? "bg-[#ffb800] text-black"
        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                >
                  {number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 h-12 rounded-xl border border-white/10 text-white hover:bg-zinc-900"
          >
            Cancelar
          </button>

          <button
            onClick={handleCheckout}
            className="flex-1 h-12 rounded-xl bg-[#ffb800] text-black font-black"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )}
</>
  );
}