"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
  MapPin,
} from "lucide-react";
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

interface SaleItem {
  id: string;
  listingId: string;
  brand: string;
  model: string;
  image: string;
  amount: number;
  sellerAmount: number;
  platformFee: number;
  createdAt: string;
  commercialStatus: CommercialStatus;
  financialStatus: FinancialStatus;
  deliveryMethod: "shipping" | "pickup";
  pickupLocation: string;
  trackingCarrier: string;
  trackingCode: string;
}

function ShippingForm({
  sale,
  onSaved,
}: {
  sale: SaleItem;
  onSaved: (updated: Partial<SaleItem>) => void;
}) {
  const [carrier, setCarrier] = useState(sale.trackingCarrier);
  const [trackingCode, setTrackingCode] = useState(sale.trackingCode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const canRegister =
    ['paid', 'awaiting_shipment', 'shipped'].includes(sale.commercialStatus) &&
    ['held', 'ready_for_payout'].includes(sale.financialStatus);

  if (sale.deliveryMethod === "pickup") {
    return (
      <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
        <div className="flex items-center gap-3 text-blue-300">
          <MapPin size={16} />
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[2px] opacity-70">
              Entrega em mão
            </div>
            <div className="mt-0.5 text-xs font-black">
              {sale.pickupLocation || "Localidade a combinar"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canRegister) return null;

  const saveTracking = async () => {
    setSaving(true);
    setMessage("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(`/api/transactions/${sale.id}/shipping`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ carrier, trackingCode }),
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Não foi possível guardar o rastreio.");
      setSaving(false);
      return;
    }

    onSaved({
      commercialStatus: "shipped",
      trackingCarrier: result.shipping.carrier,
      trackingCode: result.shipping.trackingCode,
    });
    setMessage("Rastreio guardado. O comprador já o pode consultar.");
    setSaving(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left text-xs font-black"
      >
        <span className="flex items-center gap-2">
          <Truck size={15} className="text-[#ffb800]" />
          {sale.trackingCode ? "Atualizar rastreio" : "Registar envio"}
        </span>
        <span className="text-[10px] uppercase text-zinc-500">
          {open ? "Fechar" : "Abrir"}
        </span>
      </button>

      {sale.trackingCode && !open && (
        <p className="mt-2 truncate font-mono text-[11px] text-[#ffb800]">
          {sale.trackingCarrier}: {sale.trackingCode}
        </p>
      )}

      {open && (
        <>
          <div className="mt-3 grid gap-2">
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} maxLength={80} placeholder="Transportadora" className="rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-xs outline-none focus:border-[#ffb800]" />
            <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} maxLength={120} placeholder="Código de rastreio" className="rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-xs outline-none focus:border-[#ffb800]" />
          </div>
          {message && <p className="mt-2 text-xs text-zinc-400">{message}</p>}
          <button type="button" onClick={saveTracking} disabled={saving || !carrier.trim() || !trackingCode.trim()} className="mt-3 h-9 rounded-lg bg-[#ffb800] px-4 text-[11px] font-black uppercase text-black transition hover:bg-[#ffd34d] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
            {saving ? "A guardar..." : "Confirmar envio"}
          </button>
        </>
      )}
    </div>
  );
}

function getStatusLabel(
  commercialStatus: CommercialStatus,
  financialStatus: FinancialStatus,
) {
  if (commercialStatus === "pending_payment") {
    return "A aguardar pagamento";
  }

  if (commercialStatus === "paid") {
    return "Pagamento confirmado";
  }

  if (commercialStatus === "awaiting_shipment") {
    return "A preparar envio";
  }

  if (commercialStatus === "shipped") {
    return "Enviado";
  }

  if (commercialStatus === "delivered") {
    return "Entregue";
  }

  if (commercialStatus === "completed") {
    return "Concluído";
  }

  if (commercialStatus === "cancelled") {
    return "Cancelado";
  }

  if (commercialStatus === "disputed") {
    return "Em disputa";
  }

  if (financialStatus === "ready_for_payout") {
    return "Elegível para pagamento";
  }

  if (financialStatus === "transferred") {
    return "Pagamento efectuado";
  }

  if (financialStatus === "refunded") {
    return "Reembolsado";
  }

  if (financialStatus === "disputed") {
    return "Em disputa";
  }

  return "Estado desconhecido";
}

function getStatusClass(
  commercialStatus: CommercialStatus,
  financialStatus: FinancialStatus,
) {
  if (
    commercialStatus === "cancelled" ||
    commercialStatus === "disputed" ||
    financialStatus === "refunded" ||
    financialStatus === "disputed"
  ) {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  if (
    commercialStatus === "completed" ||
    financialStatus === "transferred"
  ) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (
    commercialStatus === "shipped" ||
    commercialStatus === "delivered"
  ) {
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (
    commercialStatus === "paid" ||
    commercialStatus === "awaiting_shipment" ||
    financialStatus === "held" ||
    financialStatus === "ready_for_payout"
  ) {
    return "border-[#ffb800]/20 bg-[#ffb800]/10 text-[#ffb800]";
  }

  return "border-white/10 bg-white/5 text-zinc-400";
}

function getStatusIcon(
  commercialStatus: CommercialStatus,
  financialStatus: FinancialStatus,
) {
  if (
    commercialStatus === "completed" ||
    financialStatus === "transferred"
  ) {
    return CheckCircle2;
  }

  if (commercialStatus === "shipped") {
    return Truck;
  }

  if (commercialStatus === "delivered") {
    return PackageCheck;
  }

  return Clock3;
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("id, listing_id, amount, seller_amount, platform_fee, created_at, commercial_status, financial_status, delivery_method, pickup_location")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("SALES LOAD ERROR:", error);
        setLoading(false);
        return;
      }

      const listingIds = [...new Set((transactions ?? []).map((item) => item.listing_id))];
      const transactionIds = (transactions ?? []).map((item) => item.id);
      const [{ data: listings }, { data: images }, { data: shipping }] = await Promise.all([
        listingIds.length
          ? supabase.from("listings").select("id, brand, model").in("id", listingIds)
          : Promise.resolve({ data: [] }),
        listingIds.length
          ? supabase.from("listing_images").select("listing_id, image_url, sort_order").in("listing_id", listingIds).order("sort_order")
          : Promise.resolve({ data: [] }),
        transactionIds.length
          ? supabase.from("transaction_shipping").select("transaction_id, carrier, tracking_number").in("transaction_id", transactionIds)
          : Promise.resolve({ data: [] }),
      ]);

      setSales((transactions ?? []).map((transaction) => {
        const listing = listings?.find((item) => item.id === transaction.listing_id);
        const image = images?.find((item) => item.listing_id === transaction.listing_id);
        const shipment = shipping?.find((item) => item.transaction_id === transaction.id);
        return {
          id: transaction.id,
          listingId: transaction.listing_id,
          brand: listing?.brand || "Garagem164",
          model: listing?.model || "Miniatura",
          image: image?.image_url || "",
          amount: Number(transaction.amount),
          sellerAmount: Number(transaction.seller_amount),
          platformFee: Number(transaction.platform_fee),
          createdAt: transaction.created_at,
          commercialStatus: transaction.commercial_status as CommercialStatus,
          financialStatus: transaction.financial_status as FinancialStatus,
          deliveryMethod: transaction.delivery_method as "shipping" | "pickup",
          pickupLocation: transaction.pickup_location || "",
          trackingCarrier: shipment?.carrier || "",
          trackingCode: shipment?.tracking_number || "",
        };
      }));
      setLoading(false);
    }

    void loadSales();
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-black px-6 py-10 text-zinc-500">A carregar vendas...</main>;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto w-full max-w-[1050px]">

        {/* CABEÇALHO */}

        <div className="flex flex-col gap-3">

          <div className="text-[11px] font-bold uppercase tracking-[4px] text-[#ffb800]">
            Área do vendedor
          </div>

          <h1 className="text-5xl font-black tracking-tight">
            As Minhas Vendas
          </h1>

          <p className="max-w-2xl text-zinc-400">
            Consulta as vendas dos teus anúncios,
            acompanha os pagamentos e gere o envio
            das encomendas.
          </p>

        </div>

        {/* ESTATÍSTICAS */}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/5 bg-zinc-950 p-5">

            <div className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
              Vendas
            </div>

            <div className="mt-2 text-3xl font-black">
              {sales.length}
            </div>

          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950 p-5">

            <div className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
              A aguardar envio
            </div>

            <div className="mt-2 text-3xl font-black">
              {
                sales.filter(
                  (sale) =>
                    sale.commercialStatus ===
                      "paid" ||
                    sale.commercialStatus ===
                      "awaiting_shipment",
                ).length
              }
            </div>

          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950 p-5">

            <div className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
              Elegíveis para pagamento
            </div>

            <div className="mt-2 text-3xl font-black">
              {
                sales.filter(
                  (sale) =>
                    sale.financialStatus ===
                    "ready_for_payout",
                ).length
              }
            </div>

          </div>

        </div>

        {/* LISTA */}

        {sales.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <PackageCheck
                size={28}
                className="text-zinc-600"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Ainda não tens vendas
            </h2>

            <p className="mx-auto mt-2 max-w-md text-zinc-500">
              Quando alguém comprar um dos teus
              anúncios, a venda aparecerá aqui.
            </p>

            <Link
              href="/submit-listing"
              className="mt-7 inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[#ffb800] px-6 text-sm font-black text-black transition-all duration-300 hover:bg-[#ffd34d]"
            >
              Criar anúncio

              <ArrowRight size={17} />
            </Link>

          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">

            {sales.map((sale) => {
              const StatusIcon =
                getStatusIcon(
                  sale.commercialStatus,
                  sale.financialStatus,
                );

              const statusLabel =
                getStatusLabel(
                  sale.commercialStatus,
                  sale.financialStatus,
                );

              const statusClass =
                getStatusClass(
                  sale.commercialStatus,
                  sale.financialStatus,
                );

              return (
                <article
                  key={sale.id}
                  className="h-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-950"
                >

                  <div className="flex h-full flex-col sm:flex-row">

                    {/* IMAGEM */}

                    <div className="flex w-full shrink-0 items-center justify-center bg-zinc-900/70 p-4 sm:w-[128px]">

                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-zinc-800/70 ring-1 ring-white/5">

                        {sale.image?.trim() ? (
                          <img
                            src={sale.image}
                            alt={sale.model}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-3xl opacity-30">
                            🚗
                          </div>
                        )}

                      </div>

                    </div>

                    {/* CONTEÚDO */}

                    <div className="flex min-w-0 flex-1 flex-col p-5">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <div className="text-[10px] font-bold uppercase tracking-[2px] text-zinc-500">
                            {sale.brand}
                          </div>

                          <h2 className="mt-1 text-xl font-black tracking-tight md:text-2xl">
                            {sale.model}
                          </h2>

                        </div>

                        <div className="text-left sm:text-right">

                          <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                            Valor da venda
                          </div>

                          <div className="mt-0.5 text-xl font-black text-[#ffb800]">
                            €{sale.amount.toFixed(2)}
                          </div>

                        </div>

                      </div>

                      <div className="my-4 h-px bg-white/5" />

                      {/* ESTADO */}

                      <div
                        className={`flex items-center gap-2 rounded-xl border p-3 ${statusClass}`}
                      >

                        <StatusIcon size={16} />

                        <div>

                          <div className="text-[9px] font-bold uppercase tracking-[2px] opacity-60">
                            Estado
                          </div>

                          <div className="mt-0.5 text-xs font-black">
                            {statusLabel}
                          </div>

                        </div>

                      </div>

                      {/* VALORES */}

                      <div className="mt-3 grid grid-cols-3 gap-3">

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                            Venda
                          </div>

                          <div className="mt-1 text-sm font-black text-zinc-300">
                            €{sale.amount.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                            Comissão
                          </div>

                          <div className="mt-1 text-sm font-black text-zinc-300">
                            €{sale.platformFee.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                            Recebes
                          </div>

                          <div className="mt-1 text-sm font-black text-[#ffb800]">
                            €{sale.sellerAmount.toFixed(2)}
                          </div>
                        </div>

                      </div>

                      <ShippingForm
                        sale={sale}
                        onSaved={(updated) => {
                          setSales((current) =>
                            current.map((item) =>
                              item.id === sale.id
                                ? { ...item, ...updated }
                                : item,
                            ),
                          );
                        }}
                      />

                      {/* RODAPÉ */}

                      <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-end sm:justify-between">

                        <div className="flex items-center gap-2 text-zinc-500">

                          <CalendarDays size={14} />

                          <div>

                            <div className="text-[8px] font-bold uppercase tracking-[2px] text-zinc-600">
                              Data da venda
                            </div>

                            <div className="mt-0.5 text-xs font-bold text-zinc-300">
                              {new Date(
                                sale.createdAt,
                              ).toLocaleDateString(
                                "pt-PT",
                              )}
                            </div>

                          </div>

                        </div>

                        <Link
                          href={`/listing/${sale.listingId}`}
                          className="group/button inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#ffb800] px-4 text-xs font-black text-black transition-all duration-300 hover:bg-[#ffd34d]"
                        >
                          Ver anúncio

                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover/button:translate-x-1"
                          />
                        </Link>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}
