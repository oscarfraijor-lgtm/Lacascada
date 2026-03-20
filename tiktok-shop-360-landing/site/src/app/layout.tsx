import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INDIE PRO MARKETING | Your 360° TikTok Shop Partner",
  description:
    "We build, launch & manage your entire TikTok Shop. End-to-end TikTok Shop management for brands in Mexico and the US. Book your free strategy call today.",
  keywords:
    "TikTok Shop, TikTok Shop agency, social commerce, affiliate marketing, TikTok ads, live shopping",
  openGraph: {
    title: "INDIE PRO MARKETING | Your 360° TikTok Shop Partner",
    description:
      "We build, launch & manage your entire TikTok Shop. End-to-end management for brands in Mexico and the US.",
    type: "website",
    url: "https://www.indieproagency.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
