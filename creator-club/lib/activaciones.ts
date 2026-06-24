// ── Activaciones de Live: Flash Sales + Giveaways ────────────────────────
// La creadora SOLICITA una activación para su Live (un flash sale o un giveaway)
// dejando su usuario; el equipo la OTORGA en TikTok Shop. Estos tutoriales son
// FIJOS de la plataforma (NO cambian por marca): explican cómo activar cada cosa
// en un Live. Los pantallazos los provee Oscar; mientras no estén, cada paso
// muestra un placeholder con la descripción de la imagen pendiente.
//
// Para enchufar los pantallazos después SIN rehacer la UI: sube los PNG a
// public/tutoriales/ y pon su ruta en `image` del paso (ej. "/tutoriales/flash-sale-1.png").
// La UI ya renderiza <img> cuando `image` está, y el placeholder cuando no.

export type ActivacionTipo = "flash_sale" | "giveaway";

export const ACTIVACION_TIPOS: ActivacionTipo[] = ["flash_sale", "giveaway"];

export interface TutorialStep {
  n: number;
  title: string;
  detail: string;
  image?: string; // ruta en /public (ej. "/tutoriales/flash-sale-1.png"); placeholder si falta
  imageAlt?: string; // descripción del pantallazo (se muestra en el placeholder)
}

export interface ActivacionMeta {
  tipo: ActivacionTipo;
  label: string; // "Flash Sale"
  emoji: string;
  tagline: string; // una línea de qué es y para qué sirve
  ctaSolicitar: string; // texto del botón de inscripción
  steps: TutorialStep[]; // tutorial paso a paso
}

// Pasos como GUÍA (texto útil aunque falte el pantallazo). Oscar refina + sube imágenes.
export const ACTIVACIONES: Record<ActivacionTipo, ActivacionMeta> = {
  flash_sale: {
    tipo: "flash_sale",
    label: "Flash Sale",
    emoji: "⚡",
    tagline: "Una promoción relámpago con descuento por tiempo limitado durante tu Live, para detonar compras en el momento.",
    ctaSolicitar: "Solicitar un Flash Sale",
    steps: [
      { n: 1, title: "Entra a tu Live", detail: "Inicia tu transmisión en TikTok y abre el panel de creador (el ícono de la bolsa / TikTok Shop).", imageAlt: "Panel de creador dentro del Live con el ícono de la bolsa" },
      { n: 2, title: "Abre las herramientas de promoción", detail: "Toca 'Flash Sale' (Promoción relámpago) en las herramientas del Live.", imageAlt: "Menú de herramientas del Live con la opción Flash Sale" },
      { n: 3, title: "Elige el producto", detail: "Selecciona el producto que el equipo te confirmó y fija el precio o descuento acordado.", imageAlt: "Selector de producto con el campo de precio/descuento" },
      { n: 4, title: "Define la duración y actívalo", detail: "Pon el tiempo (10-15 min funciona bien) y actívalo; aparece el contador en pantalla.", imageAlt: "Configuración de duración del flash sale y contador activo" },
      { n: 5, title: "Anúncialo y fija el producto", detail: "Avisa en voz alta y fija el producto para que tu audiencia lo vea y compre antes de que acabe el contador.", imageAlt: "Producto fijado en el Live con el contador del flash sale" },
    ],
  },
  giveaway: {
    tipo: "giveaway",
    label: "Giveaway",
    emoji: "🎁",
    tagline: "Un sorteo de producto durante tu Live: la gente participa siguiéndote y comentando, lo que sube tu audiencia y tus ventas.",
    ctaSolicitar: "Solicitar un Giveaway",
    steps: [
      { n: 1, title: "Entra a tu Live", detail: "Inicia tu transmisión y abre el panel de herramientas (busca el ícono de regalo / Giveaway).", imageAlt: "Panel de herramientas del Live con el ícono de giveaway" },
      { n: 2, title: "Abre el Giveaway", detail: "Toca 'Giveaway' (Sorteo) y elige el producto que el equipo te asignó.", imageAlt: "Pantalla de creación de giveaway con selector de producto" },
      { n: 3, title: "Configura la participación", detail: "Define la condición de entrada (seguir + comentar una palabra clave) y cuántas ganadoras habrá.", imageAlt: "Condiciones de entrada y número de ganadoras del giveaway" },
      { n: 4, title: "Pon el tiempo y actívalo", detail: "Define la duración del sorteo y actívalo; TikTok muestra el banner de participación en pantalla.", imageAlt: "Banner de participación del giveaway activo en el Live" },
      { n: 5, title: "Cierra y coordina la entrega", detail: "Al terminar, TikTok elige a la ganadora; comparte el resultado en vivo y coordina la entrega con el equipo.", imageAlt: "Pantalla de resultado del giveaway con la ganadora" },
    ],
  },
};

export function getActivacionMeta(tipo: string): ActivacionMeta | undefined {
  return ACTIVACIONES[tipo as ActivacionTipo];
}
