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
  addImgPreview = signal<string | null>(null);
  addImgError = signal<string | null>(null);

  // Edición
  editingId = signal<string | null>(null);
  editData = signal<Partial<Student>>({});
  editImgPreview = signal<string | null>(null);
  editImgError = signal<string | null>(null);

  openAdd(){ this.showAdd = true; }
  addStudent(){
    if(!this.nuevo.nombre || !this.nuevo.apellido) return;
    this.svc.addStudent({
      nombre: this.nuevo.nombre!.trim(),
      apellido: this.nuevo.apellido!.trim(),
      edad: this.nuevo.edad ?? 5,
      nacimiento: this.nuevo.nacimiento?.trim() || '',
      fotoUrl: this.nuevo.fotoUrl?.trim() || this.addImgPreview() || undefined,
      descripcion: this.nuevo.descripcion?.trim()
    });
    this.students.set(this.svc.getStudents());
    this.nuevo = { nombre:'', apellido:'', edad:5, nacimiento:'' };
    this.showAdd = false;
    this.addImgPreview.set(null);
  }

  // Drag & Drop / File select para crear
  onAddDragOver(ev: DragEvent){ ev.preventDefault(); }
  async onAddDrop(ev: DragEvent){
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (file) await this.handleAddImageFile(file);
  }
  async onAddFileSelect(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await this.handleAddImageFile(file);
  }
  async onAddDirSelect(ev: Event){
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    const img = this.pickFirstImage(files);
    if (img) await this.handleAddImageFile(img);
  }

  // Edición de estudiante
  startEdit(s: Student){
    this.editingId.set(s.id);
    this.editData.set({ ...s });
    this.editImgPreview.set(s.fotoUrl ?? null);
    this.editImgError.set(null);
  }
  cancelEdit(){
    this.editingId.set(null);
    this.editData.set({});
    this.editImgPreview.set(null);
    this.editImgError.set(null);
  }
  saveEdit(){
    const id = this.editingId();
    const data = this.editData();
    if (!id || !data) return;
    this.svc.updateStudent(id, {
      nombre: data.nombre?.trim(),
      apellido: data.apellido?.trim(),
      edad: data.edad,
      nacimiento: data.nacimiento?.trim(),
      descripcion: data.descripcion?.trim(),
      fotoUrl: (this.editImgPreview() || data.fotoUrl || undefined)
    });
    this.students.set(this.svc.getStudents());
    this.cancelEdit();
  }

  // Drag & Drop / File select para editar
  onEditDragOver(ev: DragEvent){ ev.preventDefault(); }
  async onEditDrop(ev: DragEvent){
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (file) await this.handleEditImageFile(file);
  }
  async onEditFileSelect(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await this.handleEditImageFile(file);
  }
  async onEditDirSelect(ev: Event){
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    const img = this.pickFirstImage(files);
    if (img) await this.handleEditImageFile(img);
  }

  private async readFileAsDataUrl(file: File, cb: (dataUrl: string)=>void){
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { cb(String(reader.result)); resolve(); };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  private validateImageFile(file: File): string | null {
    const maxSize = 3 * 1024 * 1024; // 3MB
    const allowed = ['image/jpeg','image/png','image/webp'];
    if (!allowed.includes(file.type)) return 'Formato no soportado. Usa JPG, PNG o WebP.';
    if (file.size > maxSize) return 'La imagen supera el tamaño máximo de 3MB.';
    return null;
  }

  private pickFirstImage(files: FileList): File | null {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) return files[i];
    }
    return null;
  }

  private async handleAddImageFile(file: File){
    const err = this.validateImageFile(file);
    if (err) { this.addImgError.set(err); return; }
    this.addImgError.set(null);
    const data = await this.processImageFile(file);
    this.addImgPreview.set(data);
    this.nuevo.fotoUrl = data;
  }

  private async handleEditImageFile(file: File){
    const err = this.validateImageFile(file);
    if (err) { this.editImgError.set(err); return; }
    this.editImgError.set(null);
    const data = await this.processImageFile(file);
    this.editImgPreview.set(data);
    this.editData.update(x => ({...x, fotoUrl: data}));
  }

  // Redimensiona y comprime la imagen a un máximo de 1024px en el lado más largo y exporta WebP/JPEG.
  private async processImageFile(file: File): Promise<string> {
    const img = await this.loadImageFromFile(file);
    const maxSide = 1024;
    const { width, height } = img;
    let targetW = width;
    let targetH = height;
    if (width > height && width > maxSide) {
      targetW = maxSide;
      targetH = Math.round((height / width) * targetW);
    } else if (height >= width && height > maxSide) {
      targetH = maxSide;
      targetW = Math.round((width / height) * targetH);
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Fallback si no hay contexto canvas
      return await new Promise<string>((resolve)=> this.readFileAsDataUrl(file, resolve));
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Intentar WebP, sino JPEG
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL('image/webp', 0.85);
      if (!dataUrl.includes('data:image/webp')) throw new Error('webp not supported');
    } catch {
      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
    return dataUrl;
  }

  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  deleteStudent(id: string){
    const s = this.students().find(x => x.id === id);
    const name = s ? `${s.nombre} ${s.apellido}` : 'este estudiante';
    if (!confirm(`¿Eliminar ${name}? Esta acción no se puede deshacer.`)) return;
    this.svc.removeStudent(id);
    this.students.set(this.svc.getStudents());
    if (this.editingId() === id) this.cancelEdit();
  }
}
