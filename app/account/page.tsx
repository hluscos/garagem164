"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
setConfirmedAt(
  session.user.email_confirmed_at || ""
);

const { count } = await supabase
  .from("listings")
  .select("*", { count: "exact", head: true })
  .eq("user_id", session.user.id);

setListingCount(count || 0);

console.log(session.user);
setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <h1 className="text-[64px] font-black italic uppercase tracking-[-3px]">
          Minha Conta
        </h1>

        <p className="mt-4 text-zinc-400">
          Área pessoal do utilizador.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-6">
  <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
    Email
  </div>

 <div className="mt-2 text-lg font-bold">
    {email}
  </div>
</div>

<div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
  <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">
    Conta Confirmada
  </div>

  <div className="mt-2 text-lg font-bold">
    {confirmedAt
      ? new Date(confirmedAt).toLocaleDateString("pt-PT")
      : "-"}
  </div>
</div>

<div className="grid grid-cols-4 gap-6 mt-12">

         <a
  href="/account/listings"
  className="rounded-[28px] border border-white/10 bg-zinc-950 p-8 block hover:border-[#ffb800] transition-all duration-300"
>
  <div className="text-4xl font-black text-[#ffb800]">
    {listingCount}
  </div>

  <h2 className="mt-2 text-xl font-black">
    Meus Anúncios
  </h2>
</a>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-black">Meus Leilões</h2>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-black">Meus Sorteios</h2>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-black">Perfil</h2>
          </div>

        </div>

      </section>
    </main>
  );
}