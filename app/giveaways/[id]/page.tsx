export default function GiveawayDetailPage() {
  return (

    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-2 gap-12 items-center">

          {/* IMAGE */}

          <div className="relative rounded-[32px] border border-white/5 bg-zinc-950 overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="w-[300px] h-[150px] rounded-full bg-[#ffb800]/20 blur-[120px]" />

            </div>

            <img
              src="/images/hero/cars/clio-williams.png"
              alt="Renault Clio Williams"
              className="relative z-10 w-[85%] mx-auto py-16"
            />

          </div>

          {/* INFO */}

          <div>

            <div className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#ffb800] text-black text-[11px] font-black uppercase tracking-[1px]">

              Sorteio Ativo

            </div>

            <h1 className="mt-6 text-[64px] leading-none font-black italic uppercase tracking-[-3px]">

              Renault
              <br />
              Clio Williams
            </h1>

            <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-[600px]">

              Participa neste sorteio exclusivo e habilita-te a ganhar
              uma miniatura premium para a tua coleção.
            </p>

            {/* STATS */}

            <div className="mt-10 grid grid-cols-3 gap-4">

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Ticket

                </div>

                <div className="mt-2 text-3xl font-black text-[#ffb800]">

                  €1

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Vendidos

                </div>

                <div className="mt-2 text-3xl font-black">

                  328

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Limite

                </div>

                <div className="mt-2 text-3xl font-black">

                  500

                </div>

              </div>

            </div>

            {/* PROGRESS */}

            <div className="mt-10">

              <div className="flex justify-between text-sm text-zinc-400 mb-3">

                <span>328 / 500 bilhetes vendidos</span>
                <span>65%</span>

              </div>

              <div className="h-4 rounded-full bg-zinc-900 overflow-hidden">

                <div className="h-full w-[65%] bg-[#ffb800]" />

              </div>

            </div>

            {/* BUTTON */}

            <button className="mt-10 h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)]">

              Comprar Tickets

            </button>

          </div>

        </div>

      </section>

      {/* DETAILS */}

      <section className="max-w-[1480px] mx-auto px-12 pb-20">

        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

          <h2 className="text-3xl font-black uppercase">

            Como Funciona
          </h2>

          <div className="mt-8 grid grid-cols-3 gap-8">

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                01
              </div>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                Compra os bilhetes que desejares para aumentar as tuas hipóteses.
              </p>

            </div>

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                02
              </div>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                Quando o limite for atingido, o sorteio é realizado.
              </p>

            </div>

            <div>

              <div className="text-[#ffb800] font-black text-2xl">
                03
              </div>

              <p className="mt-3 text-zinc-400 leading-relaxed">
                O vencedor é contactado e recebe a miniatura em casa.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>

  );
}