import Link from "next/link";
import { getMissions } from "@/lib/data";
import { getClubViewer } from "@/lib/club-viewer";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import MissionCard from "@/components/MissionCard";
import type { MissionCategory } from "@/lib/schema";

const CAT_LABEL: Record<MissionCategory, string> = {
  perfil: "Tu perfil",
  contenido: "Contenido",
  venta: "Ventas (valen más)",
  live: "Lives",
  comunidad: "Comunidad",
};
const ORDER: MissionCategory[] = ["perfil", "contenido", "venta", "live", "comunidad"];

export default async function MisionesPage() {
  const { creator: me, isAdminPreview } = await getClubViewer();
  if (!me) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Misiones</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Entra a tu cuenta para ver tus misiones y estrellas.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
            Únete
          </Link>
          <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-5 py-2.5 font-extrabold text-ink">
            Acceder
          </Link>
        </div>
      </div>
    );
  }
  const missions = await getMissions();

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Misiones</h1>
        <p className="text-sm text-ink-soft">
          Completa misiones para subir de nivel. El equipo acredita tus estrellas al validar
          tu avance; las de venta valen más y se activan con tu primera venta atribuible.
        </p>
      </header>

      {ORDER.map((cat) => {
        const items = missions.filter((m) => m.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wider text-brand-deep">
              {CAT_LABEL[cat]}
            </h2>
            <div className="space-y-2">
              {items.map((m) => (
                <MissionCard key={m.id} mission={m} readOnly={isAdminPreview} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
