export type EstadoCita =
  | 'solicitada'
  | 'confirmada'
  | 'atendida'
  | 'rechazada'
  | 'cancelada';

export type Cita = {
  id: number;
  mascota: string;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
};

// Datos que el formulario envía al backend (el id y el estado los pone la BD)
export type NuevaCita = {
  mascota: string;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
};
