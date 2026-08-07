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
        console.error(error);
      } else {
        console.log("PURCHASES", data);

        const grouped: Record<string, GroupedPurchase> = {};

        (data ?? []).forEach((purchase) => {
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
            purchase.total_price;
        });

        const groupedArray = Object.values(grouped);

        console.log("GROUPED", groupedArray);

        setGroupedPurchases(groupedArray);
      }

      setLoading(false);
    }

    void loadPurchases();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        A carregar...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black">
        As Minhas Compras
      </h1>

      <p className="mt-2 text-zinc-400">
        Encontrados {groupedPurchases.length} sorteios.
      </p>

      <div className="mt-10 space-y-6">

        {groupedPurchases.map((purchase) => (
  <PurchaseCard
    key={purchase.raffle_id}
    raffleId={purchase.raffle_id}
    model="Honda Civic EF"
    brand="Hot Wheels"
    image=""
    ticketNumbers={purchase.ticketNumbers}
    totalPaid={purchase.totalPaid}
    purchaseDate={purchase.purchaseDate}
  />
))}

      </div>

    </main>
  );
}