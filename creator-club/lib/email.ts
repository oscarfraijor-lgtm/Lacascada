// Validación de email compartida (registro, acceso, operador). Un valor sin
// formato de correo no debe entrar como clave de Airtable ni recibir magic-link.
export function isValidEmail(e: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}
