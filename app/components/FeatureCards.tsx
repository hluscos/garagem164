export default function FeatureCards() {
  return (

    <section className="max-w-[1800px] mx-auto px-8 py-10">

      <div className="grid grid-cols-3 gap-6">

        {/* CARD 1 */}

        <a
          href="/auctions"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px] block"
        >

          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-all duration-[1800ms]"
            style={{
              backgroundImage: "url('/images/cards/auction-card.png')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10" />

        </a>

        {/* CARD 2 */}

        <a
          href="/giveaways"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px] block"
        >

          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-all duration-[1800ms]"
            style={{
              backgroundImage: "url('/images/cards/giveaway-card.png')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10" />

        </a>

        {/* CARD 3 */}

        <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 h-[220px]">

          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-all duration-[1800ms]"
            style={{
              backgroundImage: "url('/images/cards/rare-card.png')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10" />

        </div>

      </div>

    </section>

  );
}