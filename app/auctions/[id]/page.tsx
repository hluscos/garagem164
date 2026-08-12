"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Listing = {
  id: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  condition: string | null;
  listing_type: string;
  starting_bid: number | null;
  duration_days: number | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
};

type ListingImage = {
  image_url: string;
  sort_order: number | null;
};

type Bid = {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
};

function getEndTime(
  createdAt: string,
  durationDays: number,
) {
  return (
    new Date(createdAt).getTime() +
    durationDays *
      24 *
      60 *
      60 *
      1000
  );
}

function formatCountdown(
  endTime: number,
  now: number,
) {
  const remaining = Math.max(
    0,
    endTime - now,
  );

  const totalSeconds = Math.floor(
    remaining / 1000,
  );

  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  return {
    finished: remaining <= 0,
    days,
    hours,
    minutes,
    seconds,
  };
}

function formatMoney(value: number) {
  return `€${value.toFixed(2)}`;
}

function maskUserId(userId: string) {
  if (!userId) {
    return "Utilizador";
  }

  return `Utilizador ${userId
    .slice(0, 4)
    .toUpperCase()}`;
}

function formatBidTime(date: string) {
  return new Date(date).toLocaleTimeString(
    "pt-PT",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const auctionId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [images, setImages] =
    useState<ListingImage[]>([]);

  const [bids, setBids] =
    useState<Bid[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [bidLoading, setBidLoading] =
    useState(false);

  const [bidMessage, setBidMessage] =
    useState("");

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [checkoutMessage, setCheckoutMessage] =
    useState("");

  const [paymentChecking, setPaymentChecking] =
    useState(true);

  const [paymentCompleted, setPaymentCompleted] =
    useState(false);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [now, setNow] =
    useState(Date.now());

  /*
   * ---------------------------------------------------------
   * COUNTDOWN
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () =>
      clearInterval(interval);
  }, []);

  /*
   * ---------------------------------------------------------
   * UTILIZADOR ATUAL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function loadCurrentUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUserId(
        session?.user?.id ?? null,
      );

      if (!session?.user?.id) {
        setPaymentChecking(false);
      }
    }

    void loadCurrentUser();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUserId(
          session?.user?.id ?? null,
        );

        if (!session?.user?.id) {
          setPaymentCompleted(false);
          setPaymentChecking(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * VERIFICAR PAGAMENTO
   * ---------------------------------------------------------
   */

  async function loadPaymentStatus(
    userId: string | null,
  ) {
    if (!auctionId || !userId) {
      setPaymentCompleted(false);
      setPaymentChecking(false);
      return;
    }

    try {
      setPaymentChecking(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPaymentCompleted(false);
        return;
      }

      const response = await fetch(
        `/api/auction-payment-status?auctionId=${encodeURIComponent(auctionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "AUCTION PAYMENT STATUS API ERROR:",
          result,
        );

        setPaymentCompleted(false);
        return;
      }

      setPaymentCompleted(
        result.paid === true,
      );
    } catch (err) {
      console.error(
        "LOAD PAYMENT STATUS ERROR:",
        err,
      );

      setPaymentCompleted(false);
    } finally {
      setPaymentChecking(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * VERIFICAR PAGAMENTO QUANDO TEMOS O UTILIZADOR
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    void loadPaymentStatus(
      currentUserId,
    );
  }, [
    auctionId,
    currentUserId,
  ]);

  /*
   * ---------------------------------------------------------
   * CARREGAR LANCES
   * ---------------------------------------------------------
   */

  async function loadBids() {
    if (!auctionId) {
      return;
    }

    const {
      data: bidData,
      error: bidError,
    } = await supabase
      .from("auction_bids")
      .select(
        `
          id,
          auction_id,
          user_id,
          amount,
          created_at
        `,
      )
      .eq(
        "auction_id",
        auctionId,
      )
      .order("amount", {
        ascending: false,
      });

    if (bidError) {
      console.error(
        "AUCTION BIDS ERROR:",
        bidError,
      );

      return;
    }

    setBids(
      (bidData ?? []) as Bid[],
    );
  }

  /*
   * ---------------------------------------------------------
   * CARREGAR LEILÃO
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    async function loadAuction() {
      try {
        setLoading(true);
        setError("");

        const {
          data: listingData,
          error: listingError,
        } = await supabase
          .from("listings")
          .select(
            `
              id,
              brand,
              model,
              category,
              condition,
              listing_type,
              starting_bid,
              duration_days,
              description,
              created_at,
              user_id
            `,
          )
          .eq("id", auctionId)
          .maybeSingle();

        if (listingError) {
          console.error(
            "AUCTION DETAIL LISTING ERROR:",
            listingError,
          );

          setError(
            "Não foi possível carregar o leilão.",
          );

          return;
        }

        if (!listingData) {
          setError(
            "Leilão não encontrado.",
          );

          return;
        }

        if (
          listingData.listing_type !==
          "auction"
        ) {
          setError(
            "Este anúncio não é um leilão.",
          );

          return;
        }

        setListing(
          listingData as Listing,
        );

        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from("listing_images")
          .select(
            "image_url, sort_order",
          )
          .eq(
            "listing_id",
            auctionId,
          )
          .order("sort_order", {
            ascending: true,
          });

        if (imageError) {
          console.error(
            "AUCTION IMAGES ERROR:",
            imageError,
          );
        }

        setImages(
          (imageData ??
            []) as ListingImage[],
        );

        await loadBids();
      } catch (err) {
        console.error(
          "AUCTION DETAIL ERROR:",
          err,
        );

        setError(
          "Ocorreu um erro ao carregar o leilão.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuction();
  }, [auctionId]);

  /*
   * ---------------------------------------------------------
   * DADOS CALCULADOS
   * ---------------------------------------------------------
   */

  const mainImage = useMemo(() => {
    if (images.length === 0) {
      return "/images/hero/cars/porsche-gt3rs.png";
    }

    return images[0].image_url;
  }, [images]);

  const currentBid = useMemo<
    number | null
  >(() => {
    if (bids.length === 0) {
      return null;
    }

    return Math.max(
      ...bids.map((bid) =>
        Number(bid.amount),
      ),
    );
  }, [bids]);

  const winningBid = useMemo<
    Bid | null
  >(() => {
    if (bids.length === 0) {
      return null;
    }

    return bids[0];
  }, [bids]);

  const isWinner =
    Boolean(
      winningBid &&
        currentUserId &&
        winningBid.user_id ===
          currentUserId,
    );

  const minimumNextBid =
    currentBid === null
      ? Number(
          listing?.starting_bid ?? 0,
        )
      : currentBid + 1;

  const endTime = listing
    ? getEndTime(
        listing.created_at,
        Number(
          listing.duration_days ?? 0,
        ),
      )
    : 0;

  const countdown =
    formatCountdown(
      endTime,
      now,
    );

  /*
   * ---------------------------------------------------------
   * LICITAR
   * ---------------------------------------------------------
   */

  async function handleBid() {
    if (!auctionId || !listing) {
      return;
    }

    if (countdown.finished) {
      setBidMessage(
        "Este leilão já terminou.",
      );

      return;
    }

    if (minimumNextBid <= 0) {
      setBidMessage(
        "Valor de licitação inválido.",
      );

      return;
    }

    try {
      setBidLoading(true);
      setBidMessage("");

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push(
          `/login?redirect=/auctions/${auctionId}`,
        );

        return;
      }

      const response = await fetch(
        "/api/place-bid",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            auctionId,
            amount: minimumNextBid,
          }),
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        setBidMessage(
          result.message ||
            "Não foi possível registar a licitação.",
        );

        return;
      }

      setBidMessage(
        `Licitação de ${formatMoney(
          Number(result.bid.amount),
        )} registada com sucesso.`,
      );

      await loadBids();
    } catch (err) {
      console.error(
        "HANDLE BID ERROR:",
        err,
      );

      setBidMessage(
        "Ocorreu um erro ao registar a licitação.",
      );
    } finally {
      setBidLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * PAGAR LEILÃO
   * ---------------------------------------------------------
   */

  async function handleAuctionPayment() {
    if (!auctionId || !listing) {
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutMessage("");

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push(
          `/login?redirect=/auctions/${auctionId}`,
        );

        return;
      }

      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            type: "auction",
            listingId: auctionId,
          }),
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.url
      ) {
        setCheckoutMessage(
          result.error ||
            "Não foi possível iniciar o pagamento.",
        );

        return;
      }

      window.location.href =
        result.url;
    } catch (err) {
      console.error(
        "AUCTION CHECKOUT ERROR:",
        err,
      );

      setCheckoutMessage(
        "Ocorreu um erro ao iniciar o pagamento.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">

        <section className="max-w-[1480px] mx-auto px-12 py-20">

          <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-12 text-center">

            <div className="text-xl font-black">
              A carregar leilão...
            </div>

          </div>

        </section>

      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-black text-white">

        <section className="max-w-[1480px] mx-auto px-12 py-20">

          <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-12 text-center">

            <div className="text-2xl font-black text-red-400">
              {error ||
                "Leilão não encontrado."}
            </div>

          </div>

        </section>

      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * PÁGINA
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO / DETAIL */}

      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* IMAGE */}

          <div className="relative rounded-[32px] border border-white/5 bg-zinc-950 overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="w-[300px] h-[150px] rounded-full bg-[#ffb800]/20 blur-[120px]" />

            </div>

            <div className="relative z-10 flex min-h-[520px] items-center justify-center px-10 py-12">

              <img
                src={mainImage}
                alt={
                  listing.model ||
                  "Miniatura"
                }
                className="max-h-[430px] max-w-[90%] object-contain"
              />

            </div>

          </div>

          {/* INFO */}

          <div>

            {/* STATUS */}

            <div
              className={`inline-flex items-center h-[36px] px-4 rounded-full text-black text-[11px] font-black uppercase tracking-[1px] ${
                countdown.finished
                  ? "bg-zinc-400"
                  : "bg-[#ffb800]"
              }`}
            >
              {countdown.finished
                ? "Leilão Terminado"
                : "Leilão Ativo"}
            </div>

            <div className="mt-6 text-zinc-500 text-xs uppercase tracking-[3px] font-black">

              {listing.brand ||
                "Garagem164"}

            </div>

            <h1 className="mt-3 text-[56px] lg:text-[64px] leading-none font-black italic uppercase tracking-[-3px]">

              {listing.model ||
                "Miniatura"}

            </h1>

            {listing.description && (
              <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-[600px]">
                {listing.description}
              </p>
            )}

            {/* STATS */}

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  {countdown.finished
                    ? "Lance Vencedor"
                    : currentBid === null
                      ? "Lance Inicial"
                      : "Licitação Atual"}

                </div>

                <div className="mt-2 text-3xl font-black text-[#ffb800]">

                  {formatMoney(
                    currentBid === null
                      ? Number(
                          listing.starting_bid ??
                            0,
                        )
                      : currentBid,
                  )}

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                  Licitações
                </div>

                <div className="mt-2 text-3xl font-black">
                  {bids.length}
                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  {countdown.finished
                    ? "Estado"
                    : "Próximo Lance"}

                </div>

                <div className="mt-2 text-3xl font-black text-[#ffb800]">

                  {countdown.finished
                    ? "Terminado"
                    : formatMoney(
                        minimumNextBid,
                      )}

                </div>

              </div>

            </div>

            {/* COUNTDOWN / RESULTADO */}

            <div className="mt-10">

              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                {countdown.finished
                  ? "Resultado"
                  : "Termina em"}

              </div>

              {!countdown.finished ? (

                <div className="mt-3 text-[42px] font-black text-[#ffb800]">

                  {countdown.days}d{" "}
                  {countdown.hours
                    .toString()
                    .padStart(
                      2,
                      "0",
                    )}
                  h{" "}
                  {countdown.minutes
                    .toString()
                    .padStart(
                      2,
                      "0",
                    )}
                  m{" "}
                  {countdown.seconds
                    .toString()
                    .padStart(
                      2,
                      "0",
                    )}
                  s

                </div>

              ) : (

                <div className="mt-4 rounded-2xl border border-[#ffb800]/20 bg-[#ffb800]/5 p-6">

                  {winningBid ? (

                    <>
                      <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                        Vencedor
                      </div>

                      <div className="mt-2 text-2xl font-black">
                        {maskUserId(
                          winningBid.user_id,
                        )}
                      </div>

                      <div className="mt-4 text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                        Lance Vencedor
                      </div>

                      <div className="mt-1 text-3xl font-black text-[#ffb800]">
                        {formatMoney(
                          Number(
                            winningBid.amount,
                          ),
                        )}
                      </div>
                    </>

                  ) : (

                    <div>

                      <div className="text-xl font-black">
                        Leilão terminado
                      </div>

                      <div className="mt-2 text-zinc-500">
                        Não foram registadas licitações.
                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

            {/* ACTION BUTTON */}

            {countdown.finished ? (

              winningBid && isWinner ? (

                paymentChecking ? (

                  <button
                    type="button"
                    disabled
                    className="mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl bg-zinc-700 text-zinc-400 cursor-not-allowed font-black uppercase tracking-[1px]"
                  >
                    A verificar pagamento...
                  </button>

                ) : paymentCompleted ? (

                  <div className="mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-black uppercase tracking-[1px]">
                    Pagamento Concluído
                  </div>

                ) : (

                  <button
                    type="button"
                    onClick={
                      handleAuctionPayment
                    }
                    disabled={
                      checkoutLoading
                    }
                    className={`mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)] transition-all duration-300 ${
                      checkoutLoading
                        ? "cursor-not-allowed bg-zinc-700 text-zinc-400 shadow-none"
                        : "bg-[#ffb800] text-black hover:bg-[#ffc933]"
                    }`}
                  >
                    {checkoutLoading
                      ? "A preparar pagamento..."
                      : `Pagar ${formatMoney(
                          Number(
                            winningBid.amount,
                          ),
                        )}`}
                  </button>

                )

              ) : (

                <button
                  type="button"
                  disabled
                  className="mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl bg-zinc-700 text-zinc-400 cursor-not-allowed font-black uppercase tracking-[1px]"
                >
                  Leilão Terminado
                </button>

              )

            ) : (

              <button
                type="button"
                onClick={handleBid}
                disabled={bidLoading}
                className={`mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)] transition-all duration-300 ${
                  bidLoading
                    ? "cursor-not-allowed bg-zinc-700 text-zinc-400 shadow-none"
                    : "bg-[#ffb800] text-black hover:bg-[#ffc933]"
                }`}
              >

                {bidLoading
                  ? "A registar..."
                  : `Licitar ${formatMoney(
                      minimumNextBid,
                    )}`}

              </button>

            )}

            {/* BID MESSAGE */}

            {bidMessage && (
              <div
                className={`mt-4 rounded-xl border p-4 text-sm font-bold ${
                  bidMessage.includes(
                    "sucesso",
                  )
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {bidMessage}
              </div>
            )}

            {/* CHECKOUT MESSAGE */}

            {checkoutMessage && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
                {checkoutMessage}
              </div>
            )}

          </div>

        </div>

      </section>

      {/* BID HISTORY */}

      <section className="max-w-[1480px] mx-auto px-12 pb-20">

        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

          <h2 className="text-3xl font-black uppercase">
            Últimas Licitações
          </h2>

          {bids.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-8 text-center">

              <div className="text-zinc-400">
                Ainda não existem licitações.
              </div>

              <div className="mt-2 text-sm text-zinc-600">

                O primeiro lance será de{" "}

                <span className="font-bold text-[#ffb800]">
                  {formatMoney(
                    minimumNextBid,
                  )}
                </span>

              </div>

            </div>

          ) : (

            <div className="mt-8">

              <div className="grid grid-cols-3 pb-4 border-b border-white/10 text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                <div>
                  Utilizador
                </div>

                <div className="text-center">
                  Valor
                </div>

                <div className="text-right">
                  Hora
                </div>

              </div>

              {bids.map((bid) => (

                <div
                  key={bid.id}
                  className="grid grid-cols-3 py-5 border-b border-white/5 last:border-b-0"
                >

                  <div className="text-zinc-300">
                    {maskUserId(
                      bid.user_id,
                    )}
                  </div>

                  <div className="text-center text-[#ffb800] font-black">
                    {formatMoney(
                      Number(
                        bid.amount,
                      ),
                    )}
                  </div>

                  <div className="text-right text-zinc-500">
                    {formatBidTime(
                      bid.created_at,
                    )}
                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}