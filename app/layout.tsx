import "./globals.css";
import Header from "./components/Header";
import CookieConsent from "./components/CookieConsent";

export const metadata = {
  title: "GARAGEM164",
  description: "Marketplace de miniaturas 1:64",
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
      </body>
    </html>
  );
}
