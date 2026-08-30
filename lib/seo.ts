import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const siteUrl = "https://garagem164.pt";
export const siteName = "Garagem164";
export const siteDescription =
  "Compra e vende miniaturas 1:64 em Portugal. Descobre anúncios, leilões e sorteios para colecionadores na Garagem164.";

type ListingImage = {
  image_url: string;
  sort_order: number | null;
};

export type SeoListing = {
  id: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  listing_type: "sale" | "auction" | "raffle";
  sale_status: string | null;
  created_at: string;
  listing_images?: ListingImage[];
};

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normaliseText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function listingName(listing: SeoListing) {
  return [listing.brand, listing.model].filter(Boolean).join(" ").trim();
}

export function listingPath(listing: Pick<SeoListing, "id" | "listing_type">) {
  if (listing.listing_type === "auction") {
    return "/auctions/" + listing.id;
  }

  if (listing.listing_type === "raffle") {
    return "/raffles/" + listing.id;
  }

  return "/listing/" + listing.id;
}

export function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName,
      locale: "pt_PT",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export async function getIndexableListings(): Promise<SeoListing[]> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select(
      [
        "id",
        "brand",
        "model",
        "description",
        "listing_type",
        "sale_status",
        "created_at",
        "listing_images (image_url, sort_order)",
      ].join(", "),
    )
    .eq("listing_type", "sale")
    .eq("sale_status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SEO SITEMAP LISTINGS ERROR:", error.message);
    return [];
  }

  return (data ?? []) as unknown as SeoListing[];
}

export async function getListingForSeo(id: string) {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select(
      [
        "id",
        "brand",
        "model",
        "description",
        "listing_type",
        "sale_status",
        "created_at",
        "listing_images (image_url, sort_order)",
      ].join(", "),
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("SEO LISTING METADATA ERROR:", error.message);
    return null;
  }

  return data as unknown as SeoListing | null;
}

export async function getListingMetadata(
  id: string,
  pathname: string,
): Promise<Metadata> {
  const listing = await getListingForSeo(id);

  if (!listing || listing.sale_status === "sold") {
    return {
      title: "Anúncio indisponível",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = listingName(listing) || "Miniatura 1:64";
  const typeLabel =
    listing.listing_type === "auction"
      ? "Leilão"
      : listing.listing_type === "raffle"
        ? "Sorteio"
        : "Miniatura à venda";
  const description =
    normaliseText(listing.description ?? "").slice(0, 150) ||
    typeLabel +
      ": " +
      name +
      ". Descobre esta miniatura 1:64 na Garagem164, o marketplace português para colecionadores.";
  const image = [...(listing.listing_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )[0];
  const title = name + " — " + typeLabel;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName,
      locale: "pt_PT",
      type: "website",
      images: image
        ? [
            {
              url: image.image_url,
              alt: name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
