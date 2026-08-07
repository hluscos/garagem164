"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  Gavel,
  Package,
  Heart,
  Settings,
  UserCircle2,
  BadgeCheck,
} from "lucide-react";

const menu = [
  {
    href: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/account/purchases",
    label: "Compras",
    icon: ShoppingBag,
  },
  {
    href: "/account/raffles",
    label: "Sorteios",
    icon: Ticket,
  },
  {
    href: "/account/auctions",
    label: "Leilões",
    icon: Gavel,
  },
  {
    href: "/account/listings",
    label: "Anúncios",
    icon: Package,
  },
  {
    href: "/account/favorites",
    label: "Favoritos",
    icon: Heart,
  },
  {
    href: "/account/settings",
    label: "Definições",
    icon: Settings,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[300px] rounded-[32px] border border-white/5 bg-zinc-950 p-6">

      {/* Perfil */}

      <div className="rounded-3xl border border-white/10 bg-black p-6">

        <div className="flex justify-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffb800]/15 border border-[#ffb800]/30">

            <UserCircle2
              size={56}
              className="text-[#ffb800]"
            />

          </div>

        </div>

        <div className="mt-5 text-center">

          <h2 className="text-xl font-black">
            A Minha Conta
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[2px] text-[#ffb800]">

            <BadgeCheck size={14} />

            Conta Verificada

          </div>

        </div>

      </div>

      {/* Voltar */}

      <Link
        href="/"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-zinc-300 transition-all duration-300 hover:border-[#ffb800] hover:text-[#ffb800]"
      >
        <ArrowLeft size={18} />

        Voltar ao Garagem164

      </Link>

      {/* Menu */}

      <nav className="mt-8 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                active
                  ? "bg-[#ffb800] text-black font-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={20} />

              <span>{item.label}</span>

            </Link>
          );
        })}

      </nav>

    </aside>
  );
}