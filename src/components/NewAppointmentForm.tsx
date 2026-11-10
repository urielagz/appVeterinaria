import { useState, type FormEvent } from "react";
import { crearCita } from "../services/citasApi";
import type { Cita, NuevaCita } from "../types";

type Props = {
  onCreada: (cita: Cita) => void;
  onCancelar: () => void;
};

const formularioVacio: NuevaCita = {
  mascota: "",
  cliente: "",
  servicio: "",
  fecha: "",
  hora: "",
};

const servicios = [
  "Consulta Médica",
  "Vacunación",
  "Desparasitar",
  "Esterilizar",
  "Estética",
];

const estiloCampo =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 " +
  "focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-100";

export function NewAppointmentForm({ onCreada, onCancelar }: Props) {
  const [datos, setDatos] = useState<NuevaCita>(formularioVacio);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo: keyof NuevaCita, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  // Validación rápida en el navegador; el backend vuelve a validar todo
  function validar(): string | null {
    const vacio = Object.values(datos).some((v) => v.trim() === "");
    if (vacio) return "Todos los campos son obligatorios.";
    return null;
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }

    setEnviando(true);
    try {
      const cita = await crearCita({
        mascota: datos.mascota.trim(),
        cliente: datos.cliente.trim(),
        servicio: datos.servicio,
        fecha: datos.fecha,
        hora: datos.hora,
      });
      setDatos(formularioVacio);
      onCreada(cita);
    } catch (err) {
      // Aquí llegan los mensajes del backend, p. ej. "Ya existe una cita activa en ese horario."
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 className="text-lg font-bold text-slate-900">Registrar nueva cita</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Mascota</span>
          <input
            className={estiloCampo}
            value={datos.mascota}
            maxLength={80}
            onChange={(e) => cambiar("mascota", e.target.value)}
            placeholder="Ej. Max"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Cliente</span>
          <input
            className={estiloCampo}
            value={datos.cliente}
            maxLength={120}
            onChange={(e) => cambiar("cliente", e.target.value)}
            placeholder="Ej. Ana López"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Servicio</span>
          <select
            className={estiloCampo}
            value={datos.servicio}
            onChange={(e) => cambiar("servicio", e.target.value)}
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Fecha</span>
            <input
              type="date"
              className={estiloCampo}
              value={datos.fecha}
              onChange={(e) => cambiar("fecha", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Hora</span>
            <input
              type="time"
              className={estiloCampo}
              value={datos.hora}
              onChange={(e) => cambiar("hora", e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-red-800">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white
                     hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Guardando..." : "Guardar cita"}
        </button>
      </div>
    </form>
  );
}
