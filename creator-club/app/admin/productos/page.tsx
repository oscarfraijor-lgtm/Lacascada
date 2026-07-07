import { Plus, Power, Trash2, Save, Package, ShieldCheck, ImageIcon } from "lucide-react";
import { listProducts, listCampaigns } from "@/lib/store";
import type { Product } from "@/lib/products";
import type { Campaign } from "@/lib/campaigns";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import { crearProducto, editarProducto, alternarProducto, eliminarProducto } from "../actions";

export default async function AdminProductosPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [products, campaigns] = await Promise.all([listProducts(conn), listCampaigns(conn)]);
  const activos = products.filter((p) => p.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Qué es esta sección */}
      <p className="flex items-start gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-3 text-xs text-ink-soft">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-deep" />
        Los productos son <b>solo informativos</b>: ficha (specs, beneficios, ganchos, do&apos;s &amp; don&apos;ts,
        precio, link) + assets para crear contenido (imagen principal, galería, copy sugerido, deep-links). No
        tocan recompensas, canjes ni GMV. La creadora los ve y los usa en su club.
      </p>

      {/* Crear */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Plus size={18} className="text-brand-deep" /> Nuevo producto
        </h2>
        <form action={crearProducto} className="space-y-4">
          <ProductFields campaigns={campaigns} />
          <SubmitButton
            pendingLabel="Creando…"
            className="font-display rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink transition hover:brightness-95"
          >
            Crear producto
          </SubmitButton>
        </form>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Productos ({products.length})</h2>
          <span className="text-xs text-ink-soft">{activos} activos</span>
        </div>

        {products.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
            Aún no hay productos. Crea el primero arriba.
          </p>
        )}

        {products.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl border p-5 ${p.active !== false ? "border-ink/10 bg-white" : "border-ink/10 bg-ink/[0.03]"}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${p.active !== false ? "bg-lime text-ink" : "bg-ink/10 text-ink-soft"}`}>
                  {p.active !== false ? "Activo" : "Inactivo"}
                </span>
                <code className="text-xs text-ink-soft">{p.id}</code>
                <span className="flex items-center gap-1 rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  {p.source === "cruva" ? "CRUVA" : "Manual"}
                </span>
              </div>
            </div>

            <form action={editarProducto} className="space-y-4">
              <input type="hidden" name="id" value={p.id} />
              <ProductFields p={p} campaigns={campaigns} />
              <SubmitButton
                pendingLabel="Guardando…"
                className="font-display flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
              >
                <Save size={15} /> Guardar
              </SubmitButton>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
              <form action={alternarProducto}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={(p.active === false).toString()} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/10"
                >
                  <Power size={14} /> {p.active !== false ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={eliminarProducto}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton
                  message={`¿Eliminar el producto "${p.name}"? No se puede deshacer.`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-deep transition hover:bg-brand/10"
                >
                  <Trash2 size={14} /> Eliminar
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProductFields({ p, campaigns }: { p?: Product; campaigns: Campaign[] }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="name" label="Nombre" defaultValue={p?.name} placeholder="Ej. Classic Foam" required />
        <Field name="price" label="Precio (texto, opcional)" defaultValue={p?.price} placeholder="Ej. Desde $3,499 MXN" />
      </div>

      {/* Ficha / brief */}
      <Area name="specs" label="Specs (ficha técnica)" defaultValue={p?.specs} rows={2} placeholder="Material, tamaños, presentación…" />
      <Area name="benefits" label="Beneficios" defaultValue={p?.benefits} rows={2} placeholder="Por qué le conviene al cliente…" />
      <Area name="hooks" label="Hooks / ganchos de venta (uno por línea)" defaultValue={p?.hooks} rows={3} placeholder={"Llega en una caja y se arma en minutos\nLo probé 30 noches y esto pasó"} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Area name="dos" label="Do's (qué SÍ, uno por línea)" defaultValue={p?.dos} rows={3} placeholder={"Graba el unboxing completo\nPega tu link de afiliado"} />
        <Area name="donts" label="Don'ts (qué NO, uno por línea)" defaultValue={p?.donts} rows={3} placeholder={"No prometas resultados médicos\nNo inventes precios"} />
      </div>
      <Field name="link" label="Link del producto / afiliado de TikTok Shop" defaultValue={p?.link} placeholder="https://..." />

      {/* Assets descargables (marketing tools) */}
      <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <ImageIcon size={14} /> Assets para crear contenido
        </p>
        <div className="space-y-3">
          <Field name="image" label="Imagen principal (URL)" defaultValue={p?.image} placeholder="https://...jpg" />
          <Area name="gallery" label="Galería (una URL por línea)" defaultValue={p?.gallery} rows={2} placeholder={"https://...1.jpg\nhttps://...2.jpg"} />
          <Area name="copy" label="Copy / caption sugerido (la creadora lo copia con un botón)" defaultValue={p?.copy} rows={3} placeholder="Texto listo para que la creadora pegue en su video…" />
          <Area name="deeplinks" label="Deep-links útiles (una por línea: Etiqueta | https://...)" defaultValue={p?.deeplinks} rows={2} placeholder={"Catálogo | https://...\nPromo del mes | https://..."} />
        </div>
      </div>

      {/* Enlace a campaña + fuente */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Campaña relacionada (opcional)</span>
          <select
            name="campaignId"
            defaultValue={p?.campaignId ?? ""}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            <option value="">(ninguna)</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Fuente</span>
          <select
            name="source"
            defaultValue={p?.source ?? "manual"}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            <option value="manual">Manual (captura del equipo)</option>
            <option value="cruva">CRUVA (sincronizado)</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={p ? p.active !== false : true} className="h-4 w-4 accent-brand" />
        Activo (visible para las creadoras)
      </label>
    </>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
      />
    </label>
  );
}

function Area({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 2,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
