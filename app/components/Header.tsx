"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import {
  Menu,
  Search,
  X,
} from "lucide-react";

import { FaInstagram } from "react-icons/fa";

import { supabase } from "@/lib/supabase";
import GlobalSearch from "./GlobalSearch";

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    const handleFocus = () => {
      loadSession();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
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

          <div className="ml-8 flex items-center gap-3">

            <a
              href="https://www.instagram.com/garagem164_pt/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Garagem164"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-sm transition-all duration-300 hover:scale-105 hover:brightness-110"
            >
              <FaInstagram size={12} />
            </a>

          </div>

        </div>
      </div>

      {/* MAIN HEADER */}

      <header className="sticky top-0 z-50 h-[80px] border-b border-white/5 bg-black lg:h-[100px]">

        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12">

          <Link
            href="/"
            aria-label="Garagem164 — Homepage"
            className="relative h-[58px] w-[170px] shrink-0 select-none overflow-hidden lg:flex lg:h-full lg:w-auto lg:items-center lg:overflow-visible xl:mr-14"
          >
            <img
              src="/logo.png"
              alt="Garagem164"
              className="absolute -left-[36px] -top-[31px] h-auto w-[210px] max-w-none object-contain lg:static lg:h-[115px] lg:w-auto lg:max-w-full"
            />
          </Link>

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
              href="/listings"
              className={navLinkClass("/listings")}
            >
              Anúncios
            </Link>

            <Link
              href="/about"
              className={navLinkClass("/about")}
            >
              Sobre Nós
            </Link>

          </nav>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">

            <button
              type="button"
              aria-label="Pesquisar"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/10 text-white transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800] lg:h-[52px] lg:w-[52px] lg:rounded-2xl"
            >
              <Search size={20} />
            </button>

            {session ? (
              <div className="hidden items-center gap-3 xl:flex">

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
                    setSession(null);
                    window.location.href = "/";
                  }}
                  className="flex h-[52px] items-center justify-center rounded-2xl bg-[#ffb800] px-8 text-[13px] font-black uppercase tracking-[0.5px] text-black shadow-[0_0_40px_rgba(255,184,0,0.16)] transition-all duration-300 hover:bg-[#ffc933]"
                >
                  Terminar Sessão
                </button>

              </div>
            ) : (
              <div className="hidden items-center gap-3 xl:flex">

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

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-[#ffb800] hover:text-[#ffb800] xl:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute left-0 right-0 top-full border-b border-white/10 bg-black/98 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl xl:hidden"
          >
            <nav className="mx-auto flex max-w-[720px] flex-col px-5 py-5 text-sm font-black uppercase tracking-[0.8px] sm:px-8">
              {[
                ["/", "Início"],
                ["/auctions", "Leilões"],
                ["/raffles", "Sorteios"],
                ["/listings", "Anúncios"],
                ["/about", "Sobre Nós"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-12 items-center border-b border-white/5 transition ${
                    isActive(href)
                      ? "text-[#ffb800]"
                      : "text-white hover:text-[#ffb800]"
                  }`}
                >
                  {label}
                </Link>
              ))}

              <Link
                href={session ? "/submit-listing" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#ffb800] text-black transition hover:bg-[#ffc933]"
              >
                Vender
              </Link>

              {session ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
                  >
                    Minha Conta
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setSession(null);
                      setMobileMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="flex h-12 items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-xl border border-[#ffb800]/50 text-[#ffb800] transition hover:border-[#ffb800]"
                  >
                    Registar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

      </header>

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
