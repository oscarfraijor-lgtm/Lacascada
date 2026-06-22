import Nav from "@/components/Nav";
import { BRAND } from "@/lib/schema";
import { brandThemeVars } from "@/lib/theme";

// Club público: tema de la marca de ESTE deploy (NEXT_PUBLIC_BRAND) + nav del club.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={brandThemeVars(BRAND)} className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
