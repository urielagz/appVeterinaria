import type { ErrorRequestHandler, RequestHandler } from "express";

// Error "esperado": lo lanzamos nosotros con un status y un mensaje para el usuario
export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const rutaNoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({
    mensaje: `No existe la ruta ${req.method} ${req.path}`,
  });
};

// Middleware central: TODOS los errores terminan aquí (gracias a asyncHandler)
export const manejarErrores: ErrorRequestHandler = (
  error, _req, res, _next,
) => {
  // Errores de validación o de reglas de negocio
  if (error instanceof AppError) {
    res.status(error.status).json({ mensaje: error.message });
    return;
  }

  // JSON mal formado en el body de la petición (lo detecta express.json())
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ mensaje: "El cuerpo de la solicitud no es un JSON válido." });
    return;
  }

  // Cualquier otro error (BD caída, bug, etc.): se registra en consola
  // y al usuario no se le muestran detalles internos
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor." });
};
