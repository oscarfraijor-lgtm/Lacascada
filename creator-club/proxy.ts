import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BRAND } from "@/lib/schema";

// ── Routing por HOST del dominio multimarca getcreatorclub.com ────────────
// Un solo deploy (marca del env = color-dreams) sirve varios hosts. El middleware
// decide por host:
//   - DOMINIO NEUTRAL del equipo = apex getcreatorclub.com + www + cualquier
//     subdominio NO reservado y que NO sea el club de este deploy. Aquí solo viven
//     las rutas del equipo (operador/console/admin/acceso); lo demás rebota a
//     /operador, para que el dominio neutral NUNCA muestre el club de una marca.
//   - subdominio de marca RESERVADA (anyeluz/origen/ole) -> "Muy pronto" (reservado).
//   - subdominio del CLUB de este deploy (derivado de BRAND.deployUrl, ej.
//     colordreams.getcreatorclub.com) -> app normal, intacto.
//   - hosts FUERA de getcreatorclub.com (vercel.app, previews, localhost) -> intacto.
const APEX = "getcreatorclub.com";

// subdominio reservado -> slug de marca (lib/brands.ts). Coming-soon hasta lanzar.
const RESERVED: Record<string, string> = {
  anyeluz: "anyeluz",
  origen: "origen-botanico",
  ole: "ole",
};

// Host del club de ESTE deploy (subdominio propio de la marca del env), derivado de
// su deployUrl. Es el ÚNICO subdominio de getcreatorclub.com que sirve el club; el
// resto (apex, www, desconocidos) es dominio neutral del equipo. Per-deploy: cada
// marca tiene su deployUrl, así el mismo código sirve a todas sin acoplarse.
const CLUB_HOST = (() => {
  try {
    return BRAND.deployUrl ? new URL(BRAND.deployUrl).host.toLowerCase() : null;
  } catch {
    return null;
  }
})();

// Rutas NEUTRALES permitidas en el dominio del equipo. El resto rebota a /operador.
function teamAllowed(path: string): boolean {
  return (
    path === "/operador" || path.startsWith("/operador/") ||
    path === "/console" || path.startsWith("/console/") ||
    path === "/admin" || path.startsWith("/admin/") ||
    path.startsWith("/acceso") || // magic-link verify del equipo
    path === "/salir" ||
    path.startsWith("/proximamente")
  );
}

function toOperador(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/operador";
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const path = req.nextUrl.pathname;

  // Fuera de getcreatorclub.com (vercel.app, previews, localhost): app normal.
  if (host !== APEX && !host.endsWith("." + APEX)) {
    return NextResponse.next();
  }

  // El subdominio propio del club de este deploy: app normal, intacto.
  if (CLUB_HOST && host === CLUB_HOST) {
    return NextResponse.next();
  }

  // Subdominio de marca reservada: coming-soon.
  if (host.endsWith("." + APEX)) {
    const sub = host.slice(0, host.length - (APEX.length + 1));
    const slug = RESERVED[sub];
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = `/proximamente/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // Aquí caen: apex desnudo, www, y cualquier subdominio NO reservado que no sea el
  // club. Todos = dominio NEUTRAL del equipo: solo sus rutas; lo demás -> /operador.
  if (teamAllowed(path)) return NextResponse.next();
  return toOperador(req);
}

// Corre en rutas de página (excluye assets, _next, api). El host-routing solo
// aplica a navegación, no a recursos estáticos.
export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
