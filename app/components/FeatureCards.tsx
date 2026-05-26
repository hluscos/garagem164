export default function FeatureCards() {
  return (
    <section className="max-w-[1800px] mx-auto px-8 py-10">

      <div className="grid grid-cols-3 gap-6">

        {/* CARD 1 */}

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px] p-8">

          <div className="relative z-10">

            <h3 className="text-3xl font-black uppercase mb-4">
              Leilões ao Vivo
            </h3>

            <p className="text-zinc-400 max-w-[260px] leading-relaxed mb-8">
              Disputa os itens mais desejados em tempo real.
            </p>

            <button className="px-6 h-11 rounded-xl border border-orange-500 text-sm font-bold uppercase hover:bg-orange-500 hover:text-black transition">

              Ver Leilões

            </button>

          </div>

        </div>







        {/* CARD 2 */}

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px] p-8">

          <div className="relative z-10">

            <h3 className="text-3xl font-black uppercase mb-4">
              Sorteios Exclusivos
            </h3>

            <p className="text-zinc-400 max-w-[260px] leading-relaxed mb-8">
              Participa e ganha peças raras para a tua coleção.
            </p>

            <button className="px-6 h-11 rounded-xl border border-orange-500 text-sm font-bold uppercase hover:bg-orange-500 hover:text-black transition">

              Ver Sorteios

            </button>

          </div>

        </div>







        {/* CARD 3 */}

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px] p-8">

          <div className="relative z-10">

            <h3 className="text-3xl font-black uppercase mb-4">
              Peças Raras
            </h3>

            <p className="text-zinc-400 max-w-[260px] leading-relaxed mb-8">
              Miniaturas difíceis de encontrar e edições limitadas.
            </p>

            <button className="px-6 h-11 rounded-xl border border-orange-500 text-sm font-bold uppercase hover:bg-orange-500 hover:text-black transition">

              Explorar

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}