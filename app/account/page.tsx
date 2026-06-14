"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

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

        <div className="grid grid-cols-4 gap-6 mt-12">

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-black">Meus Anúncios</h2>
          </div>

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