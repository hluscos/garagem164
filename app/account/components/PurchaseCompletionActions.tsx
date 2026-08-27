"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CommercialStatus =
  | "pending_payment"
  | "paid"
  | "awaiting_shipment"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

type FinancialStatus =
  | "unpaid"
  | "held"
  | "ready_for_payout"
  | "transferred"
  | "refunded"
  | "disputed";

type Props = {
  transactionId: string;
  deliveryMethod: "shipping" | "pickup";
  commercialStatus: CommercialStatus;
  financialStatus: FinancialStatus;
  onCompleted: () => void;
};

export default function PurchaseCompletionActions({
  transactionId,
  deliveryMethod,
  commercialStatus,
  financialStatus,
  onCompleted,
}: Props) {
  const [pickupCode, setPickupCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const pickupAvailable =
    deliveryMethod === "pickup" &&
    ["paid", "awaiting_shipment"].includes(commercialStatus) &&
    financialStatus === "held";

  useEffect(() => {
    if (!pickupAvailable) {
      return;
    }

    let active = true;

    async function loadPickupCode() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch(
        `/api/transactions/${transactionId}/pickup-code`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const result = await response.json();

      if (active && response.ok && typeof result.code === "string") {
        setPickupCode(result.code);
      }
    }

    void loadPickupCode();

    return () => {
      active = false;
    };
  }, [pickupAvailable, transactionId]);

  const confirmReceipt = async () => {
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
      `/api/transactions/${transactionId}/confirm-receipt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Não foi possível confirmar a receção.");
      setLoading(false);
      return;
    }

    setMessage("Receção confirmada. A venda ficou pronta para pagamento.");
    onCompleted();
    setLoading(false);
  };

  if (pickupAvailable) {
    return (
      <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
        <div className="flex items-start gap-3 text-blue-200">
          <KeyRound size={16} className="mt-0.5 shrink-0" />
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[2px] opacity-70">
              Código de entrega em mão
            </div>
            <div className="mt-1 text-xs leading-relaxed">
              Dá este código ao vendedor apenas quando receberes a miniatura.
            </div>
            <div className="mt-2 font-mono text-2xl font-black tracking-[0.3em] text-white">
              {pickupCode || "••••••"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canConfirmReceipt =
    deliveryMethod === "shipping" &&
    commercialStatus === "shipped" &&
    financialStatus === "held";

  if (!canConfirmReceipt) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="text-xs font-black text-emerald-200">
        Já recebeste a encomenda?
      </div>
      <p className="mt-1 text-xs leading-relaxed text-emerald-100/70">
        Confirma apenas depois de receberes e verificares a miniatura.
      </p>
      {message && <p className="mt-2 text-xs text-emerald-100">{message}</p>}
      <button
        type="button"
        onClick={confirmReceipt}
        disabled={loading}
        className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-[11px] font-black uppercase text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        <CheckCircle2 size={15} />
        {loading ? "A confirmar..." : "Confirmar receção"}
      </button>
    </div>
  );
}
