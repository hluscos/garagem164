export default function AuctionsPage() {
  return (

    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}

      <section className="relative h-[420px] border-b border-white/5 overflow-hidden">

  {/* BACKGROUND */}
  {/* BACKGROUND */}

<div className="absolute inset-0 overflow-hidden">

  <img
    src="/images/cards/auction-background.png"
    alt=""
    className="absolute inset-0 h-full w-full object-cover opacity-75"
  />

  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/80" />

  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />

</div>

  {/* CONTENT */}
  <div className="relative z-10 max-w-[1480px] mx-auto px-12 h-full flex flex-col justify-center">

    ...
    
  </div>

</section>

      {/* FILTER BAR */}

      <section className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">

        <div className="max-w-[1480px] mx-auto px-12 h-[90px] flex items-center gap-4 overflow-x-auto">

          {[
            "Hot Wheels",
            "MiniGT",
            "Inno64",
            "Kaido House",
            "Pop Race",
            "RLC",
          ].map((brand) => (

            <button
              key={brand}
              className="h-[46px] px-6 rounded-2xl border border-white/10 bg-black hover:border-[#ffb800] hover:text-[#ffb800] transition-all duration-300 text-[13px] uppercase tracking-[1px] font-bold whitespace-nowrap"
            >

              {brand}

            </button>

          ))}

        </div>

      </section>

      {/* STATUS */}

      <section className="max-w-[1480px] mx-auto px-12 pt-12">

        <div className="flex items-center gap-4 flex-wrap">

          <div className="h-[42px] px-5 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Ao Vivo

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Últimos Minutos

          </div>

          <div className="h-[42px] px-5 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-[12px] font-black uppercase tracking-[1px]">

            Novos Leilões

          </div>

        </div>

      </section>

      {/* GRID */}

      <section className="max-w-[1480px] mx-auto px-12 py-14">

        <div className="grid grid-cols-4 gap-6">

          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

            <div
              key={item}
              className="group relative rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/30 transition-all duration-500"
            >

              {/* IMAGE */}

              <div className="relative h-[260px] overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-[180px] h-[90px] rounded-full bg-[#ffb800]/20 blur-[70px]" />

                </div>

                <img
                  src="/images/hero/cars/porsche-gt3rs.png"
                  alt=""
                  className="relative z-10 w-[82%] mx-auto mt-10 group-hover:scale-105 transition-all duration-700"
                />

                {/* BADGE */}

                <div className="absolute top-4 left-4 h-[32px] px-4 rounded-full bg-[#ffb800] text-black flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">

                  Raro

                </div>

                {/* COUNTDOWN */}

                <div className="absolute top-4 right-4 h-[32px] px-4 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">

                  02:14:55

                </div>

              </div>

              {/* INFO */}

              <div className="p-6">

                <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">

                  MiniGT

                </div>

                <h3 className="mt-3 text-[22px] font-black leading-tight">

                  Porsche 911 GT3RS

                </h3>

                <div className="mt-6 flex items-center justify-between">

                  <div>

                    <div className="text-zinc-500 text-[11px] uppercase tracking-[2px] font-bold">

                      Licitação Atual

                    </div>

                    <div className="mt-1 text-[28px] font-black text-[#ffb800]">

                      €42

                    </div>

                  </div>

                  <button className="h-[48px] px-5 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[12px] font-black uppercase tracking-[1px]">

                    Licitar

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>

  );
}