import Link from "next/link";
import { collectionBrands } from "./brands";

export default function CollectionsPage() {
  const brands = [
    {
      name: "Hot Wheels",
      slug: "hotwheels",
      logo: "/images/brands/hotwheels.png",
    },
    {
      name: "Mini GT",
      slug: "minigt",
      logo: "/images/brands/minigt.png",
    },
    {
      name: "Tarmac Works",
      slug: "tarmac",
      logo: "/images/brands/tarmac.png",
    },
    {
      name: "Inno64",
      slug: "inno64",
      logo: "/images/brands/inno64.png",
    },
    {
      name: "Matchbox",
      slug: "matchbox",
      logo: "/images/brands/matchbox.png",
    },
    {
      name: "Pop Race",
      slug: "poprace",
      logo: "/images/brands/poprace.png",
    },
    {
      name: "Greenlight",
      slug: "greenlight",
      logo: "/images/brands/greenlight.png",
    },
    {
      name: "Johnny Lightning",
      slug: "johnnylightning",
      logo: "/images/brands/johnnylightning.png",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="mx-auto max-w-[1480px] px-6 py-14 lg:px-12 lg:py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Garagem164
          </div>

          <h1 className="mt-5 text-[48px] font-black italic uppercase leading-none tracking-[-3px] sm:text-[64px] lg:text-[82px] lg:tracking-[-4px]">
            Coleções
          </h1>

          <p className="mt-6 text-zinc-400 text-[18px] max-w-[700px] leading-relaxed">
            Explora as principais marcas de miniaturas 1:64 e encontra
            anúncios colocados à venda pela comunidade Garagem164.
          </p>

        </div>

      </section>

      {/* BRANDS */}

      <section className="mx-auto max-w-[1480px] px-6 py-12 lg:px-12 lg:py-16">

        <div className="grid grid-cols-4 gap-6">

          {brands.map((brand) => {
            const isCollectionLandingPage = collectionBrands.some(
              (collectionBrand) => collectionBrand.slug === brand.slug,
            );
            const href = isCollectionLandingPage
              ? "/collections/" + brand.slug
              : "/listings?brand=" + encodeURIComponent(brand.name);

            return (

            <Link
              key={brand.name}
              href={href}
              className="group rounded-[28px] border border-white/5 bg-zinc-950 p-10 hover:border-[#ffb800]/30 transition-all duration-500 cursor-pointer block"
            >

              <div className="h-[120px] flex items-center justify-center">

                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-[70px] object-contain group-hover:scale-105 transition-all duration-500"
                />

              </div>

              <div className="mt-8 text-center">

                <h3 className="text-xl font-black">
                  {brand.name}
                </h3>

              </div>

            </Link>

            );
          })}

        </div>

      </section>

    </main>
  );
}
