export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 text-white">

      <div className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-4 gap-12">

          {/* BRAND */}

          <div>

            <h3 className="text-2xl font-black italic">
              GARAGEM164
            </h3>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Marketplace dedicado a miniaturas colecionáveis.
              Compra, vende e participa em leilões exclusivos.
            </p>

          </div>

          {/* MARKETPLACE */}

          <div>

            <h4 className="text-sm uppercase tracking-[2px] font-black text-[#ffb800]">
              Marketplace
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <a href="/auctions" className="hover:text-white transition">
                Leilões
              </a>

              <a href="/collections" className="hover:text-white transition">
                Coleções
              </a>

              <a href="/submit-listing" className="hover:text-white transition">
                Vender
              </a>

              <a href="/raffles" className="hover:text-white transition">
                Sorteios
              </a>

            </div>

          </div>

          {/* AJUDA */}

          <div>

            <h4 className="text-sm uppercase tracking-[2px] font-black text-[#ffb800]">
              Ajuda
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <a href="/faq" className="hover:text-white transition">
                Perguntas Frequentes
              </a>

              <a href="/shipping" className="hover:text-white transition">
                Envios
              </a>

              <a href="/contact" className="hover:text-white transition">
                Contacto
              </a>

            </div>

          </div>

          {/* LEGAL */}

          <div>

            <h4 className="text-sm uppercase tracking-[2px] font-black text-[#ffb800]">
              Legal
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <a href="/terms" className="hover:text-white transition">
                Termos e Condições
              </a>

              <a href="/privacy" className="hover:text-white transition">
                Política de Privacidade
              </a>

              <a href="/cookies" className="hover:text-white transition">
                Política de Cookies
              </a>
             <a href="/raffles-rules" className="hover:text-white transition">
  Regras dos Sorteios
</a>
            </div>

          </div>

        </div>

        <div className="mt-14 pt-8 border-t border-white/5">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-zinc-500 text-sm">
              0% de comissão durante os primeiros 6 meses após o lançamento.
            </p>

            <p className="text-zinc-600 text-sm">
              © 2026 Garagem164. Todos os direitos reservados.
            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}