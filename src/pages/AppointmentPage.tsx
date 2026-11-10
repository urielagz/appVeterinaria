import { useEffect, useState } from "react";
import { AppointmentCard } from "../components/AppointmentCard";
import { NewAppointmentForm } from "../components/NewAppointmentForm";
import { StatCard } from "../components/StatCard";
import { actualizarEstado, obtenerCitas } from "../services/citasApi";
import type { Cita, EstadoCita } from "../types";

type Filtro = "todas" | EstadoCita;

// Mismo orden que usa el backend: por fecha y luego por hora
function ordenar(citas: Cita[]): Cita[] {
  return [...citas].sort((a, b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`),
  );
}

export function AppointmentsPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    obtenerCitas()
      .then(setCitas)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const citasFiltradas =
    filtro === "todas" ? citas : citas.filter((cita) => cita.estado === filtro);

  const pendientes = citas.filter((c) => c.estado === "solicitada").length;
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length;

  async function confirmarCita(id: number) {
    setError("");
    setMensaje("");
    try {
      const actualizada = await actualizarEstado(id, "confirmada");
      setCitas((prev) =>
        prev.map((cita) => (cita.id === id ? actualizada : cita)),
      );
      setMensaje("La cita fue confirmada correctamente.");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // La cita ya se guardó en la BD; aquí solo la agregamos a la lista en pantalla
  function agregarCita(cita: Cita) {
    setCitas((prev) => ordenar([...prev, cita]));
    setMostrarFormulario(false);
    setFiltro("todas");
    setError("");
    setMensaje(`La cita de ${cita.mascota} fue registrada correctamente.`);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Agenda de citas</h2>
          <p className="mt-1 text-slate-600">
            Consulta y administra las citas del día.
          </p>
        </div>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setMensaje("");
          }}
          disabled={mostrarFormulario}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          + Nueva cita
        </button>
      </section>

      {mostrarFormulario && (
        <NewAppointmentForm
          onCreada={agregarCita}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          titulo="Citas de hoy"
          valor={citas.length}
          color="text-teal-700"
        />
        <StatCard
          titulo="Pendientes"
          valor={pendientes}
          color="text-amber-600"
        />
        <StatCard
          titulo="Confirmadas"
          valor={confirmadas}
          color="text-green-600"
        />
      </section>

      <section className="mt-8">
        <label
          htmlFor="filtro"
          className="mb-2 block font-semibold text-slate-700"
        >
          Filtrar por estado
        </label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:w-64"
        >
          <option value="todas">Todas</option>
          <option value="solicitada">Solicitadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="atendida">Atendidas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </section>

      {mensaje && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-800"
        >
          {mensaje}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-red-800"
        >
          {error}
        </p>
      )}

      <section className="mt-6 grid gap-4">
        {cargando ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            Cargando citas...
          </p>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => (
            <AppointmentCard
              key={cita.id}
              cita={cita}
              onConfirmar={confirmarCita}
            />
          ))
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            No se encontraron citas con ese estado.
          </p>
        )}
      </section>
    </main>
  );
}
