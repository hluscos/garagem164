export default function ListingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="max-w-[1480px] mx-auto px-12 py-12">

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-10">

          {/* LEFT */}

          <div>

            {/* MAIN IMAGE */}

            <div className="aspect-[16/10] rounded-[28px] overflow-hidden border border-white/10 bg-zinc-950">

              <img
                src="https://placehold.co/1200x800"
                alt="Miniatura"
                className="w-full h-full object-cover"
              />

            </div>

            {/* THUMBNAILS */}

            <div className="grid grid-cols-5 gap-3 mt-4">

              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-950"
                >
                  <img
                    src={`https://placehold.co/300x300?text=${item}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

            </div>

          </div>

          {/* RIGHT */}

          <div>

            <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">

              <div className="inline-flex items-center h-[34px] px-4 rounded-full bg-[#ffb800]/10 border border-[#ffb800]/20 text-[#ffb800] text-[12px] font-black uppercase tracking-[1px]">
                Leilão
              </div>

              <h1 className="mt-5 text-5xl font-black">
                Ferrari F40 LM
              </h1>

              <p className="mt-3 text-zinc-400 text-lg">
                Inno64 • Escala 1:64
              </p>

              <div className="mt-8">

                <div className="text-zinc-500 text-sm uppercase tracking-[1px]">
                  Licitação Atual
                </div>

                <div className="mt-2 text-[54px] font-black text-[#ffb800]">
                  72,00€
                </div>

              </div>

              <div className="mt-8">

                <div className="text-zinc-500 text-sm uppercase tracking-[1px]">
                  Termina em
                </div>

                <div className="mt-3 flex gap-3">

                  <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">02</span>
                    <span className="text-[11px] text-zinc-500">
                      Dias
                    </span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">14</span>
                    <span className="text-[11px] text-zinc-500">
                      Horas
                    </span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">37</span>
                    <span className="text-[11px] text-zinc-500">
                      Min
                    </span>
                  </div>

                </div>

              </div>

              <button className="mt-10 w-full h-[60px] rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition text-black font-black uppercase">
                Licitar Agora
              </button>

              <button className="mt-4 w-full h-[60px] rounded-2xl border border-white/10 hover:border-[#ffb800] transition font-black uppercase">
                Adicionar aos Favoritos
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* DETAILS */}

      <section className="max-w-[1480px] mx-auto px-12 pb-20">

        <div className="grid grid-cols-3 gap-6">

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Descrição
            </h2>

            <p className="mt-5 text-zinc-400 leading-relaxed">
              Ferrari F40 LM Inno64 em excelente estado.
              Inclui caixa original e todos os acessórios.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Detalhes
            </h2>

            <div className="mt-5 space-y-3 text-zinc-400">

              <div>Marca: Inno64</div>
              <div>Escala: 1:64</div>
              <div>Estado: Novo</div>
              <div>Localização: Porto</div>

            </div>

          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Vendedor
            </h2>

            <p className="mt-5 text-zinc-400">
              Garagem164 Collector
            </p>

            <button className="mt-6 w-full h-[52px] rounded-2xl border border-white/10 hover:border-[#ffb800] transition">
              Ver Perfil
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}