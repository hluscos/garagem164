import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Envios de miniaturas",
  "Informação sobre envios, entrega e acompanhamento de compras de miniaturas na Garagem164.",
  "/shipping",
);

export default function ShippingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
