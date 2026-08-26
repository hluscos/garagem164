"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type Auction = {
  id: string;
  brand: string | null;
  model: string | null;
  starting_bid: number | null;
  duration_days: number | null;
  created_at: string;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

type AuctionWithBid = Auction & {
  currentBid: number;
};

const featuredAuctionBrands = [
  "Hot Wheels",
  "Mini GT",
  "Inno64",
  "Tarmac Works",
  "Matchbox",
  "Greenlight",
  "Johnny Lightning",
  "Kaido House",
  "Pop Race",
  "M2 Machines",
  "Auto World",
  "RLC",
];

const brandLogoByName: Record<string, string> = {
  "Hot Wheels": "/images/brands/hotwheels.png",
  "Mini GT": "/images/brands/minigt.png",
  Inno64: "/images/brands/inno64.png",
  "Tarmac Works": "/images/brands/tarmac.png",
  Matchbox: "/images/brands/matchbox.png",
  Greenlight: "/images/brands/greenlight.png",
  "Johnny Lightning": "/images/brands/johnnylightning.png",
  "Pop Race": "/images/brands/poprace.png",
};

function getEndTime(
  createdAt: string,
  durationDays: number,
) {
  return (
    new Date(createdAt).getTime() +
    durationDays * 24 * 60 * 60 * 1000
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

  if (days > 0) {
    return `${days}d ${hours
      .toString()
      .padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  }

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function AuctionCountdown({
  endTime,
}: {
  endTime: number;
}) {
  const [countdown, setCountdown] =
    useState(() =>
      formatCountdown(endTime),
    );

  useEffect(() => {
    function updateCountdown() {
      setCountdown(
        formatCountdown(endTime),
      );
    }

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000,
    );

    return () =>
      clearInterval(interval);
  }, [endTime]);

  const finished =
    countdown === "00:00:00";

  return (
    <div
      className={`absolute top-4 right-4 h-[32px] px-4 rounded-full backdrop-blur-xl border flex items-center justify-center text-[11px] font-black uppercase tracking-[1px] ${
        finished
          ? "bg-red-600/90 border-red-500 text-white"
          : "bg-black/70 border-white/10 text-white"
      }`}
    >
      {finished
        ? "Terminado"
        : countdown}
    </div>
  );
}

export default function AuctionsPage() {
  const [auctions, setAuctions] =
    useState<AuctionWithBid[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeBrand, setActiveBrand] =
    useState("Todos");

  useEffect(() => {
    async function loadAuctions() {
      try {
        setLoading(true);
        setError("");

        /*
         * -----------------------------------------------------
         * 1. BUSCAR LEILÕES
         * -----------------------------------------------------
         */

        const {
          data: listings,
          error: listingsError,
        } = await supabase
          .from("listings")
          .select(
            `
              id,
              brand,
              model,
              starting_bid,
              duration_days,
              created_at,
              listing_images (
                image_url,
                sort_order
              )
            `,
          )
          .eq(
            "listing_type",
            "auction",
          )
          .order("created_at", {
            ascending: false,
          });

        if (listingsError) {
          console.error(
            "AUCTIONS ERROR:",
            listingsError,
          );

          setError(
            "Não foi possível carregar os leilões.",
          );

          return;
        }

        const auctionData =
          (listings ?? []) as Auction[];

        if (auctionData.length === 0) {
          setAuctions([]);
          return;
        }

        /*
         * -----------------------------------------------------
         * 2. BUSCAR LANCES
         * -----------------------------------------------------
         */

        const auctionIds =
          auctionData.map(
            (auction) => auction.id,
          );

        const {
          data: bids,
          error: bidsError,
        } = await supabase
          .from("auction_bids")
          .select(
            "auction_id, amount",
          )
          .in(
            "auction_id",
            auctionIds,
          );

        if (bidsError) {
          console.error(
            "AUCTION BIDS ERROR:",
            bidsError,
          );
        }

        /*
         * -----------------------------------------------------
         * 3. CALCULAR MAIOR LANCE
         * -----------------------------------------------------
         */

        const highestBids: Record<
          string,
          number
        > = {};

        (bids ?? []).forEach(
          (bid) => {
            const auctionId =
              bid.auction_id;

            const amount =
              Number(bid.amount);

            if (
              !Number.isFinite(amount)
            ) {
              return;
            }

            if (
              highestBids[
                auctionId
              ] === undefined ||
              amount >
                highestBids[
                  auctionId
                ]
            ) {
              highestBids[
                auctionId
              ] = amount;
            }
          },
        );

        /*
         * -----------------------------------------------------
         * 4. PREPARAR LEILÕES
         * -----------------------------------------------------
         */

        const now = Date.now();

        const finalAuctions =
          auctionData
            .map((auction) => {
              const startingBid =
                Number(
                  auction.starting_bid ??
                    0,
                );

              const currentBid =
                highestBids[
                  auction.id
                ] ??
                startingBid;

              const endTime =
                getEndTime(
                  auction.created_at,
                  Number(
                    auction.duration_days ??
                      0,
                  ),
                );

              return {
                ...auction,
                currentBid,
                endTime,
              };
            })
            .filter(
              (auction) =>
                auction.endTime > now,
            )
            .sort(
              (a, b) =>
                a.endTime -
                b.endTime,
            );

        setAuctions(
          finalAuctions,
        );
      } catch (err) {
        console.error(
          "LOAD AUCTIONS ERROR:",
          err,
        );

        setError(
          "Ocorreu um erro ao carregar os leilões.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuctions();
  }, []);

  const brands = [
    "Todos",
    ...Array.from(
      new Set(
        [
          ...featuredAuctionBrands,
          ...auctions
            .map((auction) => auction.brand?.trim())
            .filter((brand): brand is string => Boolean(brand)),
        ],
      ),
    ),
  ];

  const filteredAuctions =
    activeBrand === "Todos"
      ? auctions
      : auctions.filter(
          (auction) => auction.brand?.trim() === activeBrand,
        );

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}

      <section className="relative h-[340px] border-b border-white/5 overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/images/hero/backgrounds/auction-bg.webp"
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">

          <div className="w-[500px] h-[220px] rounded-full bg-[#ffb800]/10 blur-[140px]" />

        </div>

        <div className="relative z-10 max-w-[1480px] mx-auto px-12 h-full flex flex-col justify-center">

          <div className="text-[#ffb800] text-[12px] font-black uppercase tracking-[4px]">
            Garagem164
          </div>

          <h1 className="mt-4 text-[68px] leading-none font-black italic uppercase tracking-[-4px]">
            Leilões
          </h1>

          <p className="mt-5 max-w-[650px] text-lg text-zinc-300">
            Encontra peças especiais, acompanha
            os lances e conquista a próxima peça
            da tua coleção.
          </p>

        </div>

      </section>

      {/* FILTER BAR */}

      <section className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">

        <div
          className="hide-scrollbar mx-auto flex h-[82px] max-w-[1480px] items-center gap-2.5 overflow-x-auto px-12"
          aria-label="Filtrar leilões por marca"
        >

            {brands.map((brand) => {

              const selected = brand === activeBrand;
              const logo = brandLogoByName[brand];

              return (

                <button
                  key={brand}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveBrand(brand)}
                  title={brand}
                  className={`flex h-[52px] w-[94px] shrink-0 items-center justify-center rounded-2xl border px-2 transition-all duration-300 ${
                    selected
                      ? "border-[#ffb800] bg-[#ffb800] text-black"
                      : "border-white/10 bg-black text-white hover:border-[#ffb800]"
                  }`}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={brand}
                      className={`max-h-8 max-w-[76px] object-contain transition ${selected ? "brightness-0" : ""}`}
                    />
                  ) : (
                    <span className="text-center text-[10px] font-black uppercase leading-tight tracking-[0.5px]">
                      {brand}
                    </span>
                  )}
                </button>

              );
            })}

        </div>

      </section>

      {/* STATUS */}

      <section className="max-w-[1480px] mx-auto px-12 pt-12">

        <div className="flex items-center gap-4 flex-wrap">

          <div className="h-[42px] px-5 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">
            Ao Vivo
          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">
            {filteredAuctions.length}{" "}
            {filteredAuctions.length === 1
              ? "Leilão"
              : "Leilões"}
          </div>

        </div>

      </section>

      {/* GRID */}

      <section className="max-w-[1480px] mx-auto px-12 py-14">

        {loading && (
          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-12 text-center">
            <div className="text-lg font-black">
              A carregar leilões...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-12 text-center">
            <div className="text-lg font-black text-red-400">
              {error}
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          filteredAuctions.length === 0 && (
            <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-12 text-center">

              <div className="text-2xl font-black">
                {activeBrand === "Todos"
                  ? "Não existem leilões ativos."
                  : `Não existem leilões ativos de ${activeBrand}.`}
              </div>

              <p className="mt-3 text-zinc-500">
                Quando forem publicados novos
                leilões, aparecerão aqui.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          filteredAuctions.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {filteredAuctions.map(
                (auction) => {

                  const firstImage =
                    [...(
                      auction.listing_images ??
                      []
                    )].sort(
                      (a, b) =>
                        Number(
                          a.sort_order ??
                            999,
                        ) -
                        Number(
                          b.sort_order ??
                            999,
                        ),
                    )[0]
                      ?.image_url;

                  const image =
                    firstImage ||
                    "/images/hero/cars/porsche-gt3rs.png";

                  const endTime =
                    getEndTime(
                      auction.created_at,
                      Number(
                        auction.duration_days ??
                          0,
                      ),
                    );

                  return (

                    <Link
                      key={auction.id}
                      href={`/auctions/${auction.id}`}
                      className="group relative rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/30 transition-all duration-500"
                    >

                      {/* IMAGE */}

                      <div className="relative h-[260px] overflow-hidden">

                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

                        <div className="absolute inset-0 flex items-center justify-center">

                          <div className="w-[180px] h-[90px] rounded-full bg-[#ffb800]/20 blur-[70px]" />

                        </div>

                        <div className="relative h-[260px] overflow-hidden bg-gradient-to-b from-zinc-900 to-black">

  <div className="absolute inset-0 flex items-center justify-center">
    <div className="h-[100px] w-[220px] rounded-full bg-[#ffb800]/15 blur-[80px]" />
  </div>

  <div className="relative z-10 flex h-full items-center justify-center px-6 pt-8">
    <img
      src={image}
      alt={auction.model || "Miniatura"}
      className="max-h-[190px] max-w-[82%] object-contain transition-transform duration-700 group-hover:scale-105"
    />
  </div>

  <div className="absolute left-4 top-4 z-20 h-[32px] rounded-full bg-[#ffb800] px-4 flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
    Leilão
  </div>

  <AuctionCountdown endTime={endTime} />

</div>

                        <div className="absolute top-4 left-4 h-[32px] px-4 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
                          Leilão
                        </div>

                        <AuctionCountdown
                          endTime={endTime}
                        />

                      </div>

                      {/* INFO */}

                      <div className="p-6">

                        <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">
                          {auction.brand ||
                            "Garagem164"}
                        </div>

                        <h3 className="mt-3 text-[22px] font-black leading-tight">
                          {auction.model ||
                            "Miniatura"}
                        </h3>

                        <div className="mt-6 flex items-center justify-between gap-4">

                          <div>

                            <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">
                              Licitação Atual
                            </div>

                            <div className="mt-1 text-[28px] font-black text-[#ffb800]">
                              €
                              {auction.currentBid.toFixed(
                                2,
                              )}
                            </div>

                          </div>

                          <div className="h-[48px] px-5 rounded-2xl bg-[#ffb800] group-hover:bg-[#ffc933] transition-all duration-300 text-black text-[12px] font-black uppercase tracking-[1px] flex items-center justify-center">
                            Licitar
                          </div>

                        </div>

                      </div>

                    </Link>

                  );
                },
              )}

            </div>

          )}

      </section>

    </main>
  );
}
