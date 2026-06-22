"use client";

import Link from "next/link";

// Boundary del admin: una acción que truena (ej. Airtable) no debe tumbar el panel
// con una pantalla cruda. Mensaje amable + reintentar + volver a la consola.
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f6f7] px-4 text-[#1b1b20]">
      <div className="max-w-sm text-center">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-2xl font-extrabold">No se pudo completar</h1>
        <p className="mt-1 text-sm text-[#56565f]">
          Hubo un problema. Intenta de nuevo; si sigue, revisa la conexión de datos del club.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-[#1b1b20] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            Reintentar
          </button>
          <Link
            href="/console"
            className="rounded-full border border-[#1b1b20]/15 px-5 py-2.5 text-sm font-bold text-[#1b1b20]"
          >
            Volver a la consola
          </Link>
        </div>
      </div>
    </div>
  );
}
