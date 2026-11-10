import "dotenv/config";
import pg from "pg";

// Que DATE se devuelva como texto "YYYY-MM-DD" y no como objeto Date
// (evita que la fecha se recorra un día por la zona horaria).
pg.types.setTypeParser(pg.types.builtins.DATE, (valor) => valor);

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
});

export async function probarConexion(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("Conexión con PostgreSQL establecida");
  } finally {
    client.release();
  }
}
