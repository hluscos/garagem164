import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Vender miniaturas 1:64 em Portugal",
  "Publica a tua miniatura 1:64 na Garagem164 e chega a colecionadores em Portugal através de anúncios, leilões e sorteios.",
  "/submit-listing",
);

export default function SubmitListingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
