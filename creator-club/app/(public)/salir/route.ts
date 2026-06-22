import { NextResponse } from "next/server";

// El logout real vive en la server action cerrarSesion (POST, lib/auth-actions).
// Un GET aquí NO cierra sesión a propósito: Next prefetcha los <Link> en
// producción, y un GET destructivo te sacaría solo. Aquí solo redirige.
export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/", req.url));
}
