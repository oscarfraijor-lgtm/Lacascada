import Link from "next/link";
import {
  Package, PackageOpen, Check, X, Sparkles, ExternalLink, Download, ImageIcon, Megaphone, Link2, Tag,
} from "lucide-react";
import { listActiveProducts, listOpenCampaigns } from "@/lib/store";
import { type Product, splitLines, parseDeepLinks, productImages } from "@/lib/products";
import type { Campaign } from "@/lib/campaigns";
import { getClubViewer } from "@/lib/club-viewer";
import { BRAND } from "@/lib/schema";
import CopyButton from "@/components/CopyButton";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";

export default async function ProductosPage() {
  const { isAdminPreview } = await getClubViewer();
  // Solo campañas ABIERTAS para el chip "Parte de la campaña X": una cerrada no
  // aparece en /campanas, así que enlazar a ella sería un callejón sin salida.
  const [products, campaigns] = await Promise.all([listActiveProducts(), listOpenCampaigns()]);
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}

      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Productos</h1>
        <p className="text-sm text-ink-soft">
          Todo para crear tu mejor contenido de {BRAND.name}: la ficha de cada producto, ganchos de venta y
          assets listos para descargar (fotos, copy y links).
        </p>
      </header>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Aún no hay productos publicados. ¡Vuelve pronto!
        </p>
      ) : (
        <div className="space-y-6">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} campaign={p.campaignId ? campaignById.get(p.campaignId) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, campaign }: { p: Product; campaign?: Campaign }) {
  const images = productImages(p);
  const hero = images[0]; // imagen principal (descargable en el encabezado)
  const galleryRest = images.slice(1); // las demás imágenes (sin repetir la principal)
  const hooks = splitLines(p.hooks);
  const dos = splitLines(p.dos);
  const donts = splitLines(p.donts);
  const deeplinks = parseDeepLinks(p.deeplinks);

  return (
    <article className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
      {/* Encabezado: imagen principal + nombre/precio/link */}
      <div className="grid gap-4 border-b border-ink/5 p-5 sm:grid-cols-[200px_1fr] sm:p-6">
        {hero ? (
          <DownloadImage url={hero} alt={p.name} big />
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink/20 bg-cream/40 px-3 py-6 text-center">
            <ImageIcon size={22} className="text-ink-soft/60" />
            <p className="text-[11px] font-semibold text-ink-soft">Foto pendiente</p>
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
              <Package size={11} /> Producto
            </span>
            {campaign && (
              <Link
                href="/campanas"
                className="flex items-center gap-1 rounded-full bg-lime/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink transition hover:bg-lime/60"
                title={`Parte de la campaña ${campaign.title}`}
              >
                <Megaphone size={11} /> {campaign.title}
              </Link>
            )}
          </div>
          <h2 className="font-display mt-2 text-2xl font-extrabold text-ink">{p.name}</h2>
          {p.price && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-brand-deep">
              <Tag size={14} /> {p.price}
            </p>
          )}
          {p.benefits && <p className="mt-2 text-sm text-ink-soft">{p.benefits}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="font-display inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
              >
                Abrir producto / mi link <ExternalLink size={15} />
              </a>
            )}
            <Link
              href={`/muestras?producto=${encodeURIComponent(p.id)}`}
              className="font-display inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-extrabold text-ink transition hover:border-brand hover:text-brand"
            >
              <PackageOpen size={15} /> Pedir muestra
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Ficha: specs */}
        {p.specs && (
          <Section icon={Package} title="Ficha">
            <p className="text-sm text-ink-soft">{p.specs}</p>
          </Section>
        )}

        {/* Hooks / ganchos de venta */}
        {hooks.length > 0 && (
          <Section
            icon={Sparkles}
            title="Ganchos de venta"
            action={<CopyButton text={hooks.join("\n")} label="Copiar ganchos" className={SMALL_COPY} />}
          >
            <ul className="space-y-1.5">
              {hooks.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-deep" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Do's & Don'ts */}
        {(dos.length > 0 || donts.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {dos.length > 0 && (
              <div className="rounded-2xl border border-lime/50 bg-lime/10 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink">
                  <Check size={14} className="text-brand-deep" /> Sí haz esto
                </p>
                <ul className="space-y-1.5">
                  {dos.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink">
                      <Check size={14} className="mt-0.5 shrink-0 text-brand-deep" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {donts.length > 0 && (
              <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink">
                  <X size={14} className="text-brand-deep" /> Evita esto
                </p>
                <ul className="space-y-1.5">
                  {donts.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink">
                      <X size={14} className="mt-0.5 shrink-0 text-brand-deep" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Marketing tools: galería + copy + deep-links */}
        {(galleryRest.length > 0 || p.copy || deeplinks.length > 0) && (
          <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4 sm:p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              <ImageIcon size={14} /> Assets para tu contenido
            </p>

            {galleryRest.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-ink">Más imágenes (descárgalas)</p>
                <div className="flex flex-wrap gap-3">
                  {galleryRest.map((url, i) => (
                    <DownloadImage key={i} url={url} alt={`${p.name} ${i + 2}`} />
                  ))}
                </div>
              </div>
            )}

            {p.copy && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">Copy sugerido</p>
                  <CopyButton text={p.copy} label="Copiar copy" className={SMALL_COPY} />
                </div>
                <p className="whitespace-pre-wrap rounded-xl border border-ink/10 bg-white p-3 text-sm text-ink">
                  {p.copy}
                </p>
              </div>
            )}

            {deeplinks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-ink">Enlaces útiles</p>
                <div className="flex flex-wrap gap-2">
                  {deeplinks.map((d, i) => (
                    <a
                      key={i}
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand"
                    >
                      <Link2 size={13} /> {d.label} <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

const SMALL_COPY =
  "inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-brand-deep";

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Package;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <Icon size={14} /> {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

// Imagen descargable. El atributo `download` fuerza la descarga en mismo origen;
// con URLs externas (Airtable/CDN) el navegador la abre en una pestaña para guardar.
function DownloadImage({ url, alt, big = false }: { url: string; alt: string; big?: boolean }) {
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noreferrer"
      className={`group relative block overflow-hidden rounded-2xl border border-ink/10 ${big ? "w-full" : "h-24 w-24"}`}
      title="Descargar imagen"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className={`${big ? "aspect-square w-full" : "h-full w-full"} bg-cream object-cover`} />
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/70 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
        <Download size={11} /> Descargar
      </span>
    </a>
  );
}
