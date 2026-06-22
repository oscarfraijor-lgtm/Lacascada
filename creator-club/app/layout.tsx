import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";
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

// Root NEUTRO: no inyecta tema ni navegación. Cada área (club público / consola
// de operador / admin por marca) aplica su propio tema y chrome en su layout.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${rhd.variable} ${rht.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
