import "./globals.css";
import Header from "./components/Header";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";

export const metadata = {
  title: "GARAGEM164",
  description: "Marketplace de miniaturas 1:64",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <Header />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
