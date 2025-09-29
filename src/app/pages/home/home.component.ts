import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { Student } from '../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private svc = inject(AttendanceService);
  students = signal<Student[]>(this.svc.getStudents());

  sorted = computed(() =>
    [...this.students()].sort((a,b) => a.apellido.localeCompare(b.apellido, 'es'))
  );

  nuevo: Partial<Student> = { nombre: '', apellido: '', edad: 5, nacimiento: '' };
  showAdd = false;

  openAdd(){ this.showAdd = true; }
  addStudent(){
    if(!this.nuevo.nombre || !this.nuevo.apellido) return;
    this.svc.addStudent({
      nombre: this.nuevo.nombre!.trim(),
      apellido: this.nuevo.apellido!.trim(),
      edad: this.nuevo.edad ?? 5,
      nacimiento: this.nuevo.nacimiento?.trim() || '',
      fotoUrl: this.nuevo.fotoUrl?.trim(),
      descripcion: this.nuevo.descripcion?.trim()
    });
    this.students.set(this.svc.getStudents());
    this.nuevo = { nombre:'', apellido:'', edad:5, nacimiento:'' };
    this.showAdd = false;
  }
}
