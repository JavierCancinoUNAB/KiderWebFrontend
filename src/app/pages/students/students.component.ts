import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/attendance.service';
import { Student } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-students',
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  private svc = inject(AttendanceService);

  students = signal<Student[]>([]);
  edit = signal<Student | null>(null);
  nuevo: Partial<Student> = { nombre: '', apellido: '', edad: 4, nacimiento: '' };

  ngOnInit() { this.load(); }
  load() { this.students.set(this.svc.getStudents()); }

  crear() {
    const n = this.nuevo;
    if (!n.nombre || !n.apellido || !n.edad || !n.nacimiento) return;
    this.svc.addStudent({
      id: crypto.randomUUID(),
      nombre: n.nombre!, apellido: n.apellido!, edad: n.edad!, nacimiento: n.nacimiento!,
      fotoUrl: n.fotoUrl, descripcion: n.descripcion, imagen: n.imagen
    });
    this.nuevo = { nombre: '', apellido: '', edad: 4, nacimiento: '' };
    this.load();
  }

  startEdit(s: Student) { this.edit.set({ ...s }); }
  cancelEdit() { this.edit.set(null); }
  saveEdit() { const e = this.edit(); if (!e) return; this.svc.updateStudent(e); this.edit.set(null); this.load(); }
  del(id: string) { if (!confirm('¿Eliminar estudiante?')) return; this.svc.deleteStudent(id); this.load(); }

  // Imagen: seleccionar archivo o drag&drop
  onFileSelected(event: Event, target: 'nuevo' | 'edit') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.readFile(file).then(data => this.setImage(target, data));
  }

  onDropFile(event: DragEvent, target: 'nuevo' | 'edit') {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.readFile(file).then(data => this.setImage(target, data));
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private setImage(target: 'nuevo' | 'edit', dataUrl: string) {
    if (target === 'nuevo') {
      this.nuevo.imagen = dataUrl;
    } else {
      this.edit.update(e => e ? ({ ...e, imagen: dataUrl }) : e);
    }
  }

  removeImage(target: 'nuevo' | 'edit') {
    if (target === 'nuevo') {
      delete this.nuevo.imagen;
    } else {
      this.edit.update(e => e ? ({ ...e, imagen: undefined }) : e);
    }
  }
}