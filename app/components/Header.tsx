"use client";

import { useEffect, useState } from "react";

import {
  Search,
  ShoppingCart,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

import { supabase } from "@/lib/supabase";

export default function Header() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* TOPBAR */}

      <div className="hidden lg:block bg-black border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 h-[44px] flex items-center justify-between">

          <div className="flex-1 flex items-center justify-center text-[12px] uppercase tracking-[1.5px] text-zinc-400 font-semibold">

            <span>
              🏁 Comunidade de Colecionadores
            </span>

            <span className="mx-4 text-zinc-700">
              •
            </span>

            <span>
              🇵🇹 Plataforma Portuguesa
            </span>

            <span className="mx-4 text-zinc-700">
              •
            </span>

            <span>
              ⭐ Anúncios Gratuitos durante o Lançamento
            </span>

          </div>

          {/* SOCIALS */}

          <div className="flex items-center gap-3 ml-8">

            <button className="w-8 h-8 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaInstagram size={13} />

            </button>

            <button className="w-8 h-8 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaFacebookF size={12} />

            </button>

            <button className="w-8 h-8 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaYoutube size={13} />

            </button>

          </div>

        </div>

      </div>

      {/* MAIN HEADER */}

      <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-2xl border-b border-white/5">

        <div className="max-w-[1600px] mx-auto px-12 h-[100px] flex items-center justify-between">

          {/* LOGO */}

          <a
            href="/"
            className="flex items-center cursor-pointer select-none mr-14"
          >

            <img
              src="/logo.png"
              alt="Garagem164"
              className="h-[160px] w-auto"
            />

          </a>

          {/* NAVIGATION */}

          <nav className="hidden xl:flex items-center gap-9 text-[15px] font-bold uppercase tracking-[0.5px]">

            <a
              href="/"
              className="text-[#ffb800] relative after:absolute after:left-0 after:-bottom-[31px] after:w-full after:h-[3px] after:rounded-full after:bg-[#ffb800]"
            >
              Início
            </a>

            <a
              href="/auctions"
              className="hover:text-[#ffb800] transition"
            >
              Leilões
            </a>

            <a
              href="/raffles"
              className="hover:text-[#ffb800] transition"
            >
              Sorteios
            </a>

            <a
             href={session ? "/submit-listing" : "/login"}
             className="text-[#ffb800] hover:text-[#ffc933] transition font-black"
            >
            Vender
            </a>
              Coleções

            <a
              href="#"
              className="hover:text-[#ffb800] transition"
            >
              Comunidade
            </a>

            <a
              href="#"
              className="hover:text-[#ffb800] transition"
            >
              Sobre Nós
            </a>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4">

            {/* SEARCH */}

            <button className="w-[56px] h-[56px] rounded-2xl border border-white/10 hover:border-[#ffb800] transition-all duration-300 flex items-center justify-center">

              <Search size={20} />

            </button>

            {/* CART */}

            <button className="relative w-[56px] h-[56px] rounded-2xl border border-white/10 hover:border-[#ffb800] transition-all duration-300 flex items-center justify-center">

              <ShoppingCart size={19} />

              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ffb800] text-black text-[10px] font-black flex items-center justify-center">

                2

              </div>

            </button>

            {session ? (
  <>
    <a
      href="/account"
      className="h-[56px] px-10 rounded-2xl border border-white/10 hover:border-[#ffb800] transition-all duration-300 text-[14px] font-bold uppercase tracking-[0.5px] flex items-center justify-center"
    >
      Minha Conta
    </a>

    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="h-[56px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[14px] font-black uppercase tracking-[0.5px] shadow-[0_0_40px_rgba(255,184,0,0.16)] flex items-center justify-center"
    >
      Terminar Sessão
    </button>
  </>
) : (
  <>
    <a
      href="/login"
      className="h-[56px] px-10 rounded-2xl border border-white/10 hover:border-[#ffb800] transition-all duration-300 text-[14px] font-bold uppercase tracking-[0.5px] flex items-center justify-center"
    >
      Entrar
    </a>

    <a
      href="/register"
      className="h-[56px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[14px] font-black uppercase tracking-[0.5px] shadow-[0_0_40px_rgba(255,184,0,0.16)] flex items-center justify-center"
    >
      Registar
    </a>
  </>
)}

          </div>

        </div>

      </header>
    </>
  );
}