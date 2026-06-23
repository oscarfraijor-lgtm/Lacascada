// Antigüedad legible ("hace 3 días") para mostrar cuánto lleva un pendiente sin
// atender. Se calcula al render (las páginas de admin son dinámicas / no-store).
export function relativeAge(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  if (days < 7) return `hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return weeks === 1 ? "hace 1 semana" : `hace ${weeks} semanas`;
  const months = Math.floor(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}
