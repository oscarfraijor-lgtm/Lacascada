import Link from "next/link";
import { Home, Megaphone, Target, Trophy, Gift, LogOut, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/schema";
import { getCurrentCreator, currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";

const LINKS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/campanas", label: "Campañas", icon: Megaphone },
  { href: "/misiones", label: "Misiones", icon: Target },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
  { href: "/recompensas", label: "Recompensas", icon: Gift },
];

export default async function Nav() {
  const [me, email] = await Promise.all([getCurrentCreator(), currentEmail()]);
  const admin = isAdmin(email);
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-black tracking-tight text-brand">
          {BRAND.club}
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-brand/10 hover:text-brand"
            >
              <Icon size={16} />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
          {admin && (
            <Link
              href="/console"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-brand-deep transition hover:bg-brand/10"
              title="Consola de operador"
            >
              <ShieldCheck size={16} />
              <span className="hidden md:inline">Consola</span>
            </Link>
          )}
          {me || admin ? (
            <Link
              href="/salir"
              className="ml-1 flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink/10"
              title="Salir"
            >
              <span className="hidden sm:inline">{me ? me.name.split(" ")[0] : "Salir"}</span>
              <LogOut size={15} />
            </Link>
          ) : (
            <>
              <Link
                href="/acceso"
                className="ml-1 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:text-brand"
              >
                Acceder
              </Link>
              <Link
                href="/registro"
                className="font-display rounded-full bg-lime px-3.5 py-1.5 text-sm font-extrabold text-ink"
              >
                Únete
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
