"use client";

import { useState } from "react";
import { KeyRound, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  transactionId: string;
  pickupLocation: string;
  canConfirm: boolean;
  onConfirmed: () => void;
};

export default function PickupConfirmationForm({
  transactionId,
  pickupLocation,
  canConfirm,
  onConfirmed,
}: Props) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmPickup = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `/api/transactions/${transactionId}/confirm-pickup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ confirmationCode }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Não foi possível confirmar a entrega.");
      setLoading(false);
      return;
    }

    setMessage("Entrega confirmada. A venda ficou pronta para pagamento.");
    onConfirmed();
    setLoading(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
      <div className="flex items-start gap-3 text-blue-200">
        <MapPin size={16} className="mt-0.5 shrink-0" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[2px] opacity-70">
            Entrega em mão
          </div>
          <div className="mt-0.5 text-xs font-black">
            {pickupLocation || "Localidade a combinar"}
          </div>
        </div>
      </div>

      {canConfirm && (
        <>
          <label className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1px] text-blue-100/70">
            <KeyRound size={14} />
            Código indicado pelo comprador
          </label>
          <input
            value={confirmationCode}
            onChange={(event) =>
              setConfirmationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="mt-2 w-full rounded-lg border border-white/10 bg-zinc-950 p-2.5 font-mono text-sm tracking-[0.25em] outline-none focus:border-[#ffb800]"
          />
          {message && <p className="mt-2 text-xs text-blue-100">{message}</p>}
          <button
            type="button"
            onClick={confirmPickup}
            disabled={loading || confirmationCode.length !== 6}
            className="mt-3 h-9 rounded-lg bg-[#ffb800] px-4 text-[11px] font-black uppercase text-black transition hover:bg-[#ffd34d] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? "A confirmar..." : "Confirmar entrega"}
          </button>
        </>
      )}
    </div>
  );
}
