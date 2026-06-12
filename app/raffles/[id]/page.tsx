"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function raffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [raffle, setRaffle] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const total =
    quantity * (raffle?.ticket_price || 0);

  useEffect(() => {
    async function loadRaffle() {
      const { data } = await supabase
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

      if (data) {
        setRaffle(data);
      }
    }

    if (id) {
      loadRaffle();
    }
  }, [id]);

  if (!raffle) {

   return (

<main className="min-h-screen bg-black text-white"> 
        A carregar...
      </main>
    );
  }

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

                <div className="mt-2 text-3xl font-black">

                  0

                </div>

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

                <span>0 / {raffle.total_tickets} bilhetes vendidos</span>
                <span>0%</span>

              </div>

              <div className="h-4 rounded-full bg-zinc-900 overflow-hidden">

                <div className="h-full w-[0%] bg-[#ffb800]" />

              </div>

            </div>

            {/* BUTTON */}
            <button
 onClick={async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push("/login");
    return;
  }

  setShowModal(true);
}}
  className="mt-10 h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)]"
>
              Comprar Tickets

            </button>

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

          <h2 className="text-3xl font-black uppercase">

            Como Funciona
          </h2>

          <div className="mt-8 grid grid-cols-3 gap-8">

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                01
              </div>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                Compra os bilhetes que desejares para aumentar as tuas hipóteses.
              </p>

            </div>

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                02
              </div>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                Quando o limite for atingido, o sorteio é realizado.
              </p>

            </div>

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                03
              </div>

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

          <div className="mt-8 flex items-center justify-center gap-6">

            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-xl bg-zinc-900 text-white text-2xl font-black"
            >
              -
            </button>

            <div className="text-5xl font-black text-white min-w-[80px] text-center">
              {quantity}
            </div>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-xl bg-zinc-900 text-white text-2xl font-black"
            >
              +
            </button>

          </div>

          <div className="mt-8 text-center">

            <div className="text-zinc-500">
              Total
            </div>

            <div className="mt-2 text-4xl font-black text-[#ffb800]">
              €{total}
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