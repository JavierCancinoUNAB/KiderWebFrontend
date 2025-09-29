import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="container-xxl app-main py-3">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-main{ padding-top: 92px; }
  `]
})
export class AppComponent {}
