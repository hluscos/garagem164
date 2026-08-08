"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PurchaseCard from "../components/PurchaseCard";

interface Purchase {
  raffle_id: string;
  ticket_number: number;
  total_price: number;
  created_at: string;
}

interface GroupedPurchase {
  raffle_id: string;
  ticketNumbers: number[];
  totalPaid: number;
  purchaseDate: string;
  brand: string;
  model: string;
  image: string;
}

interface Listing {
  id: string;
  brand: string | null;
  model: string | null;
}

interface ListingImage {
  listing_id: string;
  image_url: string;
  sort_order: number | null;
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);

  const [groupedPurchases, setGroupedPurchases] = useState<
    GroupedPurchase[]
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

      const { data, error } = await supabase
        .from("raffle_tickets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar compras:", error);
        setLoading(false);
        return;
      }

      console.log("PURCHASES", data);

      const purchases = (data ?? []) as Purchase[];

      const grouped: Record<
        string,
        {
          raffle_id: string;
          ticketNumbers: number[];
          totalPaid: number;
          purchaseDate: string;
        }
      > = {};

      purchases.forEach((purchase) => {
        if (!grouped[purchase.raffle_id]) {
          grouped[purchase.raffle_id] = {
            raffle_id: purchase.raffle_id,
            ticketNumbers: [],
            totalPaid: 0,
            purchaseDate: purchase.created_at,
          };
        }

        grouped[purchase.raffle_id].ticketNumbers.push(
          purchase.ticket_number
        );

        grouped[purchase.raffle_id].totalPaid +=
          Number(purchase.total_price);
      });

      const groupedArray = Object.values(grouped);

      console.log("GROUPED", groupedArray);

      if (groupedArray.length === 0) {
        setGroupedPurchases([]);
        setLoading(false);
        return;
      }

      /*
       * ---------------------------------------------------------
       * BUSCAR OS ANÚNCIOS
       * ---------------------------------------------------------
       */

      const raffleIds = groupedArray.map(
        (purchase) => purchase.raffle_id
      );

      const { data: listingsData, error: listingsError } =
        await supabase
          .from("listings")
          .select("id, brand, model")
          .in("id", raffleIds);

      if (listingsError) {
        console.error(
          "Erro ao carregar anúncios:",
          listingsError
        );
      }

      const listings = (listingsData ?? []) as Listing[];

      /*
       * ---------------------------------------------------------
       * BUSCAR AS IMAGENS
       * ---------------------------------------------------------
       */

      const { data: imagesData, error: imagesError } =
        await supabase
          .from("listing_images")
          .select("listing_id, image_url, sort_order")
          .in("listing_id", raffleIds)
          .order("sort_order", { ascending: true });

      if (imagesError) {
        console.error(
          "Erro ao carregar imagens:",
          imagesError
        );
      }

      const images = (imagesData ?? []) as ListingImage[];

      /*
       * ---------------------------------------------------------
       * JUNTAR COMPRAS + ANÚNCIOS + IMAGENS
       * ---------------------------------------------------------
       */

      const finalPurchases: GroupedPurchase[] =
        groupedArray.map((purchase) => {
          const listing = listings.find(
            (item) => item.id === purchase.raffle_id
          );

          const listingImage = images.find(
            (image) => image.listing_id === purchase.raffle_id
          );

          return {
            ...purchase,
            brand: listing?.brand || "Garagem164",
            model: listing?.model || "Miniatura",
            image: listingImage?.image_url || "",
          };
        });

      console.log(
        "FINAL PURCHASES",
        finalPurchases
      );

      setGroupedPurchases(finalPurchases);
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
          Encontrados {groupedPurchases.length}{" "}
          {groupedPurchases.length === 1
            ? "sorteio"
            : "sorteios"}.
        </p>

        {groupedPurchases.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
            <div className="text-xl font-black">
              Ainda não tens compras
            </div>

            <p className="mt-2 text-zinc-500">
              Quando comprares bilhetes, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">

            {groupedPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.raffle_id}
                raffleId={purchase.raffle_id}
                model={purchase.model}
                brand={purchase.brand}
                image={purchase.image}
                ticketNumbers={purchase.ticketNumbers}
                totalPaid={purchase.totalPaid}
                purchaseDate={purchase.purchaseDate}
              />
            ))}

          </div>
        )}

      </div>
    </main>
  );
}