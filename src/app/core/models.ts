export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nacimiento: string;
  fotoUrl?: string;
  descripcion?: string;
}

export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | '';

export interface AttendanceRow {
  studentId: string;
  estado: EstadoAsistencia;
  comentario: string;
}

export interface AttendanceRecord {
  fechaISO: string;
  filas: AttendanceRow[];
}
