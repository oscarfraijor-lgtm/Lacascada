import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";

// Aviso en las páginas del club cuando un admin las previsualiza (no es creadora).
// Deja claro que es una vista y que sus acciones no cuentan, con salida a la consola.
export default function AdminPreviewBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-xs font-semibold text-brand-deep">
      <span className="flex items-center gap-1.5">
        <Eye size={14} /> Vista de admin: así ve el club una creadora nueva. Tus acciones aquí no cuentan.
      </span>
      <Link href="/console" className="inline-flex items-center gap-1 underline hover:text-brand">
        <ArrowLeft size={12} /> Volver a la consola
      </Link>
    </div>
  );
}
