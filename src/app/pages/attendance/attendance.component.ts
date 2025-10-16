import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AttendanceService } from '../../core/attendance.service';
import { AttendanceRecord, AttendanceRow, Student } from '../../core/models';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';
import { WeatherWidgetComponent } from '../../shared/weather-widget/weather-widget.component';

@Component({
  standalone: true,
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, DatePickerComponent, WeatherWidgetComponent],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  private svc = inject(AttendanceService);
  private router = inject(Router);

  step = signal<'fecha'|'tabla'>('fecha');
  fechaISO = signal<string>('');
  filas = signal<AttendanceRow[]>([]);
  alumnos = signal<Student[]>([]);
  recentAdded = signal(this.svc.getRecentAdded());

  ngOnInit() { this.alumnos.set(this.svc.getStudents()); }

  aceptarFecha() {
    const f = this.fechaISO();
    if (!f) { alert('Selecciona una fecha.'); return; }
    const existing = this.svc.getRecordByDate(f);
    if (existing) this.filas.set(existing.filas.map(x => ({ ...x })));
    else this.filas.set(this.alumnos().map(s => ({ studentId: s.id, estado: '', comentario: '' })));
    this.step.set('tabla');
  }

  marcarTodos(estado: 'PRESENTE'|'AUSENTE') { this.filas.update(rows => rows.map(r => ({ ...r, estado }))); }
  setEstado(i: number, estado: 'PRESENTE'|'AUSENTE') { this.filas.update(rows => rows.map((r, idx) => idx === i ? { ...r, estado } : r)); }
  setComentario(i: number, txt: string) { this.filas.update(rows => rows.map((r, idx) => idx === i ? { ...r, comentario: txt } : r)); }

  trackByStudent = (_: number, r: AttendanceRow) => r.studentId;

  alumnoNombre(r: AttendanceRow) {
    const s = this.alumnos().find(a => a.id === r.studentId);
    return s ? `${s.apellido}, ${s.nombre}` : r.studentId;
  }

  agregarAlumno() { this.router.navigate(['/estudiantes']); }
  anterior() { this.step.set('fecha'); }

  siguiente() {
    const rec: AttendanceRecord = { fechaISO: this.fechaISO(), filas: this.filas() };
    this.svc.saveRecord(rec);
    this.router.navigate(['/reporte'], { queryParams: { fecha: this.fechaISO() } });
  }
}
