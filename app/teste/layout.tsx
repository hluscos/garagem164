import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function TestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
