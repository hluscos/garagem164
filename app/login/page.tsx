"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type SocialProvider = "google" | "apple" | "facebook";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    try {
      setLoading(true);
      setMessage("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(
    provider: SocialProvider,
  ) {
    try {
      setSocialLoading(provider);
      setMessage("");

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });

      if (error) {
        console.error(
          "SOCIAL LOGIN ERROR:",
          error,
        );

        setMessage(
          "Não foi possível iniciar o login.",
        );

        setSocialLoading(null);
      }
    } catch (error) {
      console.error(
        "SOCIAL LOGIN ERROR:",
        error,
      );

      setMessage(
        "Não foi possível iniciar o login.",
      );

      setSocialLoading(null);
    }
  }

  const socialButtonLoading =
    socialLoading !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">

      <div className="absolute h-[700px] w-[700px] rounded-full bg-[#ffb800]/10 blur-[180px]" />

      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] border border-white/10 bg-zinc-950/90 p-10 shadow-[0_0_80px_rgba(255,184,0,0.08)] backdrop-blur-2xl">

        {/* CABEÇALHO */}

        <div className="mb-10">

          <div className="text-[12px] font-bold uppercase tracking-[3px] text-[#ffb800]">
            Garagem164
          </div>

          <h1 className="mt-3 text-[52px] font-black italic uppercase leading-none tracking-[-3px] text-white">
            Entrar
          </h1>

          <p className="mt-4 leading-relaxed text-zinc-400">
            Acede à tua garagem, leilões e coleção.
          </p>

        </div>

        {/* LOGIN SOCIAL */}

        <div className="space-y-3">

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("google")
            }
            disabled={
              loading ||
              socialButtonLoading
            }
            className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white text-sm font-bold text-black transition-all duration-300 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg font-black">
              G
            </span>

            {socialLoading === "google"
              ? "A ligar..."
              : "Continuar com Google"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("apple")
            }
            disabled={
              loading ||
              socialButtonLoading
            }
            className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white text-sm font-bold text-black transition-all duration-300 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg">
              
            </span>

            {socialLoading === "apple"
              ? "A ligar..."
              : "Continuar com Apple"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("facebook")
            }
            disabled={
              loading ||
              socialButtonLoading
            }
            className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white text-sm font-bold text-black transition-all duration-300 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg font-black">
              f
            </span>

            {socialLoading === "facebook"
              ? "A ligar..."
              : "Continuar com Facebook"}
          </button>

        </div>

        {/* SEPARADOR */}

        <div className="my-8 flex items-center gap-4">

          <div className="h-px flex-1 bg-white/10" />

          <span className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-600">
            ou
          </span>

          <div className="h-px flex-1 bg-white/10" />

        </div>

        {/* LOGIN EMAIL */}

        <div className="space-y-5">

          <div>

            <label className="text-[12px] font-bold uppercase tracking-[2px] text-zinc-500">
              Email
            </label>

            <input
              type="email"
              placeholder="o teu email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={
                loading ||
                socialButtonLoading
              }
              className="mt-2 h-[58px] w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#ffb800] disabled:opacity-50"
            />

          </div>

          <div>

            <label className="text-[12px] font-bold uppercase tracking-[2px] text-zinc-500">
              Palavra-passe
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={
                loading ||
                socialButtonLoading
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleLogin();
                }
              }}
              className="mt-2 h-[58px] w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#ffb800] disabled:opacity-50"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogin()
            }
            disabled={
              loading ||
              socialButtonLoading
            }
            className="h-[60px] w-full rounded-2xl bg-[#ffb800] text-[14px] font-black uppercase tracking-[1px] text-black transition-all duration-300 hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "A entrar..."
              : "Entrar"}
          </button>

          {message && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-400">
              {message}
            </div>
          )}

        </div>

        {/* REGISTO */}

        <div className="mt-8 border-t border-white/5 pt-6 text-center">

          <span className="text-sm text-zinc-500">
            Ainda não tens conta?
          </span>

          <a
            href="/register"
            className="ml-2 text-sm font-bold text-[#ffb800] hover:text-[#ffd34d]"
          >
            Criar conta
          </a>

        </div>

      </div>

    </main>
  );
}