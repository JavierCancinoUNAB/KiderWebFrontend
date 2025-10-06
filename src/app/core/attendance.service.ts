import { Injectable } from '@angular/core';
import { AttendanceRecord, Student } from './models';

const LS_STUDENTS = 'kinder_students';
const LS_ATT = 'kinder_attendance_records';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private students: Student[] = [];
  private records: AttendanceRecord[] = [];

  constructor() {
    this.load();
    if (this.students.length === 0) {
      const seed: Student[] = [
        { id: '1', nombre: 'Nicolas',  apellido: 'Cheuque',  edad: 5, nacimiento: 'Viña del Mar' },
        { id: '2', nombre: 'Javier',   apellido: 'Cancino',  edad: 5, nacimiento: 'Calama' },
        { id: '3', nombre: 'Rodrigo',  apellido: 'Cerda',    edad: 5, nacimiento: 'Calama' },
        { id: '4', nombre: 'José',     apellido: 'Gonzalez', edad: 5, nacimiento: 'San Antonio' },
        { id: '5', nombre: 'Benjamin', apellido: 'Vivanco',  edad: 5, nacimiento: 'Quilpué' },
        { id: '6', nombre: 'Pablo',    apellido: 'Sepulveda',edad: 5, nacimiento: 'Dubai' },
        { id: '7', nombre: 'Matias',   apellido: 'Cardemil', edad: 5, nacimiento: 'Miami' },
        { id: '8', nombre: 'Andres',   apellido: 'Tapia',    edad: 5, nacimiento: 'Alemania' },
        { id: '9', nombre: 'Fabian',   apellido: 'Peñá',     edad: 5, nacimiento: 'Portugal' },
        { id: '10',nombre: 'Rodrigo',  apellido: 'Rojas',    edad: 5, nacimiento: 'Antofagasta' }
      ];
      this.students = seed;
      this.save();
    }
  }

  getStudents(): Student[] { return [...this.students]; }
  addStudent(s: Omit<Student, 'id'>) {
    const id = crypto.randomUUID();
    this.students.push({ id, ...s });
    this.save();
  }

  updateStudent(id: string, changes: Partial<Omit<Student, 'id'>>): boolean {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.students[idx] = { ...this.students[idx], ...changes };
    this.save();
    return true;
  }

  removeStudent(id: string): boolean {
    const before = this.students.length;
    this.students = this.students.filter(s => s.id !== id);
    // También podríamos limpiar referencias en records, si existiera lógica de borrado cascada.
    this.save();
    return this.students.length < before;
  }

  getRecordByDate(fechaISO: string): AttendanceRecord | undefined {
    return this.records.find(r => r.fechaISO === fechaISO);
  }

  getLastRecords(count = 5): AttendanceRecord[] {
    // Ordena por fecha ISO descendente y devuelve una copia de los últimos N
    const sorted = [...this.records].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
    return sorted.slice(0, Math.max(0, count));
  }

  upsertRecord(rec: AttendanceRecord) {
    const idx = this.records.findIndex(r => r.fechaISO === rec.fechaISO);
    if (idx >= 0) this.records[idx] = rec; else this.records.push(rec);
    this.save();
  }

  private load() {
    try {
      this.students = JSON.parse(localStorage.getItem(LS_STUDENTS) || '[]');
      this.records = JSON.parse(localStorage.getItem(LS_ATT) || '[]');
    } catch { this.students = []; this.records = []; }
  }

  private save() {
    localStorage.setItem(LS_STUDENTS, JSON.stringify(this.students));
    localStorage.setItem(LS_ATT, JSON.stringify(this.records));
  }

  porcentajeAsistencia(rec: AttendanceRecord): number {
    const total = rec.filas.length || 1;
    const presentes = rec.filas.filter(f => f.estado === 'PRESENTE').length;
    return Math.round((presentes / total) * 100);
  }
}
