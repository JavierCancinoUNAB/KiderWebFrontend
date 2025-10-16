import { Injectable } from '@angular/core';
import { AttendanceRecord, RecentAdded, Student } from './models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private KEY_STUDENTS = 'students';
  private KEY_RECORDS = 'attendanceRecords';
  private KEY_RECENT = 'recentAdded';

  // Students
  getStudents(): Student[] {
    const raw = localStorage.getItem(this.KEY_STUDENTS);
    return raw ? JSON.parse(raw) : [];
  }
  setStudents(students: Student[]) {
    localStorage.setItem(this.KEY_STUDENTS, JSON.stringify(students));
  }
  addStudent(student: Student) {
    const list = this.getStudents();
    list.push(student);
    this.setStudents(list);
  }
  updateStudent(student: Student) {
    const list = this.getStudents();
    const i = list.findIndex(s => s.id === student.id);
    if (i >= 0) list[i] = student;
    this.setStudents(list);
  }
  deleteStudent(id: string) {
    this.setStudents(this.getStudents().filter(s => s.id !== id));
  }
  seedDefaultStudents() {
    if (this.getStudents().length) return;
    const d = (n: string, a: string, e: number, f: string, desc: string): Student => ({
      id: crypto.randomUUID(), nombre: n, apellido: a, edad: e, nacimiento: f, descripcion: desc
    });
    this.setStudents([
      d('Ana','García',5,'2019-03-15','Estudiante destacada'),
      d('Carlos','Rodríguez',4,'2020-07-22','Activo en deportes'),
      d('María','López',5,'2019-11-08','Creativa en arte'),
      d('Juan','Martínez',4,'2020-02-14','Le gusta la música'),
      d('Sofía','Hernández',5,'2019-09-30','Líder del grupo'),
      d('Diego','Gómez',4,'2020-05-18','Muy curioso')
    ]);
  }

  // Attendance
  getRecords(): AttendanceRecord[] {
    const raw = localStorage.getItem(this.KEY_RECORDS);
    return raw ? JSON.parse(raw) : [];
  }
  getRecordByDate(fechaISO: string) {
    return this.getRecords().find(r => r.fechaISO === fechaISO);
  }
  saveRecord(record: AttendanceRecord) {
    const list = this.getRecords();
    const i = list.findIndex(r => r.fechaISO === record.fechaISO);
    if (i >= 0) list[i] = record; else list.push(record);
    localStorage.setItem(this.KEY_RECORDS, JSON.stringify(list));
    this.addToRecent(record.fechaISO);
  }
  porcentajeAsistencia(r: AttendanceRecord) {
    const total = r.filas.length || 1;
    const p = r.filas.filter(f => f.estado === 'PRESENTE').length;
    return Math.round((p / total) * 100);
  }

  // Recent
  getRecentAdded(): RecentAdded[] {
    const raw = localStorage.getItem(this.KEY_RECENT);
    return raw ? JSON.parse(raw) : [];
  }
  private addToRecent(fechaISO: string) {
    let recent = this.getRecentAdded().filter(r => r.fechaISO !== fechaISO);
    recent.unshift({ fechaISO, timestamp: Date.now() });
    localStorage.setItem(this.KEY_RECENT, JSON.stringify(recent.slice(0, 5)));
  }
  getRecentDates(limit = 5): string[] {
    const recent = this.getRecentAdded();
    if (recent.length) {
      return recent.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit).map(r => r.fechaISO);
    }
    return this.getRecords().map(r => r.fechaISO).sort().reverse().slice(0, limit);
  }
}
