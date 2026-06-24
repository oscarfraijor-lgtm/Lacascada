"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Botón "Copiar" que copia un texto al portapapeles y muestra "¡Copiado!" 2s.
// Lo usa /productos para el copy/caption sugerido y los ganchos de venta, así la
// creadora se lleva el texto con un clic (la "marketing tool" más usada).
export default function CopyButton({
  text,
  label = "Copiar",
  copiedLabel = "¡Copiado!",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para contextos sin clipboard API (http no seguro / navegadores viejos).
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* sin portapapeles: no rompe */
      }
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
      }
    >
      {done ? (
        <>
          <Check size={14} /> {copiedLabel}
        </>
      ) : (
        <>
          <Copy size={14} /> {label}
        </>
      )}
    </button>
  );
}
