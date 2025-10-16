import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AttendanceService } from '../../core/attendance.service';
import { AttendanceRecord, AttendanceRow, Student } from '../../core/models';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, DatePickerComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AttendanceService);

  fecha = signal<string>('');
  record = signal<AttendanceRecord | null>(null);
  students = signal<Student[]>([]);
  recentDates = signal<string[]>([]);
  currentIdx = computed(() => this.recentDates().indexOf(this.fecha()));

  porcentaje = computed(() => this.record() ? this.svc.porcentajeAsistencia(this.record()!) : 0);

  ngOnInit(): void {
    this.students.set(this.svc.getStudents());
    this.recentDates.set(this.svc.getRecentDates(5));
    this.route.queryParamMap.subscribe(p => {
      const f = p.get('fecha') || '';
      if (f) this.cargar(f);
    });
  }

  cargar(fechaISO: string) {
    this.fecha.set(fechaISO);
    const r = this.svc.getRecordByDate(fechaISO) || null;
    this.record.set(r);
  }

  onFechaChange(fechaISO: string) {
    this.cargar(fechaISO);
  }

  anterior() {
    const arr = this.recentDates();
    const idx = arr.indexOf(this.fecha());
    if (idx >= 0 && idx < arr.length - 1) this.cargar(arr[idx + 1]);
  }

  siguiente() {
    const arr = this.recentDates();
    const idx = arr.indexOf(this.fecha());
    if (idx > 0) this.cargar(arr[idx - 1]);
  }

  nombreDe(r: AttendanceRow) {
    const s = this.students().find(x => x.id === r.studentId);
    return s ? `${s.apellido}, ${s.nombre}` : r.studentId;
  }

}
