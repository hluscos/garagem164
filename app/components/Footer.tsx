import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (

    <footer className="relative overflow-hidden border-t border-white/5 bg-black mt-24">

      {/* GLOW */}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#ffb800]/10 blur-[180px]" />

      {/* CONTAINER */}

      <div className="relative z-10 max-w-[1480px] mx-auto px-12 py-20">

        <div className="grid grid-cols-4 gap-16">

          {/* BRAND */}

          <div>

            <img
              src="/logo.png"
              alt="Garagem164"
              className="h-[90px] w-auto"
            />

            <p className="mt-5 text-zinc-400 leading-relaxed max-w-[280px]">

              O marketplace premium para colecionadores
              de miniaturas 1:64.

            </p>

            {/* SOCIALS */}

            <div className="mt-8 flex items-center gap-3">

              <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 flex items-center justify-center text-white">

                <FaInstagram size={14} />

              </button>

              <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 flex items-center justify-center text-white">

                <FaFacebookF size={13} />

              </button>

              <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-black transition-all duration-300 flex items-center justify-center text-white">

                <FaYoutube size={14} />

              </button>

            </div>

          </div>

          {/* LINKS */}

          <div>

            <h3 className="text-white font-black uppercase tracking-[1px]">

              Marketplace

            </h3>

            <div className="mt-6 flex flex-col gap-4 text-zinc-400">

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

            </div>

          </div>

          {/* SUPPORT */}

          <div>

            <h3 className="text-white font-black uppercase tracking-[1px]">

              Suporte

            </h3>

            <div className="mt-6 flex flex-col gap-4 text-zinc-400">

              <a href="#" className="hover:text-[#ffb800] transition">
                Ajuda
              </a>

              <a href="#" className="hover:text-[#ffb800] transition">
                Contactos
              </a>

              <a href="#" className="hover:text-[#ffb800] transition">
                Envios
              </a>

              <a href="#" className="hover:text-[#ffb800] transition">
                Termos
              </a>

            </div>

          </div>

          {/* NEWSLETTER */}

          <div>

            <h3 className="text-white font-black uppercase tracking-[1px]">

              Novidades

            </h3>

            <p className="mt-6 text-zinc-400 leading-relaxed">

              Recebe novos drops, sorteios e leilões exclusivos.

            </p>

            <div className="mt-6">

              <input
                type="email"
                placeholder="O teu email"
                className="w-full h-[56px] rounded-2xl bg-zinc-950 border border-white/10 px-5 text-white outline-none focus:border-[#ffb800] transition-all"
              />

              <button className="mt-4 w-full h-[56px] rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px]">

                Subscrever

              </button>

            </div>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="mt-20 pt-8 border-t border-white/5 flex items-center justify-between text-zinc-500 text-[13px]">

          <div>
            © 2026 Garagem164. Todos os direitos reservados.
          </div>

          <div>
            Built for collectors.
          </div>

        </div>

      </div>

    </footer>

  );
}