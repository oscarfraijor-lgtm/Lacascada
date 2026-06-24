import { Sparkles } from "lucide-react";
import { getBrandConfig } from "@/lib/brands";
import { brandThemeVars } from "@/lib/theme";

export const metadata = {
  title: "Muy pronto",
  description: "Este club de creadoras está en preparación.",
};

// Coming-soon de una marca RESERVADA (subdominio clavado, club aún sin lanzar).
// El middleware reescribe anyeluz/origen/ole.getcreatorclub.com a esta ruta. La
// marca se resuelve del slug (no del env), así un solo deploy sirve los coming-soon.
export default async function ProximamentePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandConfig(slug);
  const name = brand?.name ?? "Creator Club";
  const club = brand?.club ?? "Creator Club";

  // Tema de la marca si existe; si no, neutro.
  const theme = brand
    ? brandThemeVars(brand)
    : brandThemeVars({
        cream: "#F4F2EC",
        creamDeep: "#E8E5DC",
        violet: "#5B5B6B",
        violetDeep: "#3E3E4C",
        ink: "#2A2A33",
        inkSoft: "#5A5A66",
        lime: "#E0A33A",
      });

  return (
    <div style={theme} className="grid min-h-screen place-items-center bg-cream px-4 text-ink">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand-deep">
          <Sparkles size={26} />
        </span>
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-deep">
          {name}
        </p>
        <h1 className="font-display mt-2 text-4xl font-black text-ink sm:text-5xl">Muy pronto</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          El {club} está en preparación. La comunidad de creadoras de {name} llega pronto.
        </p>
      </div>
    </div>
  );
}
