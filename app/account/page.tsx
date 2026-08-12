"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AccountSidebar from "./components/AccountSidebar";
import DashboardCard from "./components/DashboardCard";

type ConnectAccount = {
  stripe_account_id: string;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [confirmedAt, setConfirmedAt] = useState("");
  const [listingCount, setListingCount] = useState(0);

  const [connectAccount, setConnectAccount] =
    useState<ConnectAccount | null>(null);

  const [connectLoading, setConnectLoading] =
    useState(false);

  const [connectMessage, setConnectMessage] =
    useState("");

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
      setConfirmedAt(
        session.user.email_confirmed_at || "",
      );

      const { count } = await supabase
        .from("listings")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", session.user.id);

      setListingCount(count || 0);

      /*
       * ---------------------------------------------------------
       * STRIPE CONNECT
       * ---------------------------------------------------------
       */

      const { data: connectData } = await supabase
        .from("stripe_connect_accounts")
        .select(
          `
            stripe_account_id,
            details_submitted,
            charges_enabled,
            payouts_enabled
          `,
        )
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (connectData) {
        setConnectAccount(connectData);
      }

      setLoading(false);
    }

    void checkUser();
  }, []);

  async function setupStripeConnect() {
    setConnectLoading(true);
    setConnectMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "/api/stripe/connect/create-account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Stripe Connect error:",
          data,
        );

        setConnectMessage(
          data.error ||
            "Não foi possível configurar os pagamentos.",
        );

        return;
      }

      if (!data.url) {
        setConnectMessage(
          "Não foi possível obter o link do Stripe.",
        );

        return;
      }

      /*
       * Abrir o onboarding Stripe.
       */

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Stripe Connect error:",
        error,
      );

      setConnectMessage(
        "Ocorreu um erro ao configurar os pagamentos.",
      );
    } finally {
      setConnectLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  const connectReady =
    connectAccount?.payouts_enabled === true;

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

          {/* =====================================================
              STRIPE CONNECT
              ===================================================== */}

          <div className="mt-10 rounded-[32px] border border-white/5 bg-zinc-950 p-8">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div className="text-xs uppercase tracking-[2px] text-zinc-500 font-bold">
                  Pagamentos
                </div>

                <h2 className="mt-3 text-2xl font-black uppercase">
                  Receber pagamentos
                </h2>

                <p className="mt-3 max-w-2xl text-zinc-400">
                  Configure a sua conta de pagamentos para
                  receber o dinheiro das suas vendas e leilões
                  através do Garagem164.
                </p>
              </div>

              <div
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[1px] ${
                  connectReady
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/20"
                }`}
              >
                {connectReady
                  ? "Conta ativa"
                  : "Configuração necessária"}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <div className="text-xs uppercase tracking-[1.5px] text-zinc-500 font-bold">
                  Conta Stripe
                </div>

                <div className="mt-3 font-bold">
                  {connectAccount
                    ? "Criada"
                    : "Por configurar"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <div className="text-xs uppercase tracking-[1.5px] text-zinc-500 font-bold">
                  Dados submetidos
                </div>

                <div className="mt-3 font-bold">
                  {connectAccount?.details_submitted
                    ? "Concluído"
                    : "Pendente"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <div className="text-xs uppercase tracking-[1.5px] text-zinc-500 font-bold">
                  Pagamentos
                </div>

                <div className="mt-3 font-bold">
                  {connectAccount?.payouts_enabled
                    ? "Ativos"
                    : "Pendente"}
                </div>
              </div>
            </div>

            {connectMessage && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                {connectMessage}
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={setupStripeConnect}
                disabled={connectLoading}
                className="inline-flex h-[48px] items-center justify-center rounded-xl bg-[#ffb800] px-6 text-sm font-black uppercase text-black transition-all duration-300 hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connectLoading
                  ? "A abrir Stripe..."
                  : connectReady
                    ? "Gerir pagamentos"
                    : connectAccount
                      ? "Continuar configuração"
                      : "Configurar pagamentos"}
              </button>
            </div>
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
                    ? new Date(
                        confirmedAt,
                      ).toLocaleDateString("pt-PT")
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