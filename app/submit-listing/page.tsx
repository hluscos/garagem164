export default function SubmitListingPage() {
  return (

    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="max-w-[1200px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">

            Garagem164

          </div>

          <h1 className="mt-5 text-[72px] leading-none font-black italic uppercase tracking-[-4px]">

            Vender Miniatura

          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">

            Publica a tua miniatura 1:64 para venda direta,
            leilão ou sorteio.

          </p>

        </div>

      </section>

      {/* FORM */}

      <section className="max-w-[1200px] mx-auto px-12 py-16">

        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

          <div className="grid grid-cols-2 gap-8">

            {/* MARCA */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Marca

              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">

                <option>Hot Wheels</option>
                <option>Mini GT</option>
                <option>Inno64</option>
                <option>Tarmac Works</option>
                <option>Matchbox</option>
                <option>Pop Race</option>
                <option>Greenlight</option>
                <option>Johnny Lightning</option>
                <option>Kaido House</option>
                <option>M2 Machines</option>
                <option>Auto World</option>
                <option>Outro</option>

              </select>

            </div>

            {/* MODELO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Modelo

              </label>

              <input
                type="text"
                placeholder="Ex: Ferrari F40"
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              />

            </div>

            {/* CATEGORIA */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Categoria

              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">

                <option>Carro</option>
                <option>Camião</option>
                <option>Carrinha</option>
                <option>Motociclo</option>
                <option>Transportador</option>

              </select>

            </div>

            {/* ESTADO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Estado

              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">

                <option>Novo</option>
                <option>Como Novo</option>
                <option>Usado</option>

              </select>

            </div>

            {/* PREÇO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Preço Inicial

              </label>

              <input
                type="number"
                placeholder="0.00"
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              />

            </div>

            {/* TIPO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

                Tipo de Anúncio

              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">

                <option>Venda Direta</option>
                <option>Leilão</option>
                <option>Sorteio</option>

              </select>

            </div>

          </div>

          {/* DESCRIÇÃO */}

          <div className="mt-8">

            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

              Descrição

            </label>

            <textarea
              rows={6}
              className="w-full rounded-2xl bg-black border border-white/10 p-4"
              placeholder="Descreve a miniatura..."
            />

          </div>

          {/* FOTOS */}

          <div className="mt-8">

            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">

              Fotos

            </label>

            <input
              type="file"
              multiple
              className="w-full rounded-2xl bg-black border border-white/10 p-4"
            />

          </div>

          {/* BUTTON */}

          <button className="mt-10 h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px]">

            Publicar Miniatura

          </button>

        </div>

      </section>

    </main>

  );
}

