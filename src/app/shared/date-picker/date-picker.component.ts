import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-date-picker',
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit, OnChanges {
  @Input() fechaISO = '';
  @Input() min = '2015-01-01';
  @Input() max = '2035-12-31';
  @Output() fechaChange = new EventEmitter<string>();

  show = signal(false);
  year = signal(new Date().getFullYear());
  month = signal(new Date().getMonth());
  selected = signal<Date | null>(null);

  constructor(private host: ElementRef) {}

  ngOnInit() { this.syncFromInput(); }
  ngOnChanges(changes: SimpleChanges) { if (changes['fechaISO']) this.syncFromInput(); }

  private syncFromInput() {
    if (!this.fechaISO) return;
    const d = new Date(this.fechaISO + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      this.selected.set(d);
      this.year.set(d.getFullYear());
      this.month.set(d.getMonth());
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) this.close();
  }

  toggle(e?: Event) { e?.stopPropagation(); this.show.update(v => !v); }
  close() { this.show.set(false); }

  get monthName() {
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][this.month()];
  }

  daysInMonth(): (number | null)[] {
    const y = this.year(), m = this.month();
    const firstDow = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    return [...Array(firstDow).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    // Nota: getDay() inicia en Domingo=0 para este grid
  }

  prevMonth() { if (this.month() === 0) { this.month.set(11); this.prevYear(); } else this.month.update(v => v - 1); }
  nextMonth() { if (this.month() === 11) { this.month.set(0); this.nextYear(); } else this.month.update(v => v + 1); }
  prevYear() { const minY = +this.min.slice(0,4); if (this.year() > minY) this.year.update(v => v - 1); }
  nextYear() { const maxY = +this.max.slice(0,4); if (this.year() < maxY) this.year.update(v => v + 1); }

  selectDay(day: number | null) {
    if (!day) return;
    const d = new Date(this.year(), this.month(), day);
    this.selected.set(d);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    this.fechaChange.emit(iso);
    this.close();
  }

  isSelected(day: number | null) {
    if (!day || !this.selected()) return false;
    const s = this.selected()!;
    return s.getDate() === day && s.getMonth() === this.month() && s.getFullYear() === this.year();
  }
  isToday(day: number | null) {
    if (!day) return false;
    const t = new Date();
    return t.getDate() === day && t.getMonth() === this.month() && t.getFullYear() === this.year();
  }

  get displayText() {
    const s = this.selected();
    if (!s) return 'Seleccionar fecha';
    return `${String(s.getDate()).padStart(2,'0')}/${String(s.getMonth()+1).padStart(2,'0')}/${s.getFullYear()}`;
  }
}