"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

// Botón de submit con estado pendiente: se deshabilita y muestra spinner mientras
// la server action corre (evita doble-click y da feedback en round-trips lentos).
export default function SubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className ?? ""} ${pending ? "opacity-70" : ""}`}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-1.5">
          <Loader2 size={15} className="animate-spin" /> {pendingLabel ?? "Enviando…"}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
