import type { MetadataRoute } from "next";
import { collectionBrands } from "@/app/collections/brands";
import { getIndexableListings, listingPath, siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getIndexableListings();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/listings", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/auctions", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: new URL("/raffles", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: new URL("/collections", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/submit-listing", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/about", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: new URL("/faq", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: new URL("/shipping", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: new URL("/contact", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...collectionBrands.map((brand) => ({
      url: new URL("/collections/" + brand.slug, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: new URL(listingPath(listing), siteUrl).toString(),
    lastModified: listing.created_at,
    changeFrequency: "daily",
    priority: 0.8,
    images: [...(listing.listing_images ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((image) => image.image_url),
  }));

  return [...staticPages, ...listingPages];
}
