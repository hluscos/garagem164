import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Leilões de miniaturas 1:64",
  "Participa em leilões de miniaturas colecionáveis 1:64 na Garagem164, a comunidade portuguesa para quem compra e vende modelos de coleção.",
  "/auctions",
);

export default function AuctionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
