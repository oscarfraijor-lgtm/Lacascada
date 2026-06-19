import { ShieldCheck, BadgeCheck, Lock } from "lucide-react";
import { BRAND } from "@/lib/schema";

// Banda de confianza: ataca la fricción #1 del research (fraude: "si te piden
// pagar envío, es estafa") y la ansiedad por RFC/CURP. Son promesas verificables
// del modelo gifting, no marketing.
const PROMESAS = [
  { icon: ShieldCheck, text: "Nunca te pedimos pagar envío ni datos de tu tarjeta." },
  { icon: BadgeCheck, text: `Marca real: ${BRAND.name}, operada por Indie Pro Marketing.` },
  { icon: Lock, text: "No necesitas RFC para participar; solo si hay pago en efectivo." },
];

export default function TrustBar() {
  return (
    <div className="grid gap-2.5 rounded-2xl border border-brand/20 bg-white p-4 sm:grid-cols-3">
      {PROMESAS.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-start gap-2 text-xs text-ink-soft">
          <Icon size={16} className="mt-0.5 shrink-0 text-brand-deep" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
