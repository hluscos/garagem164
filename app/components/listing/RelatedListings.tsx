export default function RelatedListings() {
  return (
    <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-20">

      <h2 className="text-3xl font-black mb-8">
        Anúncios Relacionados
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-[28px] border border-white/10 bg-zinc-950 overflow-hidden"
          >
            <img
              src={`https://placehold.co/600x400?text=${item}`}
              alt=""
              className="w-full aspect-[4/3] object-cover"
            />

            <div className="p-5">

              <div className="font-bold">
                Ferrari F40 LM
              </div>

              <div className="text-zinc-500 text-sm mt-1">
                Inno64
              </div>

              <div className="mt-4 text-[#ffb800] font-black">
                72€
              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}