"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import RaffleCheckoutModal from "./RaffleCheckoutModal";

type Props = {
  listing: any;
  listingId: string;
  selectedTickets: number[];
  soldCount: number;
  isOwner?: boolean;
};

export default function ListingSidebar({
  listing,
  listingId,
  selectedTickets,
  soldCount,
  isOwner = false,
}: Props) {
  const listingType = listing.listing_type;

  const ticketPrice = Number(
    listing.ticket_price || 0,
  );

  const totalTickets = Number(
    listing.total_tickets || 0,
  );

  const raffleTotal =
    selectedTickets.length * ticketPrice;

  const sortedTickets = [
    ...selectedTickets,
  ].sort((a, b) => a - b);

  const hasSelection =
    selectedTickets.length > 0;

  const [showCheckout, setShowCheckout] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ---------------------------------------------------------
   * COMPRA DE SORTEIO
   * ---------------------------------------------------------
   */

  const handleBuyRaffleTickets = () => {
    if (isOwner) {
      return;
    }

    if (!hasSelection) {
      return;
    }

    setShowCheckout(true);
  };

  /*
   * ---------------------------------------------------------
   * COMPRA NORMAL
   * ---------------------------------------------------------
   */

  const handleBuySale = async () => {
    if (isOwner || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            type: "sale",
            listingId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(
          data.error ||
            "Não foi possível iniciar o pagamento.",
        );

        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "SALE CHECKOUT ERROR:",
        error,
      );

      setError(
        "Ocorreu um erro ao iniciar o pagamento. Tenta novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * PREÇO DO ANÚNCIO
   * ---------------------------------------------------------
   */

  const displayPrice =
    listingType === "sale"
      ? Number(listing.price || 0)
      : listingType === "auction"
        ? Number(listing.starting_bid || 0)
        : ticketPrice;

  return (
    <div className="sticky top-24">

      <div className="rounded-[32px] border border-[#ffb800]/20 bg-zinc-950 p-8">

        <div className="text-xs uppercase tracking-[2px] text-zinc-500">
          {listingType === "auction" &&
            "Licitação Atual"}

          {listingType === "sale" &&
            "Preço"}

          {listingType === "raffle" &&
            "Preço por Bilhete"}
        </div>

        <div className="mt-2 text-[42px] font-black text-[#ffb800]">
          {displayPrice.toFixed(2)}€
        </div>

        {listingType === "raffle" && (
          <>
            <div className="my-8 h-px bg-white/10" />

            <div className="text-xs uppercase tracking-[2px] text-zinc-500">
              Bilhetes Vendidos
            </div>

            <div className="mt-2 text-3xl font-black">
              {soldCount}

              <span className="ml-2 text-base font-normal text-zinc-500">
                / {totalTickets}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 p-4">

              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Seleção Atual
              </div>

              <div className="mt-3 text-sm text-zinc-400">
                Bilhetes Selecionados
              </div>

              <div className="mt-1 break-words font-bold">
                {sortedTickets.length > 0
                  ? sortedTickets
                      .map((number) =>
                        number
                          .toString()
                          .padStart(2, "0"),
                      )
                      .join(", ")
                  : "Nenhum"}
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-zinc-400">
                  Quantidade
                </span>

                <span className="font-bold">
                  {selectedTickets.length}
                </span>
              </div>

              <div className="mt-2 flex justify-between font-black">

                <span>
                  Total
                </span>

                <span className="text-[#ffb800]">
                  {raffleTotal.toFixed(2)}€
                </span>

              </div>

            </div>
          </>
        )}

        {listingType === "raffle" &&
          isOwner && (
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">

              <div className="text-sm font-black text-amber-300">
                Este é o teu sorteio
              </div>

              <div className="mt-1 text-xs leading-relaxed text-amber-200/70">
                Não podes comprar bilhetes do teu próprio sorteio.
              </div>

            </div>
          )}

        {listingType === "sale" &&
          isOwner && (
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="text-sm font-black text-amber-300">
                Este é o teu anúncio
              </div>

              <div className="mt-1 text-xs leading-relaxed text-amber-200/70">
                Não podes comprar o teu próprio anúncio.
              </div>
            </div>
          )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={
            listingType === "sale"
              ? handleBuySale
              : listingType === "raffle"
                ? handleBuyRaffleTickets
                : undefined
          }
          disabled={
            loading ||
            (listingType === "sale" &&
              isOwner) ||
            (listingType === "raffle" &&
              (isOwner || !hasSelection))
          }
          className={`mt-8 h-14 w-full rounded-2xl font-black uppercase transition ${
            loading ||
            (listingType === "sale" &&
              isOwner) ||
            (listingType === "raffle" &&
              (isOwner || !hasSelection))
              ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
              : "bg-[#ffb800] text-black hover:bg-[#ffc933]"
          }`}
        >
          {listingType === "auction" &&
            "Licitar Agora"}

          {listingType === "sale" &&
            (isOwner
              ? "O teu anúncio"
              : loading
                ? "A preparar..."
                : "Comprar Agora")}

          {listingType === "raffle" &&
            (isOwner
              ? "O teu sorteio"
              : hasSelection
                ? `Comprar ${selectedTickets.length} Bilhete${
                    selectedTickets.length === 1
                      ? ""
                      : "s"
                  }`
                : "Seleciona os teus números")}
        </button>

        <button
          type="button"
          className="mt-3 h-14 w-full rounded-2xl border border-white/10 font-black uppercase transition hover:border-[#ffb800]"
        >
          Favoritos
        </button>

      </div>

      {listingType === "raffle" &&
        !isOwner && (
          <RaffleCheckoutModal
            open={showCheckout}
            onClose={() =>
              setShowCheckout(false)
            }
            listingId={listingId}
            selectedTickets={
              selectedTickets
            }
          />
        )}

    </div>
  );
}
