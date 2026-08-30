import Link from "next/link";

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
      <div className="hide-scrollbar mx-auto flex h-[92px] max-w-[1720px] items-center justify-between gap-8 overflow-x-auto px-6 sm:px-10 lg:px-16">
        {brands.map((brand) => {
          const href = collectionLandingSlugs.has(brand.slug)
            ? "/collections/" + brand.slug
            : "/listings?brand=" + encodeURIComponent(brand.name);

          return (
            <Link
              key={brand.slug}
              href={href}
              aria-label={"Explorar miniaturas " + brand.name}
              className="shrink-0"
            >
              <img
                src={brand.logo}
                alt={"Explorar miniaturas " + brand.name}
                className={
                  brand.height +
                  " w-auto object-contain opacity-85 transition-all duration-300 hover:scale-110 hover:opacity-100"
                }
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
