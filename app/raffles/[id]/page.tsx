"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ShareButtons from "@/app/components/listing/ShareButtons";

type ListingImage = {
  image_url: string | null;
  sort_order: number | null;
};

type Raffle = {
  id: string;
  user_id: string;
  model: string;
  brand: string;
  condition: string;
  category: string;
  ticket_price: number;
  total_tickets: number;
  description: string | null;
  listing_images?: ListingImage[] | null;
};

type Reservation = {
  ticket_number: number;
  user_id: string;
};

type ReservationResponse = {
  success: boolean;
  message?: string;
};

type CheckoutSessionResponse = {
  url?: string;
  error?: string;
};

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const paramId = params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const [raffle, setRaffle] = useState<Raffle | null>(null);

  const [soldTickets, setSoldTickets] = useState<number[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  /*
   * ============================================================
   * CARREGAR UTILIZADOR + SORTEIO
   * ============================================================
   */

  useEffect(() => {
    if (!id) {
      return;
    }

    let isActive = true;

    async function loadRaffle() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isActive) {
        setCurrentUserId(session?.user?.id ?? null);
      }

      const { data: raffleData, error: raffleError } = await supabase
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

      if (raffleError) {
        console.error("RAFFLE LOAD ERROR:", raffleError);
      }

      if (!raffleData || !isActive) {
        setLoading(false);
        return;
      }

      setRaffle(raffleData as Raffle);

      /*
       * BILHETES VENDIDOS
       */

      const { data: tickets, error: ticketsError } = await supabase
        .from("raffle_tickets")
        .select("ticket_number")
        .eq("raffle_id", id);

      if (ticketsError) {
        console.error("SOLD TICKETS ERROR:", ticketsError);
      }

      if (tickets && isActive) {
        setSoldTickets(
          tickets
            .map((ticket) => ticket.ticket_number)
            .filter(
              (ticketNumber): ticketNumber is number =>
                typeof ticketNumber === "number",
            ),
        );
      }

      /*
       * RESERVAS ATIVAS
       */

      const { data: activeReservations, error: reservationError } =
        await supabase
          .from("raffle_ticket_reservations")
          .select("ticket_number, user_id")
          .eq("raffle_id", id)
          .gt("expires_at", new Date().toISOString());

      if (reservationError) {
        console.error(
          "RESERVATIONS LOAD ERROR:",
          reservationError,
        );
      }

      if (activeReservations && isActive) {
        setReservations(
          activeReservations.filter(
            (reservation): reservation is Reservation =>
              typeof reservation.ticket_number === "number" &&
              typeof reservation.user_id === "string",
          ),
        );
      }

      if (isActive) {
        setLoading(false);
      }
    }

    void loadRaffle();

    return () => {
      isActive = false;
    };
  }, [id]);

  /*
   * ============================================================
   * UTILIZADOR AUTENTICADO
   * ============================================================
   */

  const getValidatedSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return null;
    }

    setCurrentUserId(session.user.id);

    return session;
  };

  /*
   * ============================================================
   * ESTADOS
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-[1480px] px-12 py-20 text-zinc-400">
          A carregar...
        </div>
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-[1480px] px-12 py-20">
          <div className="text-2xl font-black">
            Sorteio não encontrado
          </div>

          <button
            type="button"
            onClick={() => router.push("/raffles")}
            className="mt-6 rounded-xl bg-[#ffb800] px-6 py-3 text-sm font-black uppercase tracking-[1px] text-black"
          >
            Voltar aos Sorteios
          </button>
        </div>
      </main>
    );
  }

  const soldCount = soldTickets.length;

  const percentage =
    raffle.total_tickets > 0
      ? Math.round((soldCount / raffle.total_tickets) * 100)
      : 0;

  const isOwner =
    !!currentUserId && currentUserId === raffle.user_id;

  const isTicketSold = (ticketNumber: number) =>
    soldTickets.includes(ticketNumber);

  const getReservation = (ticketNumber: number) =>
    reservations.find(
      (reservation) =>
        reservation.ticket_number === ticketNumber,
    );

  const isTicketReserved = (ticketNumber: number) =>
    !!getReservation(ticketNumber);

  const isTicketReservedByCurrentUser = (
    ticketNumber: number,
  ) => {
    const reservation = getReservation(ticketNumber);

    return (
      !!reservation &&
      !!currentUserId &&
      reservation.user_id === currentUserId
    );
  };

  const handleOpenPurchaseModal = async () => {
    const session = await getValidatedSession();

    if (!session) {
      return;
    }

    if (isOwner) {
      alert(
        "Não podes comprar bilhetes do teu próprio sorteio.",
      );
      return;
    }

    setSelectedTickets([]);
    setShowModal(true);
  };

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

  const handleCheckout = async () => {
    if (checkoutLoading) {
      return;
    }

    if (selectedTickets.length === 0) {
      alert("Seleciona pelo menos um bilhete.");
      return;
    }

    if (isOwner) {
      alert(
        "Não podes comprar bilhetes do teu próprio sorteio.",
      );
      return;
    }

    try {
      setCheckoutLoading(true);

      const session = await getValidatedSession();

      if (!session) {
        setCheckoutLoading(false);
        return;
      }

      /*
       * 1. RESERVAR BILHETES
       */

      const reserveResponse = await fetch(
        "/api/reserve-tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            raffleId: raffle.id,
            selectedTickets,
          }),
        },
      );

      const reserveData =
        (await reserveResponse.json()) as ReservationResponse;

      if (!reserveResponse.ok || !reserveData.success) {
        alert(
          reserveData.message ||
            "Não foi possível reservar os bilhetes.",
        );

        setCheckoutLoading(false);
        return;
      }

      /*
       * 2. CRIAR CHECKOUT STRIPE
       *
       * O backend determina o utilizador e o preço.
       */

      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            listingId: raffle.id,
            selectedTickets,
          }),
        },
      );

      const data =
        (await response.json()) as CheckoutSessionResponse;

      if (!response.ok || !data.url) {
        console.error(
          "CHECKOUT ERROR:",
          data.error,
        );

        alert(
          data.error ||
            "Não foi possível iniciar o pagamento. As reservas serão libertadas automaticamente.",
        );

        /*
         * As reservas permanecem protegidas pelo backend
         * durante o período definido e expiram automaticamente.
         */

        setCheckoutLoading(false);
        return;
      }

      /*
       * 3. IR PARA STRIPE
       */

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "CHECKOUT FLOW ERROR:",
        error,
      );

      alert(
        "Ocorreu um erro ao iniciar o pagamento. As reservas serão libertadas automaticamente.",
      );

      setCheckoutLoading(false);
    }
  };

  /*
   * ============================================================
   * CANCELAR MODAL
   * ============================================================
   */

  const handleCloseModal = () => {
    if (checkoutLoading) {
      return;
    }

    setSelectedTickets([]);
    setShowModal(false);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      <main className="min-h-screen bg-black text-white">

        {/* HERO */}

        <section className="mx-auto max-w-[1480px] px-12 py-10">

          {/* BACK */}

          <button
            type="button"
            onClick={() => router.push("/raffles")}
            className="mb-8 inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[1px] text-zinc-400 transition hover:text-[#ffb800]"
          >
            ← Voltar aos Sorteios
          </button>

          <div className="grid grid-cols-2 items-center gap-12">

            {/* IMAGE */}

            <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-zinc-950">

              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="h-[150px] w-[300px] rounded-full bg-[#ffb800]/20 blur-[120px]" />

              </div>

              <img
                src={
                  raffle.listing_images?.[0]?.image_url ||
                  "/images/hero/cars/clio-williams.png"
                }
                alt={raffle.model}
                className="relative z-10 mx-auto w-[75%] py-16"
              />

            </div>

            {/* INFO */}

            <div>

              <div className="inline-flex h-[36px] items-center rounded-full bg-[#ffb800] px-4 text-[11px] font-black uppercase tracking-[1px] text-black">
                Sorteio Ativo
              </div>

              <h1 className="mt-6 text-[64px] font-black italic uppercase leading-none tracking-[-3px]">
                {raffle.model}
              </h1>

              <div className="mt-6 flex flex-wrap gap-3">

                <div className="flex h-[36px] items-center rounded-full border border-white/10 bg-zinc-950 px-4 text-[12px] font-bold">
                  {raffle.brand}
                </div>

                <div className="flex h-[36px] items-center rounded-full border border-white/10 bg-zinc-950 px-4 text-[12px] font-bold">
                  {raffle.condition}
                </div>

                <div className="flex h-[36px] items-center rounded-full border border-white/10 bg-zinc-950 px-4 text-[12px] font-bold">
                  {raffle.category}
                </div>

              </div>

              <ShareButtons
                title={`${raffle.brand} ${raffle.model}`}
                className="mt-6"
              />

              {/* OWNER NOTICE */}

              {isOwner && (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">

                  <div className="text-sm font-black uppercase tracking-[1px] text-amber-300">
                    O teu sorteio
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-amber-200/80">
                    Não podes comprar bilhetes do teu próprio sorteio.
                  </p>

                </div>
              )}

              {/* STATS */}

              <div className="mt-10 grid grid-cols-3 gap-4">

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                  <div className="text-xs font-bold uppercase tracking-[2px] text-zinc-500">
                    Ticket
                  </div>

                  <div className="mt-2 text-3xl font-black text-[#ffb800]">
                    €{raffle.ticket_price}
                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                  <div className="text-xs font-bold uppercase tracking-[2px] text-zinc-500">
                    Vendidos
                  </div>

                  <div className="mt-2 text-3xl font-black">
                    {soldCount}
                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                  <div className="text-xs font-bold uppercase tracking-[2px] text-zinc-500">
                    Limite
                  </div>

                  <div className="mt-2 text-3xl font-black">
                    {raffle.total_tickets}
                  </div>

                </div>

              </div>

              {/* PROGRESS */}

              <div className="mt-10">

                <div className="mb-3 flex justify-between text-sm text-zinc-400">

                  <span>
                    {soldCount} / {raffle.total_tickets} bilhetes vendidos
                  </span>

                  <span>
                    {percentage}%
                  </span>

                </div>

                <div className="h-4 overflow-hidden rounded-full bg-zinc-900">

                  <div
                    className="h-full bg-[#ffb800] transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>

              {/* BUTTON */}

              <button
                type="button"
                onClick={handleOpenPurchaseModal}
                disabled={isOwner || soldCount >= raffle.total_tickets}
                className={`mt-10 h-[60px] rounded-2xl px-10 font-black uppercase tracking-[1px] transition-all duration-300 ${
                  isOwner || soldCount >= raffle.total_tickets
                    ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
                    : "bg-[#ffb800] text-black shadow-[0_0_50px_rgba(255,184,0,0.2)] hover:bg-[#ffc933]"
                }`}
              >
                {isOwner
                  ? "O teu sorteio"
                  : soldCount >= raffle.total_tickets
                    ? "Sorteio Esgotado"
                    : "Comprar Tickets"}
              </button>

              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">

                <p className="text-sm text-amber-300">
                  Após clicar em{" "}
                  <strong>Confirmar</strong>, os bilhetes ficam
                  reservados durante{" "}
                  <strong>4 minutos</strong> para concluíres o
                  pagamento.
                </p>

              </div>

              {/* DESCRIÇÃO */}

              <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-8">

                <div className="text-xs font-bold uppercase tracking-[2px] text-zinc-500">
                  Descrição
                </div>

                <p className="mt-4 leading-relaxed text-zinc-300">
                  {raffle.description}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* DETAILS */}

        <section className="mx-auto max-w-[1480px] px-12 pb-20">

          <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

            <h2 className="text-3xl font-black uppercase">
              Como Funciona
            </h2>

            <div className="mt-8 grid grid-cols-3 gap-8">

              <div>

                <div className="text-2xl font-black text-[#ffb800]">
                  01
                </div>

                <p className="mt-3 leading-relaxed text-zinc-400">
                  Compra os bilhetes que desejares para aumentar
                  as tuas hipóteses.
                </p>

              </div>

              <div>

                <div className="text-2xl font-black text-[#ffb800]">
                  02
                </div>

                <p className="mt-3 leading-relaxed text-zinc-400">
                  Quando o limite for atingido, o sorteio é
                  realizado.
                </p>

              </div>

              <div>

                <div className="text-2xl font-black text-[#ffb800]">
                  03
                </div>

                <p className="mt-3 leading-relaxed text-zinc-400">
                  O vencedor é contactado e recebe a miniatura em
                  casa.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* PURCHASE MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-zinc-950 p-8">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-3xl font-black text-white">
                  Comprar Tickets
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Seleciona os bilhetes que queres comprar.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={checkoutLoading}
                className="text-2xl leading-none text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Fechar"
              >
                ×
              </button>

            </div>

            {/* TICKET GRID */}

            <div className="mt-8">

              <div className="grid grid-cols-10 gap-2">

                {Array.from(
                  {
                    length: raffle.total_tickets,
                  },
                  (_, index) => index + 1,
                ).map((number) => {

                  const sold =
                    isTicketSold(number);

                  const reserved =
                    isTicketReserved(number);

                  const reservedByMe =
                    isTicketReservedByCurrentUser(number);

                  const selected =
                    selectedTickets.includes(number);

                  let ticketClass =
                    "bg-zinc-900 text-white hover:bg-zinc-800";

                  if (sold) {
                    ticketClass =
                      "cursor-not-allowed bg-red-600 text-white";
                  } else if (reservedByMe) {
                    ticketClass =
                      "cursor-not-allowed bg-blue-600 text-white";
                  } else if (reserved) {
                    ticketClass =
                      "cursor-not-allowed bg-orange-500 text-white";
                  } else if (selected) {
                    ticketClass =
                      "bg-[#ffb800] text-black";
                  }

                  return (
                    <button
                      key={number}
                      type="button"
                      disabled={
                        sold ||
                        reserved ||
                        checkoutLoading
                      }
                      onClick={() => {

                        if (
                          sold ||
                          reserved ||
                          checkoutLoading
                        ) {
                          return;
                        }

                        setSelectedTickets(
                          (currentTickets) =>
                            selected
                              ? currentTickets.filter(
                                  (ticketNumber) =>
                                    ticketNumber !== number,
                                )
                              : [
                                  ...currentTickets,
                                  number,
                                ],
                        );

                      }}
                      className={`aspect-square rounded-lg text-sm font-black transition-all ${ticketClass}`}
                    >
                      {number}
                    </button>
                  );
                })}

              </div>

              {/* LEGEND */}

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-zinc-500">

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-zinc-800" />
                  Disponível
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#ffb800]" />
                  Selecionado
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-orange-500" />
                  Reservado
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-red-600" />
                  Vendido
                </div>

              </div>

            </div>

            {/* SELECTION INFO */}

            <div className="mt-6 rounded-xl border border-white/5 bg-black p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-zinc-500">
                  Bilhetes selecionados
                </span>

                <span className="font-black text-white">
                  {selectedTickets.length}
                </span>

              </div>

              <div className="mt-2 flex items-center justify-between">

                <span className="text-sm text-zinc-500">
                  Total
                </span>

                <span className="text-xl font-black text-[#ffb800]">
                  €
                  {(
                    selectedTickets.length *
                    Number(raffle.ticket_price)
                  ).toFixed(2)}
                </span>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex gap-4">

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={checkoutLoading}
                className="h-12 flex-1 rounded-xl border border-white/10 text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  selectedTickets.length === 0 ||
                  checkoutLoading
                }
                className={`h-12 flex-1 rounded-xl font-black transition ${
                  selectedTickets.length === 0 ||
                  checkoutLoading
                    ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
                    : "bg-[#ffb800] text-black hover:bg-[#ffc933]"
                }`}
              >
                {checkoutLoading
                  ? "A preparar..."
                  : "Confirmar"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}
