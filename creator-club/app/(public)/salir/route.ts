import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const c = await cookies();
  c.delete("cc_creator"); // sesión
  c.delete("cc_admin_brand"); // marca seleccionada en el admin (no quedar cruzada entre operadores)
  return NextResponse.redirect(new URL("/", req.url));
}
