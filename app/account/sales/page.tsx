"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";

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
  /*
   * ---------------------------------------------------------
   * DADOS TEMPORÁRIOS DE DESENVOLVIMENTO
   * ---------------------------------------------------------
   *
   * Estes dados serão substituídos pela query real a
   * transactions quando voltarmos a ter o .env.local.
   */

  const sales: SaleItem[] = [];

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
          <div className="mt-10 space-y-6">

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
                  className="overflow-hidden rounded-[28px] border border-white/5 bg-zinc-950"
                >

                  <div className="flex flex-col md:flex-row">

                    {/* IMAGEM */}

                    <div className="flex w-full shrink-0 items-center justify-center bg-zinc-900/70 p-6 md:w-[190px]">

                      <div className="flex h-[158px] w-[158px] items-center justify-center overflow-hidden rounded-2xl bg-zinc-800/70 ring-1 ring-white/5">

                        {sale.image?.trim() ? (
                          <img
                            src={sale.image}
                            alt={sale.model}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl opacity-30">
                            🚗
                          </div>
                        )}

                      </div>

                    </div>

                    {/* CONTEÚDO */}

                    <div className="flex min-w-0 flex-1 flex-col p-7 md:p-8">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <div className="text-[11px] font-bold uppercase tracking-[4px] text-zinc-500">
                            {sale.brand}
                          </div>

                          <h2 className="mt-2 text-3xl font-black tracking-tight">
                            {sale.model}
                          </h2>

                        </div>

                        <div className="text-left sm:text-right">

                          <div className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
                            Valor da venda
                          </div>

                          <div className="mt-1 text-2xl font-black text-[#ffb800]">
                            €{sale.amount.toFixed(2)}
                          </div>

                        </div>

                      </div>

                      <div className="my-6 h-px bg-white/5" />

                      {/* ESTADO */}

                      <div
                        className={`flex items-center gap-3 rounded-2xl border p-4 ${statusClass}`}
                      >

                        <StatusIcon size={20} />

                        <div>

                          <div className="text-[10px] font-bold uppercase tracking-[3px] opacity-60">
                            Estado
                          </div>

                          <div className="mt-1 text-sm font-black">
                            {statusLabel}
                          </div>

                        </div>

                      </div>

                      {/* VALORES */}

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">

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

                      {/* RODAPÉ */}

                      <div className="mt-7 flex flex-col gap-5 border-t border-white/5 pt-6 sm:flex-row sm:items-end sm:justify-between">

                        <div className="flex items-center gap-2 text-zinc-500">

                          <CalendarDays size={15} />

                          <div>

                            <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                              Data da venda
                            </div>

                            <div className="mt-1 text-sm font-bold text-zinc-300">
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
                          className="group/button inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[#ffb800] px-6 text-sm font-black text-black transition-all duration-300 hover:bg-[#ffd34d]"
                        >
                          Ver anúncio

                          <ArrowRight
                            size={17}
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