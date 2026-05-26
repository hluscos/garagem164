import {
  Search,
  ShoppingCart,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

export default function Header() {
  return (
    <>
      {/* TOPBAR */}

      <div className="hidden lg:block bg-black border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 h-[38px] flex items-center justify-between text-[10px] tracking-[1px] text-zinc-400 uppercase">

          <div className="flex items-center gap-10">

            <div className="flex items-center gap-2">
              🚚
              <span>Envio rápido para todo o país</span>
            </div>

            <div className="flex items-center gap-2">
              🔥
              <span>Produtos 100% originais</span>
            </div>

            <div className="flex items-center gap-2">
              🏁
              <span>Comunidade de colecionadores</span>
            </div>

            <div className="flex items-center gap-2">
              🛟
              <span>Suporte 24/7</span>
            </div>

          </div>

          {/* SOCIALS */}

          <div className="flex items-center gap-3">

            <button className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaInstagram size={14} />

            </button>

            <button className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaFacebookF size={13} />

            </button>

            <button className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 rounded-xl flex items-center justify-center text-white">

              <FaYoutube size={14} />

            </button>

          </div>

        </div>

      </div>

      {/* MAIN HEADER */}

      <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-2xl border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 h-[88px] flex items-center justify-between">

          {/* LOGO */}

          <div className="flex items-center cursor-pointer select-none mr-14">

            <img
              src="/logo.png"
              alt="Garagem164"
              className="h-[94px] w-auto"
            />

          </div>

          {/* NAVIGATION */}

          <nav className="hidden xl:flex items-center gap-9 text-[15px] font-bold uppercase tracking-[0.5px]">

            <a
              href="#"
              className="text-[#ffb800] relative after:absolute after:left-0 after:-bottom-[31px] after:w-full after:h-[3px] after:rounded-full after:bg-[#ffb800]"
            >
              Início
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
              Leilões
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
              Sorteios
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
              Loja
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
              Coleções
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
              Comunidade
            </a>

            <a href="#" className="hover:text-[#ffb800] transition">
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

{/* LOGIN */}

<a
  href="/login"
  className="h-[56px] px-10 rounded-2xl border border-white/10 hover:border-[#ffb800] transition-all duration-300 text-[14px] font-bold uppercase tracking-[0.5px] flex items-center justify-center"
>

  Entrar

</a>

{/* REGISTER */}

<a
  href="/register"
  className="h-[56px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[14px] font-black uppercase tracking-[0.5px] shadow-[0_0_40px_rgba(255,184,0,0.16)] flex items-center justify-center"
>

  Registar

</a>

</div>
        </div>

      </header>
    </>
  );
}