"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister() {
    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Conta criada. Verifica o teu email para confirmares o registo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="absolute w-[700px] h-[700px] bg-[#ffb800]/10 blur-[180px] rounded-full" />

      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] border border-white/10 bg-zinc-950/90 backdrop-blur-2xl p-10 shadow-[0_0_80px_rgba(255,184,0,0.08)]">
        <div className="mb-10">
          <div className="text-[12px] uppercase tracking-[3px] text-[#ffb800] font-bold">
            Garagem164
          </div>

          <h1 className="mt-3 text-[52px] leading-none font-black italic uppercase tracking-[-3px] text-white">
            Criar Conta
          </h1>

          <p className="mt-4 text-zinc-400 leading-relaxed">
            Cria a tua conta e junta-te à comunidade.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[12px] uppercase tracking-[2px] text-zinc-500 font-bold">
              Email
            </label>

            <input
              type="email"
              placeholder="o teu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-[58px] rounded-2xl bg-black border border-white/10 px-5 text-white outline-none focus:border-[#ffb800]"
            />
          </div>

          <div>
            <label className="text-[12px] uppercase tracking-[2px] text-zinc-500 font-bold">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full h-[58px] rounded-2xl bg-black border border-white/10 px-5 text-white outline-none focus:border-[#ffb800]"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-[60px] rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] text-black text-[14px] font-black uppercase tracking-[1px]"
          >
            {loading ? "A registar..." : "Registar"}
          </button>

          {message && (
            <div className="text-center text-sm text-zinc-300">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}