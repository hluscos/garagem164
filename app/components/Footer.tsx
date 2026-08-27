import Link from "next/link";
import CookiePreferencesButton from "./CookiePreferencesButton";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 text-white">

      <div className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">

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

              <Link href="/auctions" className="hover:text-white transition">
                Leilões
              </Link>

              <a href="/listings" className="hover:text-white transition">
                Anúncios
              </a>

              <a href="/submit-listing" className="hover:text-white transition">
                Vender
              </a>

              <Link href="/raffles" className="hover:text-white transition">
                Sorteios
              </Link>

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
              <CookiePreferencesButton />
             <a href="/raffles-rules" className="hover:text-white transition">
  Regras dos Sorteios
</a>
            </div>

          </div>

          <NewsletterForm />

        </div>

        <div className="mt-14 pt-8 border-t border-white/5">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-zinc-500 text-sm">
              Anunciar na Garagem164 é gratuito.
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
