import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

const pillars = [
  {
    number: "01",
    title: "Feita para colecionadores",
    text: "Um espaço dedicado a miniaturas 1:64, pensado para quem compra, vende e acompanha peças de coleção.",
  },
  {
    number: "02",
    title: "Várias formas de participar",
    text: "Anúncios, leilões e sorteios reunidos numa única plataforma, com uma experiência simples e direta.",
  },
  {
    number: "03",
    title: "Uma plataforma portuguesa",
    text: "Criada em Portugal para aproximar colecionadores e dar maior visibilidade às suas miniaturas.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1480px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="text-[12px] font-black uppercase tracking-[4px] text-[#ffb800]">
            Garagem164
          </div>

          <h1 className="mt-5 max-w-[900px] text-[44px] font-black italic uppercase leading-[0.94] tracking-[-3px] min-[380px]:text-[48px] sm:text-[72px] sm:tracking-[-4px] lg:text-[88px]">
            A paixão pelas miniaturas, num só lugar.
          </h1>

          <p className="mt-8 max-w-[760px] text-[17px] leading-relaxed text-zinc-400 lg:text-[19px]">
            A Garagem164 é um marketplace dedicado a miniaturas
            colecionáveis à escala 1:64. Nasceu para reunir compradores e
            vendedores numa plataforma especializada, clara e próxima da
            comunidade portuguesa.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-12 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.number}
              className="rounded-[28px] border border-white/5 bg-zinc-950 p-7 sm:p-9"
            >
              <div className="text-[11px] font-black uppercase tracking-[3px] text-[#ffb800]">
                {pillar.number}
              </div>
              <h2 className="mt-5 text-2xl font-black uppercase leading-tight">
                {pillar.title}
              </h2>
              <p className="mt-4 leading-relaxed text-zinc-400">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-8 rounded-[28px] border border-[#ffb800]/20 bg-[#ffb800]/5 p-8 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[3px] text-[#ffb800]">
              Descobre a Garagem164
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
              Encontra a próxima peça da tua coleção.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-[#ffb800] px-7 text-[12px] font-black uppercase tracking-[1px] text-black transition hover:bg-[#ffc933]"
            >
              Ver anúncios
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-white/10 px-7 text-[12px] font-black uppercase tracking-[1px] text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
            >
              Contactar
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-8 overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-lg shadow-[#d62976]/10">
              <FaInstagram size={25} />
            </div>

            <div>
              <div className="text-[11px] font-black uppercase tracking-[3px] text-[#d62976]">
                @garagem164_pt
              </div>
              <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                Acompanha a Garagem164 no Instagram.
              </h2>
              <p className="mt-3 max-w-[700px] leading-relaxed text-zinc-400">
                Descobre novidades, miniaturas, leilões, sorteios e os
                bastidores da nossa garagem.
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/garagem164_pt/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] px-7 text-[12px] font-black uppercase tracking-[1px] text-white transition hover:brightness-110"
          >
            <FaInstagram size={16} />
            Visitar Instagram
          </a>
        </div>
      </section>
    </main>
  );
}
