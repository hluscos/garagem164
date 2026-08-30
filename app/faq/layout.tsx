import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Perguntas frequentes",
  "Consulta respostas sobre compras, vendas, leilões, sorteios e miniaturas colecionáveis na Garagem164.",
  "/faq",
);

export default function FaqLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
