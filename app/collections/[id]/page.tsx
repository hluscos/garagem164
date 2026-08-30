import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { collectionBrands, getCollectionBrand } from "../brands";

type CollectionPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return collectionBrands.map((brand) => ({ id: brand.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const brand = getCollectionBrand(id);

  if (!brand) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return createPageMetadata(
    brand.metaTitle,
    brand.metaDescription,
    "/collections/" + brand.slug,
  );
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const { id } = await params;
  const brand = getCollectionBrand(id);

  if (!brand) {
    notFound();
  }

  const listingHref = "/listings?brand=" + encodeURIComponent(brand.name);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1480px] px-6 py-14 lg:px-12 lg:py-20">
          <div className="text-[12px] font-black uppercase tracking-[3px] text-[#ffb800]">
            Coleção Garagem164
          </div>
          <h1 className="mt-5 break-words text-[48px] font-black italic uppercase leading-none tracking-[-3px] sm:text-[64px] lg:text-[82px] lg:tracking-[-4px]">
            {brand.name}
          </h1>
          <p className="mt-6 max-w-[760px] text-[18px] leading-relaxed text-zinc-400">
            {brand.introduction}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-6 py-12 lg:px-12 lg:py-16">
        <article className="max-w-[900px] rounded-[28px] border border-white/5 bg-zinc-950 p-7 sm:p-10">
          <h2 className="text-2xl font-black uppercase sm:text-3xl">
            Explorar miniaturas {brand.name}
          </h2>
          <p className="mt-5 max-w-[720px] leading-relaxed text-zinc-400">
            {brand.detail}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={listingHref}
              className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-[#ffb800] px-7 text-[12px] font-black uppercase tracking-[1px] text-black transition hover:bg-[#ffc933]"
            >
              Ver anúncios de {brand.name}
            </Link>
            <Link
              href="/collections"
              className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-white/10 px-7 text-[12px] font-black uppercase tracking-[1px] text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"
            >
              Ver outras coleções
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
