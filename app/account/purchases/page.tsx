"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PurchaseCard from "../components/PurchaseCard";

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

interface RaffleTicket {
  raffle_id: string;
  ticket_number: number;
  total_price: number;
  created_at: string;
}

interface Transaction {
  id: string;
  listing_id: string;
  auction_id: string | null;
  buyer_id: string;
  amount: number;
  commercial_status: CommercialStatus;
  financial_status: FinancialStatus;
  created_at: string;
  delivery_method: "shipping" | "pickup";
  pickup_location: string | null;
}

interface Listing {
  id: string;
  brand: string | null;
  model: string | null;
  listing_type: PurchaseType;
}

interface ListingImage {
  listing_id: string;
  image_url: string;
  sort_order: number | null;
}

interface PurchaseItem {
  id: string;
  type: PurchaseType;
  listingId: string;
  ticketNumbers: number[];
  totalPaid: number;
  purchaseDate: string;
  brand: string;
  model: string;
  image: string;
  commercialStatus?: CommercialStatus;
  financialStatus?: FinancialStatus;
  deliveryMethod?: "shipping" | "pickup";
  pickupLocation?: string;
  trackingCarrier?: string;
  trackingCode?: string;
}

interface TransactionShipping {
  transaction_id: string;
  carrier: string | null;
  tracking_number: string | null;
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);

  const [purchases, setPurchases] = useState<
    PurchaseItem[]
  >([]);

  useEffect(() => {
    async function loadPurchases() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      /*
       * ---------------------------------------------------------
       * 1. SORTEIOS
       * ---------------------------------------------------------
       */

      const {
        data: raffleTicketsData,
        error: raffleTicketsError,
      } = await supabase
        .from("raffle_tickets")
        .select(
          "raffle_id, ticket_number, total_price, created_at",
        )
        .eq("user_id", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (raffleTicketsError) {
        console.error(
          "Erro ao carregar bilhetes:",
          raffleTicketsError,
        );
      }

      const raffleTickets =
        (raffleTicketsData ??
          []) as RaffleTicket[];

      /*
       * Agrupar bilhetes por sorteio.
       */

      const groupedRaffles: Record<
        string,
        {
          raffle_id: string;
          ticketNumbers: number[];
          totalPaid: number;
          purchaseDate: string;
        }
      > = {};

      raffleTickets.forEach((ticket) => {
        if (!groupedRaffles[ticket.raffle_id]) {
          groupedRaffles[ticket.raffle_id] = {
            raffle_id: ticket.raffle_id,
            ticketNumbers: [],
            totalPaid: 0,
            purchaseDate: ticket.created_at,
          };
        }

        groupedRaffles[
          ticket.raffle_id
        ].ticketNumbers.push(
          ticket.ticket_number,
        );

        groupedRaffles[
          ticket.raffle_id
        ].totalPaid += Number(
          ticket.total_price,
        );
      });

      /*
       * ---------------------------------------------------------
       * 2. TRANSAÇÕES
       * ---------------------------------------------------------
       */

      const {
        data: transactionsData,
        error: transactionsError,
      } = await supabase
        .from("transactions")
        .select(
          `
            id,
            listing_id,
            auction_id,
            buyer_id,
            amount,
            commercial_status,
            financial_status,
            delivery_method,
            pickup_location,
            created_at
          `,
        )
        .eq("buyer_id", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (transactionsError) {
        console.error(
          "Erro ao carregar transações:",
          transactionsError,
        );
      }

      const transactions =
        (transactionsData ??
          []) as Transaction[];

      const transactionIds = transactions.map((transaction) => transaction.id);
      let transactionShipping: TransactionShipping[] = [];

      if (transactionIds.length > 0) {
        const { data: shippingData, error: shippingError } = await supabase
          .from("transaction_shipping")
          .select("transaction_id, carrier, tracking_number")
          .in("transaction_id", transactionIds);

        if (shippingError) {
          console.error("Erro ao carregar rastreios:", shippingError);
        }

        transactionShipping = (shippingData ?? []) as TransactionShipping[];
      }

      /*
       * ---------------------------------------------------------
       * 3. OBTER TODOS OS LISTING IDS
       * ---------------------------------------------------------
       */

      const listingIds = [
        ...new Set([
          ...Object.keys(groupedRaffles),
          ...transactions.map(
            (transaction) =>
              transaction.listing_id,
          ),
        ]),
      ];

      let listings: Listing[] = [];

      let images: ListingImage[] = [];

      if (listingIds.length > 0) {
        /*
         * -------------------------------------------------------
         * ANÚNCIOS
         * -------------------------------------------------------
         */

        const {
          data: listingsData,
          error: listingsError,
        } = await supabase
          .from("listings")
          .select(
            "id, brand, model, listing_type",
          )
          .in("id", listingIds);

        if (listingsError) {
          console.error(
            "Erro ao carregar anúncios:",
            listingsError,
          );
        }

        listings =
          (listingsData ?? []) as Listing[];

        /*
         * -------------------------------------------------------
         * IMAGENS
         * -------------------------------------------------------
         */

        const {
          data: imagesData,
          error: imagesError,
        } = await supabase
          .from("listing_images")
          .select(
            "listing_id, image_url, sort_order",
          )
          .in("listing_id", listingIds)
          .order("sort_order", {
            ascending: true,
          });

        if (imagesError) {
          console.error(
            "Erro ao carregar imagens:",
            imagesError,
          );
        }

        images =
          (imagesData ??
            []) as ListingImage[];
      }

      /*
       * ---------------------------------------------------------
       * 4. CONSTRUIR COMPRAS DE SORTEIOS
       * ---------------------------------------------------------
       */

      const rafflePurchases: PurchaseItem[] =
        Object.values(groupedRaffles).map(
          (raffle) => {
            const listing = listings.find(
              (item) =>
                item.id === raffle.raffle_id,
            );

            const listingImage = images.find(
              (image) =>
                image.listing_id ===
                raffle.raffle_id,
            );

            return {
              id: `raffle-${raffle.raffle_id}`,
              type: "raffle",
              listingId: raffle.raffle_id,
              ticketNumbers:
                raffle.ticketNumbers,
              totalPaid:
                raffle.totalPaid,
              purchaseDate:
                raffle.purchaseDate,
              brand:
                listing?.brand ||
                "Garagem164",
              model:
                listing?.model ||
                "Miniatura",
              image:
                listingImage?.image_url ||
                "",
            };
          },
        );

      /*
       * ---------------------------------------------------------
       * 5. CONSTRUIR COMPRAS DE TRANSAÇÕES
       * ---------------------------------------------------------
       */

      const transactionPurchases: PurchaseItem[] =
        transactions.map(
          (transaction) => {
            const listing = listings.find(
              (item) =>
                item.id ===
                transaction.listing_id,
            );

            const listingImage = images.find(
              (image) =>
                image.listing_id ===
                transaction.listing_id,
            );

            const shipment = transactionShipping.find(
              (item) => item.transaction_id === transaction.id,
            );

            const type: PurchaseType =
              transaction.auction_id
                ? "auction"
                : listing?.listing_type ===
                    "auction"
                  ? "auction"
                  : "sale";

            return {
              id: transaction.id,
              type,
              listingId:
                transaction.listing_id,
              ticketNumbers: [],
              totalPaid:
                Number(transaction.amount),
              purchaseDate:
                transaction.created_at,
              brand:
                listing?.brand ||
                "Garagem164",
              model:
                listing?.model ||
                "Miniatura",
              image:
                listingImage?.image_url ||
                "",
              commercialStatus:
                transaction.commercial_status,
              financialStatus:
                transaction.financial_status,
              deliveryMethod: transaction.delivery_method,
              pickupLocation: transaction.pickup_location || "",
              trackingCarrier: shipment?.carrier || "",
              trackingCode: shipment?.tracking_number || "",
            };
          },
        );

      /*
       * ---------------------------------------------------------
       * 6. JUNTAR E ORDENAR
       * ---------------------------------------------------------
       */

      const allPurchases = [
        ...rafflePurchases,
        ...transactionPurchases,
      ].sort(
        (a, b) =>
          new Date(
            b.purchaseDate,
          ).getTime() -
          new Date(
            a.purchaseDate,
          ).getTime(),
      );

      setPurchases(allPurchases);
      setLoading(false);
    }

    void loadPurchases();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
        <div className="w-full max-w-[1050px]">
          <div className="text-zinc-500">
            A carregar...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="w-full max-w-[1050px]">

        <h1 className="text-5xl font-black">
          As Minhas Compras
        </h1>

        <p className="mt-2 text-zinc-400">
          Encontradas {purchases.length}{" "}
          {purchases.length === 1
            ? "compra"
            : "compras"}.
        </p>

        {purchases.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">

            <div className="text-xl font-black">
              Ainda não tens compras
            </div>

            <p className="mt-2 text-zinc-500">
              Quando fizeres uma compra, ela aparecerá aqui.
            </p>

          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">

            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                type={purchase.type}
                listingId={
                  purchase.listingId
                }
                model={purchase.model}
                brand={purchase.brand}
                image={purchase.image}
                ticketNumbers={
                  purchase.ticketNumbers
                }
                totalPaid={
                  purchase.totalPaid
                }
                purchaseDate={
                  purchase.purchaseDate
                }
                commercialStatus={
                  purchase.commercialStatus
                }
                financialStatus={
                  purchase.financialStatus
                }
                deliveryMethod={purchase.deliveryMethod}
                pickupLocation={purchase.pickupLocation}
                trackingCarrier={purchase.trackingCarrier}
                trackingCode={purchase.trackingCode}
              />
            ))}

          </div>
        )}

      </div>
    </main>
  );
}
