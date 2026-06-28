import Link from "next/link";
import { PackageOpen, PackageCheck, Clock, Check, AlertCircle, Truck, Link2, Sparkles } from "lucide-react";
import { getClubViewer } from "@/lib/club-viewer";
import { listActiveProducts, muestrasFor, type Muestra } from "@/lib/store";
import { looksLikeAffiliate } from "@/lib/missions";
import { BRAND } from "@/lib/schema";
import SubmitButton from "@/components/SubmitButton";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { solicitarMuestra } from "./actions";

export default async function MuestrasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; producto?: string }>;
}) {
  const { ok, err, producto } = await searchParams;
  const { creator: me, isAdminPreview } = await getClubViewer();
  const [products, mine] = await Promise.all([
    listActiveProducts(),
    me && !isAdminPreview ? muestrasFor(me.email) : Promise.resolve([]),
  ]);
  // La última solicitud por producto (para mostrar su estado actual).
  const latestByProduct = new Map<string, Muestra>();
  for (const m of [...mine].sort((x, y) => (x.createdAt ?? "").localeCompare(y.createdAt ?? ""))) {
    latestByProduct.set(m.productId, m);
  }
  const productName = new Map(products.map((p) => [p.id, p.name]));
  const affiliateOk = me ? looksLikeAffiliate(me.affiliateHandle) : false;
  // ?producto= de un link viejo a un producto desactivado/inexistente: avisa en vez
  // de preseleccionar callado el primero (la creadora pediría el producto equivocado).
  const productoInvalido = !!producto && products.length > 0 && !productName.has(producto);

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}

      {ok && me && (
        <p className="rounded-lg bg-lime/40 px-3 py-2 text-center text-sm font-semibold text-ink">
          ¡Listo! El equipo recibió tu solicitud y la revisa. Te avisamos por correo cuando la aprobemos.
        </p>
      )}
      {err === "direccion" && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Déjanos tu dirección de envío para poder mandarte la muestra.
        </p>
      )}
      {err === "producto" && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Elige un producto disponible para pedir tu muestra.
        </p>
      )}
      {productoInvalido && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Ese producto ya no está disponible. Elige otro de la lista.
        </p>
      )}

      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Pide una muestra</h1>
        <p className="text-sm text-ink-soft">
          {BRAND.name} te manda producto para que crees contenido. No es un premio por ventas: es para
          que pruebes el producto y grabes tu mejor video. El equipo revisa cada solicitud.
        </p>
      </header>

      {/* Solicitar */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-1 text-lg font-extrabold text-ink">Solicita tu muestra</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Elige el producto y déjanos tu dirección. Para priorizar tu solicitud, conecta tu TikTok afiliado.
        </p>

        {me && !isAdminPreview ? (
          products.length === 0 ? (
            <p className="rounded-2xl bg-cream-deep/50 px-4 py-3 text-sm text-ink-soft">
              Aún no hay productos disponibles para muestra. ¡Vuelve pronto!
            </p>
          ) : (
            <>
              {!affiliateOk && (
                <p className="mb-4 flex flex-wrap items-center gap-1.5 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-2.5 text-xs font-semibold text-brand-deep">
                  <Link2 size={14} />
                  Conecta tu TikTok afiliado en tu cuenta para que el equipo priorice tu muestra.
                  <Link href="/cuenta#afiliado" className="underline">
                    Conectar
                  </Link>
                </p>
              )}
              <form action={solicitarMuestra} className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Producto</span>
                  <select
                    name="productId"
                    defaultValue={producto && productName.has(producto) ? producto : products[0].id}
                    className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none focus:border-brand focus:bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Dirección de envío</span>
                  <textarea
                    name="address"
                    rows={2}
                    defaultValue={me.shippingAddress ?? ""}
                    placeholder="Calle, número, colonia, ciudad, CP y teléfono de contacto"
                    className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:bg-white"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Nota (opcional)</span>
                  <input
                    name="note"
                    placeholder="¿Qué tipo de video harás? ¿Algo que debamos saber?"
                    className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:bg-white"
                  />
                </label>
                <div className="sm:col-span-2">
                  <SubmitButton
                    pendingLabel="Enviando…"
                    className="font-display inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep"
                  >
                    <PackageOpen size={16} /> Pedir muestra
                  </SubmitButton>
                </div>
              </form>
            </>
          )
        ) : isAdminPreview ? (
          <p className="rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm font-semibold text-ink-soft">
            Vista de admin. Las creadoras piden aquí; tú las apruebas y envías en la consola.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-deep/50 px-4 py-3">
            <p className="text-sm text-ink-soft">Inicia sesión para pedir una muestra de producto.</p>
            <div className="flex gap-2">
              <Link href="/registro" className="font-display rounded-full bg-lime px-4 py-2 text-sm font-extrabold text-ink">
                Únete
              </Link>
              <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-4 py-2 text-sm font-extrabold text-ink">
                Acceder
              </Link>
            </div>
          </div>
        )}

        {/* Estado de mis solicitudes */}
        {mine.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-ink/5 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Tus solicitudes</p>
            {[...latestByProduct.values()]
              .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
              .map((m) => (
                <RequestRow key={m.id ?? m.productId} m={m} name={productName.get(m.productId) ?? m.productName} />
              ))}
          </div>
        )}
      </section>

      {/* Cómo funciona */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-3 text-lg font-extrabold text-ink">Cómo funciona</h2>
        <ol className="space-y-3">
          <Step n={1} icon={PackageOpen} title="Pides tu muestra">
            Eliges el producto y dejas tu dirección. Conecta tu afiliado para que el equipo te priorice.
          </Step>
          <Step n={2} icon={Check} title="El equipo la revisa">
            Aprobamos las solicitudes de creadoras listas para crear contenido. Es una inversión, no un premio por ventas.
          </Step>
          <Step n={3} icon={Truck} title="Te la enviamos">
            Cuando la aprobamos, preparamos tu envío. Te avisamos por correo en cada paso.
          </Step>
          <Step n={4} icon={Sparkles} title="Creas tu contenido">
            Graba tu video con tu link de afiliado. Revisa la ficha y los assets del producto para hacerlo mejor.
          </Step>
        </ol>
      </section>
    </div>
  );
}

// Fila de estado de una solicitud de la creadora.
function RequestRow({ m, name }: { m: Muestra; name: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-cream/30 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <PackageOpen size={16} className="text-brand-deep" />
        <span className="text-sm font-semibold text-ink">{name}</span>
      </div>
      {m.status === "enviada" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <PackageCheck size={15} className="text-brand-deep" /> Enviada · va en camino
        </span>
      ) : m.status === "aprobada" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Check size={15} className="text-brand-deep" /> Aprobada · preparando tu envío
        </span>
      ) : m.status === "rechazada" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
          <AlertCircle size={15} /> No procedió{m.reason ? `: ${m.reason}` : ""}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <Clock size={15} /> En revisión
        </span>
      )}
    </div>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  children,
}: {
  n: number;
  icon: typeof PackageOpen;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-extrabold text-white">
        {n}
      </span>
      <div>
        <p className="flex items-center gap-1.5 font-semibold text-ink">
          <Icon size={15} className="text-brand-deep" /> {title}
        </p>
        <p className="text-sm text-ink-soft">{children}</p>
      </div>
    </li>
  );
}
