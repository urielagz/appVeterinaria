import { pool } from "../config/database.js";
import type {
  ActualizarCita, Cita, EstadoCita, NuevaCita,
} from "../types/cita.js";

// to_char deja la hora como "HH:MM" para que el frontend la muestre igual
const COLUMNAS = `id, mascota, cliente, servicio, fecha,
  to_char(hora, 'HH24:MI') AS hora, estado, created_at, updated_at`;

export async function listarCitas(estado?: EstadoCita): Promise<Cita[]> {
  if (estado) {
    const { rows } = await pool.query<Cita>(
      `SELECT ${COLUMNAS} FROM citas WHERE estado = $1 ORDER BY fecha, hora`,
      [estado],
    );
    return rows;
  }

  const { rows } = await pool.query<Cita>(
    `SELECT ${COLUMNAS} FROM citas ORDER BY fecha, hora`,
  );
  return rows;
}

export async function buscarCitaPorId(id: number): Promise<Cita | null> {
  const { rows } = await pool.query<Cita>(
    `SELECT ${COLUMNAS} FROM citas WHERE id = $1`, [id],
  );
  return rows[0] ?? null;
}

export async function horarioOcupado(
  fecha: string, hora: string, exceptoId?: number,
): Promise<boolean> {
  let sql = `SELECT id FROM citas
             WHERE fecha = $1 AND hora = $2
             AND estado IN ('solicitada', 'confirmada')`;
  const valores: Array<string | number> = [fecha, hora];

  if (exceptoId !== undefined) {
    sql += " AND id <> $3";
    valores.push(exceptoId);
  }

  const { rowCount } = await pool.query(sql, valores);
  return (rowCount ?? 0) > 0;
}

export async function crearCita(datos: NuevaCita): Promise<Cita> {
  const { rows } = await pool.query<Cita>(
    `INSERT INTO citas
     (mascota, cliente, servicio, fecha, hora, estado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNAS}`,
    [datos.mascota, datos.cliente, datos.servicio,
     datos.fecha, datos.hora, datos.estado ?? "solicitada"],
  );

  const cita = rows[0];
  if (!cita) throw new Error("La cita se guardó, pero no pudo recuperarse.");
  return cita;
}

export async function actualizarCita(
  id: number, datos: ActualizarCita,
): Promise<Cita | null> {
  const { rows } = await pool.query<Cita>(
    `UPDATE citas SET mascota = $1, cliente = $2, servicio = $3,
     fecha = $4, hora = $5, estado = $6 WHERE id = $7
     RETURNING ${COLUMNAS}`,
    [datos.mascota, datos.cliente, datos.servicio,
     datos.fecha, datos.hora, datos.estado, id],
  );
  return rows[0] ?? null;
}

export async function actualizarEstadoCita(
  id: number, estado: EstadoCita,
): Promise<Cita | null> {
  const { rows } = await pool.query<Cita>(
    `UPDATE citas SET estado = $1 WHERE id = $2 RETURNING ${COLUMNAS}`,
    [estado, id],
  );
  return rows[0] ?? null;
}

export async function eliminarCita(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM citas WHERE id = $1`, [id],
  );
  return (rowCount ?? 0) > 0;
}
