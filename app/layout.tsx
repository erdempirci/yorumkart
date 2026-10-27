import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "YorumKart — Google yorumlarınızı büyütün",
  description: "QR, NFC ve WhatsApp ile müşterilerinizden Google yorumu isteyin, geri bildirimleri tek panelde görün.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
