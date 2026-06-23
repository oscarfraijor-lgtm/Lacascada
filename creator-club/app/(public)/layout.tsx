import Nav from "@/components/Nav";
import { BRAND } from "@/lib/schema";
import { publicBrandConfigured } from "@/lib/brands";
import { brandThemeVars } from "@/lib/theme";

// Club público: tema de la marca de ESTE deploy (NEXT_PUBLIC_BRAND) + nav del club.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Gate: una marca plantilla sin mecánica propia NO debe mostrar el catálogo
  // heredado de Color Dreams a sus creadoras. Se bloquea hasta configurarla.
  if (!publicBrandConfigured()) {
    return (
      <div style={brandThemeVars(BRAND)} className="grid min-h-screen place-items-center bg-cream px-4 text-ink">
        <div className="max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-ink">Muy pronto</h1>
          <p className="mt-2 text-sm text-ink-soft">
            El club de {BRAND.name} está en preparación. Vuelve pronto.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={brandThemeVars(BRAND)} className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
