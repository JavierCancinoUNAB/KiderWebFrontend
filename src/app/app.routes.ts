import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'asistencia', loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent) },
  { path: 'reporte', loadComponent: () => import('./pages/report/report.component').then(m => m.ReportComponent) },
  { path: 'estudiantes', loadComponent: () => import('./pages/students/students.component').then(m => m.StudentsComponent) },
  { path: '**', redirectTo: '' }
];
