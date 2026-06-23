// ¿Es un link http(s) válido? (rechaza javascript:, relativos, basura). Se usa
// para validar los links que pega la creadora (entregas de campaña y misiones).
export function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
