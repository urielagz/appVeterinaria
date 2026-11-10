import type { Cita, EstadoCita, NuevaCita } from "../types";

// Se puede cambiar con la variable VITE_API_URL (archivo .env del frontend)
const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3002/api/citas";

// Hace la petición y convierte cualquier falla en un Error con mensaje claro.
// El backend siempre responde los errores como { mensaje: "..." }.
async function solicitar<T>(url: string, opciones?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, opciones);
  } catch {
    // fetch solo lanza error cuando no hay conexión con el servidor
    throw new Error(
      "No hay conexión con el servidor. Verifica que el backend esté encendido.",
    );
  }

  const resultado = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(resultado?.mensaje ?? "Ocurrió un error inesperado.");
  }
  return resultado as T;
}

export function obtenerCitas(): Promise<Cita[]> {
  return solicitar<Cita[]>(API_URL);
}

export async function crearCita(datos: NuevaCita): Promise<Cita> {
  const resultado = await solicitar<{ mensaje: string; cita: Cita }>(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return resultado.cita;
}

export async function actualizarEstado(
  id: number, estado: EstadoCita,
): Promise<Cita> {
  const resultado = await solicitar<{ mensaje: string; cita: Cita }>(
    `${API_URL}/${id}/estado`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    },
  );
  return resultado.cita;
}
