"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SellerProfile = {
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

export default function ListingSeller({ sellerId }: { sellerId: string }) {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [completedSales, setCompletedSales] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeller() {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      const [profileResult, salesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url, created_at")
          .eq("id", sellerId)
          .maybeSingle(),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", sellerId)
          .eq("listing_type", "sale")
          .eq("sale_status", "sold"),
      ]);

      if (profileResult.error) {
        console.error("SELLER PROFILE ERROR:", profileResult.error);
      }

      if (salesResult.error) {
        console.error("SELLER SALES COUNT ERROR:", salesResult.error);
      }

      setProfile(profileResult.data ?? null);
      setCompletedSales(salesResult.count ?? 0);
      setLoading(false);
    }

    void loadSeller();
  }, [sellerId]);

  const displayName = profile?.display_name?.trim() || "Colecionador";

  return (
    <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6">
      <h2 className="text-xl font-black">Vendedor</h2>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Foto de perfil de ${displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={30} className="text-zinc-500" />
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-bold">
            {loading ? "A carregar..." : displayName}
          </div>
          <div className="text-sm text-zinc-400">
            Membro da comunidade
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs uppercase text-zinc-500">Vendas</div>
          <div className="mt-1 font-bold">
            {completedSales === null ? "—" : completedSales}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs uppercase text-zinc-500">Membro</div>
          <div className="mt-1 font-bold capitalize">
            {formatMemberSince(profile?.created_at ?? null)}
          </div>
        </div>
      </div>

      <Link
        href={`/sellers/${sellerId}`}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-[#ffb800] font-semibold transition hover:bg-[#ffb800] hover:text-black"
      >
        Ver Perfil
      </Link>
    </div>
  );
}
