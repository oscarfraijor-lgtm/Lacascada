import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Inbox, Gift, Users, ShieldCheck } from "lucide-react";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { airtableConfigured } from "@/lib/airtable";
import { BRAND } from "@/lib/schema";

const TABS = [
  { href: "/admin", label: "Campañas", icon: Megaphone },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: Inbox },
  { href: "/admin/canjes", label: "Canjes", icon: Gift },
  { href: "/admin/creadoras", label: "Creadoras", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await currentEmail();
  if (!email) redirect("/acceso");
  if (!isAdmin(email)) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <ShieldCheck className="mx-auto text-brand-deep" size={36} />
        <h1 className="font-display mt-3 text-2xl font-extrabold text-ink">Acceso restringido</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tu correo ({email}) no tiene permisos de admin.
        </p>
        <Link href="/" className="font-display mt-5 inline-block rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
          Volver al club
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
            Panel de admin
          </p>
          <h1 className="font-display text-2xl font-extrabold text-ink">{BRAND.club}</h1>
        </div>
        <span className="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-ink-soft">
          Datos: {airtableConfigured() ? "Airtable" : "archivo local"} · {email}
        </span>
      </header>

      <nav className="flex flex-wrap gap-1 rounded-2xl border border-ink/10 bg-white p-1">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand/10 hover:text-brand"
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
