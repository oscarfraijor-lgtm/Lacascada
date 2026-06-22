// Sesión mínima por cookie (sin password). Suficiente para v1: la creadora
// queda identificada por su email tras registrarse / acceder.
// Más adelante: magic-link con next-auth v5.
import { cookies } from "next/headers";
import { getCreatorByEmail, type CreatorRecord } from "@/lib/store";

const COOKIE = "cc_creator";

export async function setCreatorCookie(email: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function clearCreatorCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function currentEmail(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value ?? null;
}

export async function getCurrentCreator(): Promise<CreatorRecord | null> {
  const email = await currentEmail();
  if (!email) return null;
  return getCreatorByEmail(email);
}
