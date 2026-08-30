import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function MessagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
