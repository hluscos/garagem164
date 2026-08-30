import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Coleções de miniaturas 1:64",
  "Explora coleções de miniaturas 1:64, incluindo Hot Wheels, Mini GT e Inno64, na Garagem164.",
  "/collections",
);

export default function CollectionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
