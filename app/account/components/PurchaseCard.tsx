import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gavel,
  PackageCheck,
  MapPin,
  Truck,
  Ticket,
} from "lucide-react";
import TicketBadge from "./TicketBadge";

type PurchaseType = "raffle" | "sale" | "auction";

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

interface PurchaseCardProps {
  type: PurchaseType;
  listingId: string;
  model: string;
  brand: string;
  image: string;
  totalPaid: number;
  purchaseDate: string;

  ticketNumbers?: number[];

  commercialStatus?: CommercialStatus;
  financialStatus?: FinancialStatus;
  deliveryMethod?: "shipping" | "pickup";
  pickupLocation?: string;
  trackingCarrier?: string;
  trackingCode?: string;
}

function getTypeLabel(type: PurchaseType) {
  if (type === "sale") {
    return "Venda";
  }

  if (type === "auction") {
    return "Leilão";
  }

  return "Sorteio";
}

function getStatusLabel(
  commercialStatus?: CommercialStatus,
  financialStatus?: FinancialStatus,
) {
  if (commercialStatus === "pending_payment") {
    return "Pagamento pendente";
  }

  if (commercialStatus === "paid") {
    return "Pagamento confirmado";
  }

  if (commercialStatus === "awaiting_shipment") {
    return "A aguardar envio";
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

  if (financialStatus === "held") {
    return "Pagamento confirmado";
  }

  if (financialStatus === "refunded") {
    return "Reembolsado";
  }

  if (financialStatus === "disputed") {
    return "Em disputa";
  }

  if (financialStatus === "unpaid") {
    return "Pagamento pendente";
  }

  return "Compra registada";
}

function getStatusClass(
  commercialStatus?: CommercialStatus,
  financialStatus?: FinancialStatus,
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
    commercialStatus === "delivered"
  ) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (
    commercialStatus === "shipped" ||
    commercialStatus === "awaiting_shipment"
  ) {
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (
    commercialStatus === "paid" ||
    financialStatus === "held"
  ) {
    return "border-[#ffb800]/20 bg-[#ffb800]/10 text-[#ffb800]";
  }

  return "border-white/10 bg-white/5 text-zinc-400";
}

export default function PurchaseCard({
  type,
  listingId,
  model,
  brand,
  image,
  totalPaid,
  purchaseDate,
  ticketNumbers = [],
  commercialStatus,
  financialStatus,
  deliveryMethod,
  pickupLocation = "",
  trackingCarrier = "",
  trackingCode = "",
}: PurchaseCardProps) {
  const sortedTickets = [...ticketNumbers].sort(
    (a, b) => a - b,
  );

  const visibleTickets = sortedTickets.slice(0, 4);

  const remainingTickets =
    sortedTickets.length - visibleTickets.length;

  const typeLabel = getTypeLabel(type);

  const statusLabel = getStatusLabel(
    commercialStatus,
    financialStatus,
  );

  const statusClass = getStatusClass(
    commercialStatus,
    financialStatus,
  );

  const isRaffle = type === "raffle";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 transition-all duration-300 hover:border-[#ffb800]/20">

      <div className="flex h-full flex-col sm:flex-row">

        {/* IMAGEM */}

        <div className="flex w-full shrink-0 items-center justify-center bg-zinc-900/70 p-4 sm:w-[128px]">

          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-zinc-800/70 ring-1 ring-white/5">

            {image?.trim() ? (
              <img
                src={image}
                alt={model}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl opacity-30">
                  🚗
                </div>

                <div className="mt-1 text-[8px] font-bold uppercase tracking-[2px] text-zinc-600">
                  Garagem164
                </div>
              </div>
            )}

          </div>

        </div>

        {/* CONTEÚDO */}

        <div className="flex min-w-0 flex-1 flex-col p-5">

          {/* CABEÇALHO */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-[10px] font-bold uppercase tracking-[2px] text-zinc-500">
                  {brand}
                </span>

                <span className="rounded-full border border-[#ffb800]/20 bg-[#ffb800]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[1px] text-[#ffb800]">
                  {typeLabel}
                </span>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[1px] ${statusClass}`}
                >
                  {statusLabel}
                </span>

              </div>

              <h2 className="mt-1 text-xl font-black tracking-tight text-white md:text-2xl">
                {model}
              </h2>

            </div>

            <div className="text-left sm:text-right">

              <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                Total pago
              </div>

              <div className="mt-0.5 text-xl font-black text-[#ffb800]">
                €{totalPaid.toFixed(2)}
              </div>

            </div>

          </div>

          {/* DIVISOR */}

          <div className="my-4 h-px bg-white/5" />

          {/* INFORMAÇÃO ESPECÍFICA */}

          {isRaffle ? (
            <div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Ticket
                    size={14}
                    className="text-[#ffb800]"
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-500">
                    Bilhetes comprados
                  </span>

                </div>

                <span className="text-xs font-bold text-zinc-500">
                  {ticketNumbers.length}{" "}
                  {ticketNumbers.length === 1
                    ? "bilhete"
                    : "bilhetes"}
                </span>

              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">

                {visibleTickets.map((ticket) => (
                  <TicketBadge
                    key={ticket}
                    number={ticket}
                  />
                ))}

                {remainingTickets > 0 && (
                  <div className="flex h-8 items-center justify-center rounded-lg border border-[#ffb800]/30 bg-[#ffb800]/5 px-3 text-xs font-black text-[#ffb800]">
                    +{remainingTickets}
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

              <div className="flex items-center gap-3">

                {type === "auction" ? (
                  <Gavel
                    size={16}
                    className="text-[#ffb800]"
                  />
                ) : (
                  <PackageCheck
                    size={16}
                    className="text-[#ffb800]"
                  />
                )}

                <div>

                  <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-600">
                    Estado da encomenda
                  </div>

                  <div className="mt-0.5 text-xs font-black text-zinc-200">
                    {statusLabel}
                  </div>

                </div>

              </div>

            </div>
          )}

          {!isRaffle && deliveryMethod === "pickup" && (
            <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="flex items-center gap-3 text-blue-300">
                <MapPin size={16} />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[2px] opacity-70">
                    Entrega em mão
                  </div>
                  <div className="mt-0.5 text-xs font-black">
                    {pickupLocation || "Localidade a combinar com o vendedor"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isRaffle && deliveryMethod === "shipping" && trackingCode && (
            <div className="mt-3 rounded-xl border border-[#ffb800]/20 bg-[#ffb800]/5 p-3">
              <div className="flex items-start gap-3">
                <Truck size={16} className="mt-0.5 shrink-0 text-[#ffb800]" />
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-[2px] text-zinc-500">
                    Rastreio da encomenda
                  </div>
                  <div className="mt-1 text-xs font-black text-white">
                    {trackingCarrier}
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-[#ffb800]">
                    {trackingCode}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RODAPÉ */}

          <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex items-center gap-2 text-zinc-500">

              <CalendarDays size={14} />

              <div>

                <div className="text-[8px] font-bold uppercase tracking-[2px] text-zinc-600">
                  Data da compra
                </div>

                <div className="mt-0.5 text-xs font-bold text-zinc-300">
                  {new Date(
                    purchaseDate,
                  ).toLocaleDateString("pt-PT")}
                </div>

              </div>

            </div>

            <Link
              href={`/listing/${listingId}`}
              className="group/button inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#ffb800] px-4 text-xs font-black text-black transition-all duration-300 hover:bg-[#ffd34d] hover:shadow-[0_8px_30px_rgba(255,184,0,0.18)]"
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
}
