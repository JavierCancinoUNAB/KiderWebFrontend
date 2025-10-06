import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ReportComponent } from './pages/report/report.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Kinder Web — Inicio' },
  { path: 'asistencia', component: AttendanceComponent, title: 'Asistencia' },
  { path: 'reporte', component: ReportComponent, title: 'Reporte de Asistencia' },
  { path: '**', redirectTo: '' }
];
