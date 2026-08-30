import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function RegisterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
