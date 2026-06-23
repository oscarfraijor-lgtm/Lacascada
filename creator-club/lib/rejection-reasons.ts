// Plantillas de motivo de rechazo (el motivo lo VE la creadora y le llega por
// correo). Son sugerencias: el equipo elige una y la puede editar antes de enviar.
// Default compartido; más adelante se puede sobreescribir por marca en lib/brands.
export const REJECTION_REASONS = {
  entrega: [
    "Falta tu link de afiliado visible en el video.",
    "El video no muestra el producto con claridad.",
    "No cumple el brief de la campaña.",
    "La calidad de video o audio es muy baja.",
    "El link no abre o es incorrecto, vuelve a subirlo.",
  ],
  canje: [
    "Necesitamos validar tu primera venta atribuible en TikTok Shop.",
    "Aún no alcanzas el GMV requerido para esta recompensa.",
    "Esta recompensa está agotada por ahora.",
    "Falta completar un requisito del programa.",
  ],
  mision: [
    "Falta tu link de afiliado visible en el video.",
    "El video no muestra el producto con claridad.",
    "No cumple lo que pide la misión.",
    "El link no abre o es incorrecto, vuelve a subirlo.",
  ],
} as const;
