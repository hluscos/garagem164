export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const brandNames: Record<string, string> = {
    hotwheels: "Hot Wheels",
    minigt: "Mini GT",
    tarmac: "Tarmac Works",
    inno64: "Inno64",
    matchbox: "Matchbox",
    poprace: "Pop Race",
    greenlight: "Greenlight",
    johnnylightning: "Johnny Lightning",
  };

  const brandName = brandNames[id] || id;

  return (

    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="max-w-[1480px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">

            Coleção

          </div>

          <h1 className="mt-5 text-[82px] leading-none font-black italic uppercase tracking-[-4px]">

            {brandName}

          </h1>

          <p className="mt-6 text-zinc-400 text-[18px] max-w-[700px] leading-relaxed">

            Descobre miniaturas {brandName},
            edições limitadas e modelos raros.

          </p>

        </div>

      </section>

      {/* PRODUCTS */}

      <section className="max-w-[1480px] mx-auto px-12 py-16">

        <div className="grid grid-cols-4 gap-6">

          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

            <div
              key={item}
              className="rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/30 transition-all duration-500"
            >

              <div className="h-[240px] bg-zinc-900 flex items-center justify-center">

                <img
                  src="/images/hero/cars/clio-williams.png"
                  alt=""
                  className="w-[80%]"
                />

              </div>

              <div className="p-6">

                <div className="text-zinc-500 text-xs uppercase tracking-[2px]">

                  {brandName}

                </div>

                <h3 className="mt-2 text-xl font-black">

                  Renault Clio Williams

                </h3>

                <div className="mt-4 text-[#ffb800] font-black text-2xl">

                  €14.99

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>

  );
}