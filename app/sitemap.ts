import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garagem164.pt";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
