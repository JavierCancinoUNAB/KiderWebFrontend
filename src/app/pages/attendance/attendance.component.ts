import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { AttendanceRecord, AttendanceRow, Student } from '../../core/models';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {
  private svc = inject(AttendanceService);
  private router = inject(Router);

  min = '1950-01-01'; max = '2100-12-31';
  fechaISO = signal<string>('');
  step = signal<'fecha'|'tabla'>('fecha');

  alumnos = signal<Student[]>([]);
  filas = signal<AttendanceRow[]>([]);

  constructor(){
    const sorted = this.svc.getStudents().sort((a,b)=>a.apellido.localeCompare(b.apellido,'es'));
    this.alumnos.set(sorted);
  }

  aceptarFecha(){
    if (!this.fechaISO()) return;
    const rec = this.svc.getRecordByDate(this.fechaISO());
    if (rec) {
      this.filas.set(rec.filas);
    } else {
      this.filas.set(this.alumnos().map(s => ({ studentId: s.id, estado: '', comentario:'' })));
    }
    this.step.set('tabla');
  }

  marcarTodos(estado: 'PRESENTE'|'AUSENTE'){
    this.filas.update(rows => rows.map(r => ({...r, estado})));
  }

  setEstado(i: number, estado: 'PRESENTE'|'AUSENTE'){
    const rows = [...this.filas()];
    rows[i] = {...rows[i], estado};
    this.filas.set(rows);
  }

  setComentario(i: number, value: string){
    const rows = [...this.filas()];
    rows[i] = {...rows[i], comentario: value.slice(0,150)};
    this.filas.set(rows);
  }

  agregarAlumno(){
    const tmpId = 'tmp_' + crypto.randomUUID();
    this.alumnos.update(a => [...a, { id: tmpId, nombre:'Nuevo', apellido:'Alumno', edad:5, nacimiento:'' }]);
    this.filas.update(f => [...f, { studentId: tmpId, estado:'', comentario:'' }]);
  }

  anterior(){ this.step.set('fecha'); }

  siguiente(){
    const rec: AttendanceRecord = { fechaISO: this.fechaISO(), filas: this.filas() };
    this.svc.upsertRecord(rec);
    this.router.navigate(['/reporte'], { queryParams: { fecha: this.fechaISO() }});
  }
}
