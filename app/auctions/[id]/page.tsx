export default function AuctionDetailPage() {
  return (

    <main className="min-h-screen bg-black text-white">

      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-2 gap-12 items-center">

          {/* IMAGE */}

          <div className="relative rounded-[32px] border border-white/5 bg-zinc-950 overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="w-[300px] h-[150px] rounded-full bg-[#ffb800]/20 blur-[120px]" />

            </div>

            <img
              src="/images/hero/cars/porsche-gt3rs.png"
              alt="Porsche GT3RS"
              className="relative z-10 w-[85%] mx-auto py-16"
            />

          </div>

          {/* INFO */}

          <div>

            <div className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#ffb800] text-black text-[11px] font-black uppercase tracking-[1px]">

              Leilão Ativo

            </div>

            <h1 className="mt-6 text-[64px] leading-none font-black italic uppercase tracking-[-3px]">

              Porsche
              <br />
              911 GT3RS

            </h1>

            <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-[600px]">

              Miniatura premium em leilão.
              Licita e adiciona uma peça rara à tua coleção.

            </p>

            {/* STATS */}

            <div className="mt-10 grid grid-cols-3 gap-4">

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Licitação Atual

                </div>

                <div className="mt-2 text-3xl font-black text-[#ffb800]">

                  €42

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Licitações

                </div>

                <div className="mt-2 text-3xl font-black">

                  17

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                  Observadores

                </div>

                <div className="mt-2 text-3xl font-black">

                  53

                </div>

              </div>

            </div>

            {/* COUNTDOWN */}

            <div className="mt-10">

              <div className="text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

                Termina em

              </div>

              <div className="mt-3 text-[42px] font-black text-[#ffb800]">

                02d 14h 22m

              </div>

            </div>

            {/* BUTTON */}

            <a
  href="/login"
  className="mt-10 inline-flex items-center justify-center h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.2)]"
>

  Licitar Agora

</a>

          </div>

        </div>

      </section>

      {/* BID HISTORY */}

      <section className="max-w-[1480px] mx-auto px-12 pb-20">

        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

          <h2 className="text-3xl font-black uppercase">

            Últimas Licitações

          </h2>

          <div className="mt-8">

            {/* HEADER */}

            <div className="grid grid-cols-3 pb-4 border-b border-white/10 text-zinc-500 text-xs uppercase tracking-[2px] font-bold">

              <div>Utilizador</div>

              <div className="text-center">Valor</div>

              <div className="text-right">Hora</div>

            </div>

            {/* ROW 1 */}

            <div className="grid grid-cols-3 py-5 border-b border-white/5">

              <div className="text-zinc-300">
                P***** M*****
              </div>

              <div className="text-center text-[#ffb800] font-black">
                €42
              </div>

              <div className="text-right text-zinc-500">
                18:34
              </div>

            </div>

            {/* ROW 2 */}

            <div className="grid grid-cols-3 py-5 border-b border-white/5">

              <div className="text-zinc-300">
                J**** C******
              </div>

              <div className="text-center text-[#ffb800] font-black">
                €40
              </div>

              <div className="text-right text-zinc-500">
                18:31
              </div>

            </div>

            {/* ROW 3 */}

            <div className="grid grid-cols-3 py-5 border-b border-white/5">

              <div className="text-zinc-300">
                M***** R******
              </div>

              <div className="text-center text-[#ffb800] font-black">
                €38
              </div>

              <div className="text-right text-zinc-500">
                18:27
              </div>

            </div>

            {/* ROW 4 */}

            <div className="grid grid-cols-3 py-5">

              <div className="text-zinc-300">
                R***** S******
              </div>

              <div className="text-center text-[#ffb800] font-black">
                €36
              </div>

              <div className="text-right text-zinc-500">
                18:22
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );
}