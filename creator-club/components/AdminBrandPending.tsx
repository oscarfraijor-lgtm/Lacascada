import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";

// Se muestra cuando la marca seleccionada en el admin aún no tiene su base de
// Airtable conectada en este deploy (no se puede gestionar su data todavía).
export default function AdminBrandPending({ brand, slug }: { brand: string; slug: string }) {
  const key = slug.toUpperCase().replace(/-/g, "_");
  const baseKey = `AIRTABLE_BASE_${key}`;
  const tokenKey = `AIRTABLE_TOKEN_${key}`;
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-8 text-center">
      <Building2 className="mx-auto text-brand-deep" size={32} />
      <h2 className="font-display mt-3 text-xl font-extrabold text-ink">{brand}: marca pendiente</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
        Esta marca aún no tiene su base de Airtable conectada en este panel. Para gestionarla,
        agrega{" "}
        <code className="rounded bg-cream-deep px-1.5 py-0.5 text-xs font-semibold text-ink">{baseKey}</code>{" "}
        (su base id) al entorno del deploy de admin y vuelve a entrar.
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs text-ink-soft">
        Si su base vive en otra cuenta de Airtable, agrega también{" "}
        <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[11px] font-semibold text-ink">{tokenKey}</code>{" "}
        con un PAT que tenga acceso a esa base. Si comparte cuenta con la marca principal, basta la base.
      </p>
      <Link
        href="/admin/marcas"
        className="font-display mt-5 inline-flex items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink"
      >
        <ArrowLeft size={15} /> Elegir otra marca
      </Link>
    </div>
  );
}
