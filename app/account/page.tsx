"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AccountSidebar from "./components/AccountSidebar";
import DashboardCard from "./components/DashboardCard";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [confirmedAt, setConfirmedAt] = useState("");
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setEmail(session.user.email || "");
      setConfirmedAt(session.user.email_confirmed_at || "");

      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      setListingCount(count || 0);

      setLoading(false);
    }

    void checkUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1600px] mx-auto px-10 py-10 flex gap-8">

        <AccountSidebar />

        <div className="flex-1">

          <div className="mb-10">

            <div className="text-[#ffb800] uppercase tracking-[3px] text-xs font-black">
              Área Pessoal
            </div>

            <h1 className="mt-4 text-5xl font-black uppercase">
              Bem-vindo
            </h1>

            <p className="mt-4 text-zinc-400 max-w-3xl">
              Gere os teus anúncios, acompanha os sorteios,
              consulta as tuas compras e controla toda a tua
              atividade no Garagem164.
            </p>

          </div>

          <div className="grid grid-cols-4 gap-6">

            <DashboardCard
              title="Anúncios"
              value={listingCount}
              subtitle="Publicados"
            />

            <DashboardCard
              title="Compras"
              value={0}
              subtitle="Miniaturas adquiridas"
            />

            <DashboardCard
              title="Sorteios"
              value={0}
              subtitle="Participações"
            />

            <DashboardCard
              title="Leilões"
              value={0}
              subtitle="Licitações"
            />

          </div>

          <div className="mt-10 grid grid-cols-2 gap-6">

            <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-8">

              <div className="text-xs uppercase tracking-[2px] text-zinc-500 font-bold">
                Conta
              </div>

              <div className="mt-6">
                <div className="text-sm text-zinc-500">
                  Email
                </div>

                <div className="mt-2 text-lg font-bold">
                  {email}
                </div>
              </div>

              <div className="mt-8">
                <div className="text-sm text-zinc-500">
                  Conta confirmada
                </div>

                <div className="mt-2 text-lg font-bold">
                  {confirmedAt
                    ? new Date(confirmedAt).toLocaleDateString("pt-PT")
                    : "-"}
                </div>
              </div>

            </div>
                        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-8">

              <div className="text-xs uppercase tracking-[2px] text-zinc-500 font-bold">
                Acesso rápido
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <a
                  href="/account/listings"
                  className="rounded-2xl border border-white/10 bg-black p-6 hover:border-[#ffb800] transition-all duration-300"
                >
                  <div className="text-3xl font-black text-[#ffb800]">
                    {listingCount}
                  </div>

                  <div className="mt-3 font-bold">
                    Meus Anúncios
                  </div>
                </a>

                <div className="rounded-2xl border border-white/10 bg-black p-6 opacity-60">
                  <div className="text-3xl font-black text-[#ffb800]">
                    0
                  </div>

                  <div className="mt-3 font-bold">
                    Compras
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-6 opacity-60">
                  <div className="text-3xl font-black text-[#ffb800]">
                    0
                  </div>

                  <div className="mt-3 font-bold">
                    Sorteios
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-6 opacity-60">
                  <div className="text-3xl font-black text-[#ffb800]">
                    0
                  </div>

                  <div className="mt-3 font-bold">
                    Leilões
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}