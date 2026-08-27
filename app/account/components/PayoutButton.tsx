"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  transactionId: string;
  canPayout: boolean;
  onPaidOut: () => void;
};

export default function PayoutButton({
  transactionId,
  canPayout,
  onPaidOut,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!canPayout) {
    return null;
  }

  const requestPayout = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/stripe/payout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ transactionId }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Não foi possível iniciar o pagamento.");
      setLoading(false);
      return;
    }

    setMessage("Pagamento enviado para a tua conta Stripe.");
    onPaidOut();
    setLoading(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="text-xs font-black text-emerald-200">
        A entrega foi concluída.
      </div>
      {message && <p className="mt-1 text-xs text-emerald-100">{message}</p>}
      <button
        type="button"
        onClick={requestPayout}
        disabled={loading}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-400 px-4 text-[11px] font-black uppercase text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        <Landmark size={15} />
        {loading ? "A enviar..." : "Receber pagamento"}
      </button>
    </div>
  );
}
