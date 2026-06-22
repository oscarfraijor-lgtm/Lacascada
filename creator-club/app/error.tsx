"use client";

// Red de seguridad: si una página/acción truena (ej. Airtable caído), mostramos
// un mensaje amable con "reintentar" en vez de la pantalla de error cruda.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f6f7] px-4 text-[#1b1b20]">
      <div className="max-w-sm text-center">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-2xl font-extrabold">Algo salió mal</h1>
        <p className="mt-1 text-sm text-[#56565f]">
          Tuvimos un problema cargando esto. Vuelve a intentar en un momento.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-[#1b1b20] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
