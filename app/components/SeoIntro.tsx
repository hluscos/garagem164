import Link from "next/link";

export default function SeoIntro() {
  return (
    <section className="border-t border-white/5 bg-zinc-950/70 text-white">
      <div className="mx-auto grid max-w-[1480px] gap-8 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[3px] text-[#ffb800]">
            Garagem164 em Portugal
          </div>
          <h2 className="mt-4 max-w-[760px] text-3xl font-black uppercase leading-tight sm:text-4xl">
            Comprar e vender miniaturas 1:64, numa comunidade feita para colecionadores.
          </h2>
          <p className="mt-5 max-w-[760px] leading-relaxed text-zinc-400">
            A Garagem164 reúne anúncios de miniaturas colecionáveis, leilões e
            sorteios num único marketplace português. Explora peças para a tua
            coleção ou publica a próxima miniatura que queres vender.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-[28px] border border-[#ffb800]/20 bg-black p-7 sm:p-8">
          <p className="leading-relaxed text-zinc-400">
            Descobre anúncios de{" "}
            <Link href="/collections" className="font-bold text-[#ffb800] hover:text-[#ffc933]">
              Hot Wheels, Mini GT e Inno64
            </Link>{" "}
            e encontra modelos disponíveis na comunidade.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ffb800] px-5 text-[11px] font-black uppercase tracking-[1px] text-black transition hover:bg-[#ffc933]"
            >
              Ver miniaturas à venda
            </Link>
            <Link
              href="/submit-listing"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-[11px] font-black uppercase tracking-[1px] text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
            >
              Vender uma miniatura
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
