import { optimizedImage } from "@/lib/images";

const cards = [
  ["/auctions", "Leilões", "/images/cards/auction-card.png", "object-cover"],
  ["/raffles", "Sorteios", "/images/cards/raffles-card.png", "object-cover"],
  ["/listings", "Anúncios", "/images/cards/rare-card.png", "object-contain"],
] as const;

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-[1800px] px-6 py-8 sm:px-8 sm:py-10">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {cards.map(([href, label, source, fit]) => (
          <a
            key={href}
            href={href}
            aria-label={label}
            className="group relative block h-[180px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:h-[220px]"
          >
            <img
              src={optimizedImage(source, { width: 760, quality: 76 })}
              alt=""
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full ${fit} object-center transition-transform duration-[1800ms] group-hover:scale-[1.03]`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10" />
          </a>
        ))}

      </div>

    </section>
  );
}
