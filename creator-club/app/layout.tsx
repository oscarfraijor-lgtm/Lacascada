import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { BRAND } from "@/lib/schema";

const rhd = Red_Hat_Display({
  variable: "--font-rhd",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});
const rht = Red_Hat_Text({
  variable: "--font-rht",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${BRAND.club} · ${BRAND.name}`,
  description: `Comunidad de creadoras de ${BRAND.name}. Misiones, estrellas y recompensas.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${rhd.variable} ${rht.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-ink">
        <Nav />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
