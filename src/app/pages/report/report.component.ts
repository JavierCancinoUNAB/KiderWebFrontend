import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { AttendanceRecord, Student } from '../../core/models';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnDestroy {
  private svc = inject(AttendanceService);
  private ar = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private sub?: Subscription;

  min = '1950-01-01'; max = '2100-12-31';
  fechaISO = signal<string>('');
  record = signal<AttendanceRecord | null>(null);
  ultimos = signal<AttendanceRecord[]>([]);
  mapStudents = new Map<string, Student>(this.svc.getStudents().map((s: Student) => [s.id, s]));

  constructor(){
    // Cargar últimos 5 reportes al iniciar
    this.refreshUltimos();
    // Suscribirse a cambios de query param `fecha`
  this.sub = this.ar.queryParamMap.subscribe((qp: ParamMap) => {
      const f = qp.get('fecha') || '';
      if (f && f !== this.fechaISO()) {
        this.fechaISO.set(f);
        const rec = this.svc.getRecordByDate(f);
        this.record.set(rec ?? null);
      }
    });
  }

  refreshUltimos(){
    this.ultimos.set(this.svc.getLastRecords(5));
  }

  buscar(){
    if (!this.fechaISO()) return;
    const rec = this.svc.getRecordByDate(this.fechaISO());
    this.record.set(rec ?? null);
    this.refreshUltimos();
  }

  porcentaje(): number {
    const r = this.record();
    return r ? this.svc.porcentajeAsistencia(r) : 0;
  }

  porcentajeRecord(r: AttendanceRecord): number {
    return this.svc.porcentajeAsistencia(r);
  }

  seleccionar(fecha: string){
    this.fechaISO.set(fecha);
    const rec = this.svc.getRecordByDate(fecha);
    this.record.set(rec ?? null);
    // Actualiza URL sin recargar
    this.router.navigate([], { relativeTo: this.ar, queryParams: { fecha }, queryParamsHandling: '' });
  }

  anterior(){
    // Si hay historial, retrocede; si no, limpia selección
    try { this.location.back(); }
    catch { this.fechaISO.set(''); this.record.set(null); }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
