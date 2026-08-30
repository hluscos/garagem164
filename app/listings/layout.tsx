import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Comprar miniaturas 1:64 em Portugal",
  "Explora miniaturas 1:64 à venda por colecionadores em Portugal. Encontra a próxima peça para a tua coleção na Garagem164.",
  "/listings",
);

export default function ListingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
