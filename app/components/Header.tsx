"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

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

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `transition ${
      isActive(path)
        ? "text-[#ffb800]"
        : "text-white hover:text-[#ffb800]"
    }`;

  return (
    <>
      {/* TOPBAR */}

      <div className="hidden border-b border-white/5 bg-black lg:block">
        <div className="mx-auto flex h-[44px] max-w-[1480px] items-center justify-between px-12">

          <div className="flex flex-1 items-center justify-center text-[12px] font-semibold uppercase tracking-[1.5px] text-zinc-400">

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

          <div className="ml-8 flex items-center gap-3">

            <button
              type="button"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white transition-all duration-300 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black"
            >
              <FaInstagram size={13} />
            </button>

            <button
              type="button"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white transition-all duration-300 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black"
            >
              <FaFacebookF size={12} />
            </button>

            <button
              type="button"
              aria-label="YouTube"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white transition-all duration-300 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black"
            >
              <FaYoutube size={13} />
            </button>

          </div>

        </div>
      </div>

      {/* MAIN HEADER */}

      <header className="sticky top-0 z-50 h-[100px] border-b border-white/5 bg-black">

        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-12">

          {/* LOGO → HOMEPAGE */}

          <Link
            href="/"
            aria-label="Garagem164 — Homepage"
            className="mr-14 flex h-full shrink-0 items-center select-none"
          >
            <img
              src="/logo.png"
              alt="Garagem164"
              className="h-[115px] w-auto object-contain"
            />
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-9 text-[15px] font-bold uppercase tracking-[0.5px] xl:flex">

            <Link
              href="/"
              className={navLinkClass("/")}
            >
              Início
            </Link>

            <Link
              href="/auctions"
              className={navLinkClass("/auctions")}
            >
              Leilões
            </Link>

            <Link
              href="/raffles"
              className={navLinkClass("/raffles")}
            >
              Sorteios
            </Link>

            <Link
              href={session ? "/submit-listing" : "/login"}
              className="font-black text-[#ffb800] transition hover:text-[#ffc933]"
            >
              Vender
            </Link>

            <Link
              href="/collections"
              className={navLinkClass("/collections")}
            >
              Coleções
            </Link>

            <span className="cursor-default text-white">
              Comunidade
            </span>

            <span className="cursor-default text-white">
              Sobre Nós
            </span>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4">

            {/* SEARCH */}

            <button
              type="button"
              aria-label="Pesquisar"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/10 text-white transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800]"
            >
              <Search size={20} />
            </button>

            {/* CART */}

            <button
              type="button"
              aria-label="Carrinho"
              className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/10 text-white transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800]"
            >
              <ShoppingCart size={19} />

              <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffb800] text-[10px] font-black text-black">
                2
              </div>
            </button>

            {/* ACCOUNT */}

            {session ? (
              <div className="flex items-center gap-3">

                <Link
                  href="/account"
                  className="hidden h-[52px] items-center justify-center rounded-2xl border border-white/10 px-6 text-[13px] font-black uppercase tracking-[0.5px] text-white transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800] lg:flex"
                >
                  Minha Conta
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="flex h-[52px] items-center justify-center rounded-2xl bg-[#ffb800] px-8 text-[13px] font-black uppercase tracking-[0.5px] text-black shadow-[0_0_40px_rgba(255,184,0,0.16)] transition-all duration-300 hover:bg-[#ffc933]"
                >
                  Terminar Sessão
                </button>

              </div>
            ) : (
              <div className="flex items-center gap-3">

                <Link
                  href="/login"
                  className="hidden h-[52px] items-center justify-center rounded-2xl border border-white/10 px-6 text-[13px] font-black uppercase tracking-[0.5px] text-white transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800] lg:flex"
                >
                  Entrar
                </Link>

                <Link
                  href="/register"
                  className="flex h-[52px] items-center justify-center rounded-2xl bg-[#ffb800] px-8 text-[13px] font-black uppercase tracking-[0.5px] text-black shadow-[0_0_40px_rgba(255,184,0,0.16)] transition-all duration-300 hover:bg-[#ffc933]"
                >
                  Registar
                </Link>

              </div>
            )}

          </div>

        </div>

      </header>
    </>
  );
}