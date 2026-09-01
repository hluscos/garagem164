import Link from "next/link";
import { optimizedImage } from "@/lib/images";

export default function BrandsRow() {
  const brands = [
    {
      name: "Hot Wheels",
      slug: "hotwheels",
      logo: "/images/brands/hotwheels.png",
      height: "h-[62px]",
    },
    {
      name: "Mini GT",
      slug: "minigt",
      logo: "/images/brands/minigt.png",
      height: "h-[54px]",
    },
    {
      name: "Tarmac Works",
      slug: "tarmac",
      logo: "/images/brands/tarmac.png",
      height: "h-[58px]",
    },
    {
      name: "Inno64",
      slug: "inno64",
      logo: "/images/brands/inno64.png",
      height: "h-[58px]",
    },
    {
      name: "Matchbox",
      slug: "matchbox",
      logo: "/images/brands/matchbox.png",
      height: "h-[50px]",
    },
    {
      name: "Pop Race",
      slug: "poprace",
      logo: "/images/brands/poprace.png",
      height: "h-[56px]",
    },
    {
      name: "Greenlight",
      slug: "greenlight",
      logo: "/images/brands/greenlight.png",
      height: "h-[52px]",
    },
    {
      name: "Johnny Lightning",
      slug: "johnnylightning",
      logo: "/images/brands/johnnylightning.png",
      height: "h-[60px]",
    },
  ];
  const collectionLandingSlugs = new Set(["hotwheels", "minigt", "inno64"]);

  return (
    <section className="border-t border-white/5 bg-black">
      <div className="mx-auto grid max-w-[1720px] grid-cols-4 items-center gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-8 sm:px-8 lg:h-[92px] lg:px-16 lg:py-0">
        {brands.map((brand) => {
          const href = collectionLandingSlugs.has(brand.slug)
            ? "/collections/" + brand.slug
            : "/listings?brand=" + encodeURIComponent(brand.name);

          return (
            <Link
              key={brand.slug}
              href={href}
              aria-label={"Explorar miniaturas " + brand.name}
              className="flex min-w-0 items-center justify-center"
            >
              <img
                src={optimizedImage(brand.logo, { width: 180, quality: 74 })}
                alt={"Explorar miniaturas " + brand.name}
                width={180}
                height={120}
                loading="lazy"
                decoding="async"
                className={
                  brand.height +
                  " max-h-10 w-full object-contain opacity-85 transition-all duration-300 hover:scale-105 hover:opacity-100 sm:max-h-12 lg:max-h-none"
                }
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
