import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Sobre a Garagem164",
  "Conhece a Garagem164, o marketplace português dedicado a quem compra, vende e coleciona miniaturas 1:64.",
  "/about",
);

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
