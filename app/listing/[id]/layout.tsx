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
  return getListingMetadata(id, "/listing/" + id);
}

export default function ListingDetailLayout({
  children,
}: DetailLayoutProps) {
  return children;
}
