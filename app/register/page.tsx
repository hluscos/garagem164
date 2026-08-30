"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSocialAuthErrorMessage } from "@/lib/authErrorMessage";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaGithub } from "react-icons/fa";
import { Mail } from "lucide-react";

export default function RegisterPage() {
  const [showEmail, setShowEmail] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
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
        "Conta criada. Verifica o teu email para confirmares o registo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialRegister(
    provider: "google" | "facebook" | "github",
  ) {
    try {
      setSocialLoading(provider);
      setMessage("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...(provider === "google"
            ? { queryParams: { prompt: "select_account" } }
            : {}),
        },
      });

      if (error) {
        setMessage(getSocialAuthErrorMessage(provider, error.message));
        setSocialLoading(null);
      }
    } catch {
      setMessage(getSocialAuthErrorMessage(provider));
      setSocialLoading(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white flex items-center justify-center">

      {/* Glow principal */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb800]/10 blur-[180px]" />

      {/* Glow inferior */}
      <div className="pointer-events-none absolute bottom-[-300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#ffb800]/10 blur-[160px]" />

      <div className="relative z-10 w-full max-w-[520px]">

        {/* Caixa */}
        <div className="relative overflow-hidden rounded-[36px] border border-[#ffb800]/20 bg-[#080808]/95 p-8 shadow-[0_0_100px_rgba(255,184,0,0.08)] sm:p-10">

          {/* Linha dourada subtil */}
          <div className="absolute left-1/2 top-0 h-px w-[180px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ffb800] to-transparent shadow-[0_0_20px_rgba(255,184,0,0.7)]" />

          {/* Cabeçalho */}
          <div className="mb-9">

            <div className="text-[11px] font-black uppercase tracking-[4px] text-[#ffb800]">
              GARAGEM164
            </div>

            <h1 className="mt-4 text-[48px] font-black italic uppercase leading-[0.9] tracking-[-4px] text-white sm:text-[54px]">
              CRIAR CONTA
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-zinc-400">
              Cria a tua conta e junta-te à comunidade Garagem164.
            </p>

          </div>

          {!showEmail ? (
            <>
              {/* Registo social */}
              <div className="flex items-center justify-center gap-4">

                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister("google")}
                  disabled={socialLoading !== null}
                  aria-label="Registar com Google"
                  className="group flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-white/10 bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffb800]/50 hover:bg-zinc-900 hover:shadow-[0_10px_35px_rgba(255,184,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {socialLoading === "google" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                  ) : (
                    <FcGoogle className="text-[32px]" />
                  )}
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister("github")}
                  disabled={socialLoading !== null}
                  aria-label="Registar com GitHub"
                  className="group flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-white/10 bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffb800]/50 hover:bg-zinc-900 hover:shadow-[0_10px_35px_rgba(255,184,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {socialLoading === "github" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                  ) : (
                    <FaGithub className="text-[31px] text-white" />
                  )}
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister("facebook")}
                  disabled={socialLoading !== null}
                  aria-label="Registar com Facebook"
                  className="group flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-white/10 bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffb800]/50 hover:bg-zinc-900 hover:shadow-[0_10px_35px_rgba(255,184,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {socialLoading === "facebook" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                  ) : (
                    <FaFacebookF className="text-[29px] text-[#1877F2]" />
                  )}
                </button>

              </div>

              {/* Divisor */}
              <div className="my-9 flex items-center gap-5">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[11px] font-black uppercase tracking-[4px] text-zinc-600">
                  OU
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Email */}
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="group flex h-[62px] w-full items-center justify-center gap-4 rounded-[20px] border border-[#ffb800]/40 bg-transparent text-[#ffb800] transition-all duration-300 hover:border-[#ffb800] hover:bg-[#ffb800]/5 hover:shadow-[0_0_30px_rgba(255,184,0,0.08)]"
              >
                <Mail
                  size={21}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />

                <span className="text-[13px] font-black uppercase tracking-[1px]">
                  Continuar com email
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Registo por email */}
              <div className="space-y-5">

                <div>
                  <label className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="o teu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-[58px] w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#ffb800]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRegister();
                      }
                    }}
                    className="mt-2 h-[58px] w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#ffb800]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="h-[60px] w-full rounded-2xl bg-[#ffb800] text-[13px] font-black uppercase tracking-[1px] text-black transition-all duration-300 hover:bg-[#ffc933] hover:shadow-[0_10px_35px_rgba(255,184,0,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "A registar..." : "Criar conta"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmail(false);
                    setMessage("");
                  }}
                  className="w-full text-center text-[12px] font-bold text-zinc-500 transition-colors hover:text-white"
                >
                  ← Voltar às opções de registo
                </button>

              </div>
            </>
          )}

          {/* Mensagem */}
          {message && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-zinc-300">
              {message}
            </div>
          )}

          {/* Login */}
          <div className="mt-9 text-center text-sm text-zinc-500">
            Já tens conta?{" "}
            <a
              href="/login"
              className="font-bold text-[#ffb800] transition-colors hover:text-[#ffc933]"
            >
              Entrar
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}
