import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { AttendanceRecord, Student } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  private svc = inject(AttendanceService);

  min = '1950-01-01'; max = '2100-12-31';
  fechaISO = signal<string>('');
  record = signal<AttendanceRecord | null>(null);
  mapStudents = new Map<string, Student>(this.svc.getStudents().map(s => [s.id, s]));

  buscar(){
    if (!this.fechaISO()) return;
    const rec = this.svc.getRecordByDate(this.fechaISO());
    this.record.set(rec ?? null);
  }

  porcentaje(): number {
    const r = this.record();
    return r ? this.svc.porcentajeAsistencia(r) : 0;
  }
}
