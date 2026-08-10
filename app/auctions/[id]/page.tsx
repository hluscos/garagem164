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

function formatCountdown(endTime: number) {
  const remaining = Math.max(
    0,
    endTime - Date.now(),
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

        /*
         * LISTING
         */

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

        /*
         * IMAGENS
         */

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

        /*
         * LANCES
         */

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

  /*
   * Se não existem lances:
   * currentBid = null
   *
   * O starting_bid não é um lance.
   */

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

  /*
   * Primeiro lance:
   * starting_bid
   *
   * Lances seguintes:
   * currentBid + €1
   */

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

  /*
   * now é usado para forçar a atualização
   * do countdown a cada segundo.
   */

  void now;

  const countdown =
    formatCountdown(endTime);

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

      /*
       * Obter a sessão atual.
       */

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

      /*
       * Enviar o lance para o backend.
       */

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

      /*
       * ERRO
       */

      if (!response.ok || !result.success) {
        setBidMessage(
          result.message ||
            "Não foi possível registar a licitação.",
        );

        return;
      }

      /*
       * SUCESSO
       */

      setBidMessage(
        `Licitação de ${formatMoney(
          Number(result.bid.amount),
        )} registada com sucesso.`,
      );

      /*
       * Atualizar imediatamente o
       * histórico e os valores.
       */

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

            <div className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#ffb800] text-black text-[11px] font-black uppercase tracking-[1px]">

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
                  {currentBid === null
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
                  Próximo Lance
                </div>

                <div className="mt-2 text-3xl font-black text-[#ffb800]">
                  {formatMoney(
                    minimumNextBid,
                  )}
                </div>

              </div>

            </div>

            {/* COUNTDOWN */}

            <div className="mt-10">

              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
                {countdown.finished
                  ? "Estado"
                  : "Termina em"}
              </div>

              <div className="mt-3 text-[42px] font-black text-[#ffb800]">

                {countdown.finished ? (
                  "Terminado"
                ) : (
                  <>
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
                  </>
                )}

              </div>

            </div>

            {/* BID BUTTON */}

            <button
              type="button"
              onClick={handleBid}
              disabled={
                countdown.finished ||
                bidLoading
              }
              className={`mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)] transition-all duration-300 ${
                countdown.finished ||
                bidLoading
                  ? "cursor-not-allowed bg-zinc-700 text-zinc-400 shadow-none"
                  : "bg-[#ffb800] text-black hover:bg-[#ffc933]"
              }`}
            >

              {countdown.finished
                ? "Leilão Terminado"
                : bidLoading
                  ? "A registar..."
                  : `Licitar ${formatMoney(
                      minimumNextBid,
                    )}`}

            </button>

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