-- =====================================================================
--  Base de datos: veterinaria_db  (PostgreSQL / pgAdmin)
--
--  PASO 1: conectado a la base "postgres", ejecuta SOLO esta línea:
--
--    CREATE DATABASE veterinaria_db ENCODING 'UTF8' TEMPLATE template0;
--
--  PASO 2: en pgAdmin abre el Query Tool sobre "veterinaria_db"
--          y ejecuta todo lo que sigue.
-- =====================================================================

-- Tipo ENUM para el estado (en PostgreSQL se crea aparte)
CREATE TYPE estado_cita AS ENUM (
  'solicitada', 'confirmada', 'atendida', 'rechazada', 'cancelada'
);

CREATE TABLE citas (
  id          SERIAL PRIMARY KEY,
  mascota     VARCHAR(80)  NOT NULL,
  cliente     VARCHAR(120) NOT NULL,
  servicio    VARCHAR(120) NOT NULL,
  fecha       DATE         NOT NULL,
  hora        TIME         NOT NULL,
  estado      estado_cita  NOT NULL DEFAULT 'solicitada',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PostgreSQL no tiene "ON UPDATE CURRENT_TIMESTAMP": se usa un trigger
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_citas_updated_at
BEFORE UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

INSERT INTO citas (mascota, cliente, servicio, fecha, hora, estado) VALUES
('Max',      'Ana López',       'Vacunación',      '2026-10-28', '09:00:00', 'solicitada'),
('Voyka',    'Irvin Chan',      'Consulta Médica', '2026-10-28', '13:00:00', 'solicitada'),
('Firulais', 'Agapito Pacheco', 'Esterilizar',     '2026-10-28', '15:00:00', 'solicitada'),
('Rocky',    'María Gómez',     'Desparasitar',    '2026-10-28', '12:00:00', 'solicitada');

SELECT * FROM citas;
