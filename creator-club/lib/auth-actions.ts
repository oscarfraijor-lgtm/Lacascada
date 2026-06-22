"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Logout por POST (server action). NO usar un GET para cerrar sesión: Next
// prefetcha los <Link> en producción y dispararía el logout solo (te saca sin
// que hagas nada). Por eso el botón "Salir" es un <form> que llama a esto.
export async function cerrarSesion() {
  const c = await cookies();
  c.delete("cc_creator"); // sesión
  c.delete("cc_admin_brand"); // marca seleccionada en el admin
  redirect("/");
}
