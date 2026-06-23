"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

// Celebración cuando la creadora SUBE de nivel. Usa localStorage para recordar el
// último nivel visto y solo festeja un AUMENTO real (no en la primera carga ni al
// recargar). Sin confeti ni look "hecho por IA": una franja sobria, descartable.
export default function LevelUpToast({
  creatorId,
  levelIndex,
  levelName,
  badge,
}: {
  creatorId: string; // namespacea el "último nivel visto" por creadora (navegador compartido)
  levelIndex: number;
  levelName: string;
  badge: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const KEY = `cc_seen_level:${creatorId}`;
    const seen = Number(localStorage.getItem(KEY) ?? "-1");
    if (levelIndex > seen) {
      // Solo festeja si ya había un nivel registrado antes (subió de verdad).
      if (seen >= 0) setShow(true);
      localStorage.setItem(KEY, String(levelIndex));
    }
  }, [levelIndex, creatorId]);

  if (!show) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-lime/60 bg-lime/25 px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Sparkles size={16} className="text-brand-deep" />
        ¡Subiste de nivel! Ahora eres <b>{badge} {levelName}</b>.
      </p>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Cerrar"
        className="shrink-0 rounded-full p-1 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
      >
        <X size={15} />
      </button>
    </div>
  );
}
