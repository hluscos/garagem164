"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PaymentCancelPage() {
  const [releasing, setReleasing] = useState(true);
  const [released, setReleased] = useState(false);
  const [error, setError] = useState("");
  const [isSale, setIsSale] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/raffles");

  useEffect(() => {
    async function releaseReservations() {
      try {
        const params = new URLSearchParams(
          window.location.search,
        );

        const listingId =
          params.get("listingId");

        const ticketsParam =
          params.get("tickets");

        const type = params.get("type");

        setIsSale(type === "sale");

        if (type === "sale") {
          const transactionId =
            params.get("transactionId");

          if (listingId) {
            setReturnUrl(
              `/listing/${listingId}`,
            );
          }

          if (!transactionId) {
            setError(
              "Não foi possível identificar a reserva a libertar.",
            );

            setReleasing(false);
            return;
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            setError(
              "A tua sessão expirou. Faz login novamente.",
            );

            setReleasing(false);
            return;
          }

          const response = await fetch(
            "/api/cancel-sale-checkout",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },

              body: JSON.stringify({
                transactionId,
              }),
            },
          );

          const result =
            await response.json();

          if (!response.ok) {
            setError(
              result?.error ||
                "Não foi possível libertar o anúncio.",
            );

            setReleasing(false);
            return;
          }

          setReleased(
            Boolean(result.cancelled),
          );

          setReleasing(false);
          return;
        }

        if (!listingId || !ticketsParam) {
          setReleasing(false);
          return;
        }

        const ticketNumbers = ticketsParam
          .split(",")
          .map((ticket) => Number(ticket))
          .filter((ticket) =>
            Number.isInteger(ticket),
          );

        if (ticketNumbers.length === 0) {
          setReleasing(false);
          return;
        }

        /*
         * Obter sessão atual
         */

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError(
            "A tua sessão expirou. Os bilhetes serão libertados automaticamente quando a reserva expirar.",
          );

          setReleasing(false);
          return;
        }

        /*
         * Libertar reservas através da API
         */

        const response = await fetch(
          "/api/release-ticket-reservations",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              listingId,
              ticketNumbers,
            }),
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          console.error(
            "RELEASE ERROR:",
            result,
          );

          setError(
            result?.error ||
              "Não foi possível libertar os bilhetes.",
          );

          setReleasing(false);
          return;
        }

        console.log(
          "RESERVAS LIBERTADAS:",
          result,
        );

        setReleased(true);
        setReleasing(false);
      } catch (error) {
        console.error(
          "PAYMENT CANCEL ERROR:",
          error,
        );

        setError(
          "Ocorreu um erro ao libertar os bilhetes.",
        );

        setReleasing(false);
      }
    }

    void releaseReservations();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto flex min-h-screen max-w-[700px] items-center justify-center px-6">

        <div className="w-full rounded-[32px] border border-white/10 bg-zinc-950 p-10 text-center">

          <div className="text-6xl">
            {released ? "✓" : "❌"}
          </div>

          <h1 className="mt-6 text-4xl font-black">
            Pagamento Cancelado
          </h1>

          <p className="mt-6 text-zinc-400">
            O pagamento não foi concluído.
          </p>

          {releasing && (
            <p className="mt-4 text-sm text-zinc-500">
              A libertar {isSale
                ? "a reserva do anúncio"
                : "os teus bilhetes"}...
            </p>
          )}

          {released && (
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">

              <div className="font-bold text-green-400">
                {isSale
                  ? "Reserva libertada"
                  : "Bilhetes libertados"}
              </div>

              <p className="mt-2 text-sm text-zinc-400">
                {isSale
                  ? "O anúncio está novamente disponível."
                  : "Os números que tinhas reservado estão novamente disponíveis."}
              </p>

            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">

              <div className="font-bold text-orange-400">
                Atenção
              </div>

              <p className="mt-2 text-sm text-zinc-400">
                {error}
              </p>

            </div>
          )}

          <p className="mt-6 text-zinc-400">
            Podes voltar a tentar quando quiseres.
          </p>

          <Link
            href={returnUrl}
            className="mt-10 inline-flex h-12 items-center justify-center rounded-xl bg-[#ffb800] px-8 font-black text-black transition hover:bg-[#ffc933]"
          >
            {isSale
              ? "Voltar ao Anúncio"
              : "Voltar aos Sorteios"}
          </Link>

        </div>

      </div>

    </main>
  );
}
