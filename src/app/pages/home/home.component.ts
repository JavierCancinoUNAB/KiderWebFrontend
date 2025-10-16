import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { WeatherWidgetComponent } from '../../shared/weather-widget/weather-widget.component';
import { Student } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, WeatherWidgetComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private svc = inject(AttendanceService);

  students = signal<Student[]>([]);
  showAdd = signal(false);
  showModal = signal(false);
  selectedStudent = signal<Student | null>(null);
  nuevo = { nombre: '', apellido: '', edad: null as number | null, nacimiento: '', fotoUrl: '', descripcion: '' };

  sorted = computed(() => [...this.students()].sort((a, b) => a.nombre.localeCompare(b.nombre)));

  ngOnInit() {
    this.svc.seedDefaultStudents();
    this.loadStudents();
  }
  loadStudents() { this.students.set(this.svc.getStudents()); }
  openAdd() { this.showAdd.update(v => !v); }

  agregarEstudiante() {
    const { nombre, apellido, edad, nacimiento } = this.nuevo;
    if (!nombre.trim() || !apellido.trim() || !edad || !nacimiento) { alert('Completa nombre, apellido, edad y fecha.'); return; }
    const student: Student = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      edad,
      nacimiento,
      fotoUrl: this.nuevo.fotoUrl?.trim() || undefined,
      descripcion: this.nuevo.descripcion?.trim() || undefined
    };
    this.svc.addStudent(student);
    this.loadStudents();
    this.showAdd.set(false);
    this.nuevo = { nombre: '', apellido: '', edad: null, nacimiento: '', fotoUrl: '', descripcion: '' };
  }

  selectStudent(s: Student) { this.selectedStudent.set(s); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.selectedStudent.set(null); }
}

