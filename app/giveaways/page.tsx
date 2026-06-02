export default function rafflePage() {
  return (

    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}

      <section className="relative h-[420px] border-b border-white/5 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('/images/cards/raffle-card.png')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black" />

        <div className="relative z-10 max-w-[1480px] mx-auto px-12 h-full flex flex-col justify-center">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">

            Sorteios Exclusivos

          </div>

          <h1 className="mt-5 text-[82px] leading-none font-black italic uppercase tracking-[-4px]">

            Sorteios

          </h1>

          <p className="mt-6 text-zinc-400 text-[18px] max-w-[620px] leading-relaxed">

            Participa para ganhar miniaturas raras,
            edições limitadas e peças exclusivas para a tua coleção.

          </p>

        </div>

      </section>

      {/* STATUS */}

      <section className="border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 py-8 flex flex-wrap gap-4">

          <div className="h-[42px] px-5 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Ativos

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            A Terminar

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Novos Sorteios

          </div>

        </div>

      </section>

      {/* GRID */}

      <section className="max-w-[1480px] mx-auto px-12 py-14">

        <div className="grid grid-cols-4 gap-6">

          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

            <div
              key={item}
              className="group rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/30 transition-all duration-500"
            >

              <div className="relative h-[260px] overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-[180px] h-[90px] rounded-full bg-[#ffb800]/20 blur-[70px]" />

                </div>

                <img
                  src="/images/hero/cars/clio-williams.png"
                  alt=""
                  className="relative z-10 w-[82%] mx-auto mt-10 group-hover:scale-105 transition-all duration-700"
                />

                <div className="absolute top-4 left-4 h-[32px] px-4 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">

                  Sorteio

                </div>

              </div>

              <div className="p-6">

                <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">

                  Ticket €1

                </div>

                <h3 className="mt-3 text-[22px] font-black leading-tight">

                  Renault Clio Williams

                </h3>

                <div className="mt-6 flex items-center justify-between">

                  <div>

                    <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">

                      Bilhetes Vendidos

                    </div>

                    <div className="mt-1 text-[28px] font-black text-[#ffb800]">

                      328

                    </div>

                  </div>

                  <a
  href="/raffles/clio-williams"
  className="h-[48px] px-5 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[12px] font-black uppercase tracking-[1px] inline-flex items-center justify-center"
>

  Participar

</a>
                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>

  );
}