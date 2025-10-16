import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../core/city.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  citySvc = inject(CityService);
  city = signal<string>(this.citySvc.city());

  applyCity() {
    this.citySvc.setCity((this.city() || '').trim());
  }
}
