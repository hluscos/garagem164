import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Contactos",
  "Entra em contacto com a Garagem164 para obter ajuda sobre anúncios, leilões, sorteios e miniaturas colecionáveis.",
  "/contact",
);

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
