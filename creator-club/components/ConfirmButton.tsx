"use client";

// Botón de submit que pide confirmación antes de enviar el form. Para acciones
// irreversibles (eliminar, marcar enviada): una red de seguridad para el operador.
export default function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
