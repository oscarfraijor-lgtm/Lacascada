// Allowlist de admins para /admin. Mismo patrón que lives-app/lib/roles.ts:
// los correos viven en ADMIN_EMAILS (.env.local), separados por coma.
const ENV_ADMINS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Defaults verificados de Oscar (mismos que lives-app). Paulina se agrega vía ADMIN_EMAILS.
const DEFAULT_ADMINS = ["oscarfraijo@indiepro.com.mx", "oscar.fraijor@gmail.com"];

export const ADMIN_EMAILS = Array.from(new Set([...DEFAULT_ADMINS, ...ENV_ADMINS]));

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
