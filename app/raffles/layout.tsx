import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Sorteios de miniaturas 1:64",
  "Descobre sorteios de miniaturas colecionáveis e participa na Garagem164, o marketplace português para a comunidade 1:64.",
  "/raffles",
);

export default function RafflesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
