import { Component, Input, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, CurrentWeatherDTO, ForecastDTO } from '../../core/weather.service';
import { CityService } from '../../core/city.service';

@Component({
  standalone: true,
  selector: 'app-weather-widget',
  imports: [CommonModule],
  templateUrl: './weather-widget.component.html',
  styleUrls: ['./weather-widget.component.css']
})
export class WeatherWidgetComponent implements OnInit {
  svc = inject(WeatherService);
  private citySvc = inject(CityService);

  @Input() city = '';
  loading = signal(true);
  error = signal<string | null>(null);
  current = signal<CurrentWeatherDTO | null>(null);
  forecast = signal<ForecastDTO | null>(null);

  iconUrl = computed(() => {
    const ic = this.current()?.weather?.[0]?.icon;
    return ic ? `https://openweathermap.org/img/wn/${ic}@2x.png` : '';
  });

  private loadForCity(city: string | undefined) {
    this.loading.set(true);
    this.error.set(null);
    const q = (city || '').trim();
    const doByCoords = (lat: number, lon: number) => {
      this.svc.getCurrentByCoords(lat, lon).subscribe({
        next: cur => {
          this.current.set(cur);
          this.svc.getForecastByCoords(lat, lon).subscribe(f => this.forecast.set(f));
        },
        error: () => this.error.set('No se pudo obtener el clima'),
        complete: () => this.loading.set(false)
      });
    };
    if (!q) {
      // usar default del service por ciudad
      this.svc.getCurrentByCity(undefined).subscribe({
        next: cur => {
          this.current.set(cur);
          const lat = cur?.coord?.lat; const lon = cur?.coord?.lon;
          if (lat != null && lon != null) this.svc.getForecastByCoords(lat, lon).subscribe(f => this.forecast.set(f));
        },
        error: () => this.error.set('No se pudo obtener el clima'),
        complete: () => this.loading.set(false)
      });
    } else {
      // geocodificar texto libre y luego cargar por coords
      this.svc.geocodeCity(q).subscribe(geo => {
        if (geo && geo.lat != null && geo.lon != null) doByCoords(geo.lat, geo.lon);
        else { this.error.set('Ciudad no encontrada'); this.loading.set(false); }
      });
    }
  }

  constructor() {
    // Efecto reactivo creado dentro del constructor (contexto de inyección válido)
    effect(() => {
      if (!this.city) {
        const selected = this.citySvc.city();
        this.loadForCity(selected || undefined);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    if (this.city) {
      this.loadForCity(this.city);
    }
  }
}
