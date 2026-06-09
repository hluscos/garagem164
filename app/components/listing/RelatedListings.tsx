"use client";

import Link from "next/link";

type Props = {
  listings?: any[];
};

export default function RelatedListings({
  listings = [],
}: Props) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-20">

      <h2 className="text-3xl font-black mb-8">
        Anúncios Relacionados
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {listings.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="rounded-[28px] border border-white/10 bg-zinc-950 overflow-hidden hover:border-[#ffb800]/40 transition"
          >
            <img
              src="https://placehold.co/600x400"
              alt={item.model}
              className="w-full aspect-[4/3] object-cover"
            />

            <div className="p-5">

              <div className="font-bold">
                {item.model}
              </div>

              <div className="text-zinc-500 text-sm mt-1">
                {item.brand}
              </div>

              <div className="mt-4 text-[#ffb800] font-black">
                {item.price}€
              </div>

            </div>

          </Link>
        ))}

      </div>

    </section>
  );
}