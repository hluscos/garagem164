import type { Metadata } from "next";
import { getListingMetadata } from "@/lib/seo";

type DetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DetailLayoutProps): Promise<Metadata> {
  const { id } = await params;
  return getListingMetadata(id, "/auctions/" + id);
}

export default function AuctionDetailLayout({
  children,
}: DetailLayoutProps) {
  return children;
}
