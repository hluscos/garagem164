"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  selectedTickets: number[];
};

export default function RaffleCheckoutModal({
  open,
  onClose,
  listingId,
  selectedTickets,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const sortedTickets = [...selectedTickets].sort((a, b) => a - b);

  const handleCheckout = async () => {
    if (selectedTickets.length === 0) {
      setError("Seleciona pelo menos um bilhete.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("A tua sessão expirou. Faz login novamente.");
        return;
      }

      /*
       * 1. Reservar bilhetes
       */

      const reserveResponse = await fetch("/api/reserve-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          raffleId: listingId,
          selectedTickets,
        }),
      });

      const reserveData = await reserveResponse.json();

      if (!reserveResponse.ok || !reserveData.success) {
        setError(
          reserveData.message ||
            reserveData.error ||
            "Não foi possível reservar os bilhetes.",
        );
        return;
      }

      /*
       * 2. Criar Checkout Stripe
       */

      const checkoutResponse = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            listingId,
            selectedTickets,
          }),
        },
      );

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutData.url) {
        setError(
          checkoutData.error ||
            "Não foi possível iniciar o pagamento.",
        );
        return;
      }

      /*
       * 3. Ir para Stripe
       */

      window.location.href = checkoutData.url;
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);

      setError(
        "Ocorreu um erro ao iniciar o pagamento. Tenta novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-zinc-950 p-8 shadow-2xl">

        <div className="flex items-start justify-between gap-4">

          <div>
            <div className="text-[11px] font-black uppercase tracking-[2px] text-[#ffb800]">
              Garagem164
            </div>

            <h2 className="mt-2 text-3xl font-black text-white">
              Confirmar compra
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            ×
          </button>

        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">

          <div className="text-xs font-bold uppercase tracking-[2px] text-zinc-500">
            Bilhetes selecionados
          </div>

          <div className="mt-3 break-words text-lg font-black text-white">
            {sortedTickets
              .map((number) =>
                number.toString().padStart(2, "0"),
              )
              .join(", ")}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">

            <span className="text-zinc-400">
              Quantidade
            </span>

            <span className="font-black text-white">
              {selectedTickets.length}
            </span>

          </div>

        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-300">
          Após confirmares, os bilhetes ficam reservados durante
          <strong> 4 minutos</strong> para concluíres o pagamento.
        </div>

        <div className="mt-8 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-12 flex-1 rounded-2xl border border-white/10 font-bold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || selectedTickets.length === 0}
            className="h-12 flex-1 rounded-2xl bg-[#ffb800] font-black text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? "A preparar..." : "Ir para pagamento"}
          </button>

        </div>

      </div>

    </div>
  );
}