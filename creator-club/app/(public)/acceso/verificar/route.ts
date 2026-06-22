import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/token";
import { setCreatorCookie } from "@/lib/session";
import { getCreatorByEmail } from "@/lib/store";
import { isAdmin } from "@/lib/roles";

// Abre el magic link: valida el token, setea la cookie de sesión y redirige.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const result = verifyAccessToken(token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/acceso?error=${result.reason}`, req.url));
  }

  await setCreatorCookie(result.email);

  // Operadores entran por la consola (nivel superior), no a un club concreto.
  if (isAdmin(result.email)) {
    return NextResponse.redirect(new URL("/console", req.url));
  }
  const creator = await getCreatorByEmail(result.email);
  if (creator) {
    return NextResponse.redirect(new URL("/?acceso=1", req.url));
  }
  // Token válido pero sin cuenta (caso raro): mandar a registro.
  return NextResponse.redirect(new URL("/registro", req.url));
}
