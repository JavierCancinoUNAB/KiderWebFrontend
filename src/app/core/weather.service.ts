import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';

export interface CurrentWeatherDTO {
  name: string;
  weather: { main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number };
  wind?: { speed?: number };
  coord?: { lat: number; lon: number };
}

export interface ForecastDTO {
  list: Array<{ dt: number; main: { temp: number }; weather: { icon: string; description: string }[] }>;
}

export interface GeocodeDTO { name: string; lat: number; lon: number; country: string; state?: string }

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);
  private cfg = environment.openWeather;
  private get apiKey(): string {
    const w: any = (globalThis as any).window;
    const k = w?.__env?.OPENWEATHER_API_KEY;
    return (typeof k === 'string' && k) ? k : this.cfg.apiKey;
  }

  hasApiKey(): boolean { return !!this.apiKey; }

  private cacheGet<T>(key: string, minutes: number): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { t, v } = JSON.parse(raw);
      if (Date.now() - t > minutes * 60 * 1000) return null;
      return v as T;
    } catch { return null; }
  }
  private cacheSet<T>(key: string, value: T) {
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value })); } catch {}
  }

  getCurrentByCity(city = this.cfg.defaultCity) {
  if (!this.apiKey) {
      const nm = (city || '').trim() || 'Ciudad';
      return of({ name: nm, weather: [{ main: 'Error', description: 'Configura API key de OpenWeather en environment.ts', icon: '50d' }], main: { temp: 0, feels_like: 0, humidity: 0 } } as CurrentWeatherDTO);
    }
    const key = `ow:current:${city}`;
    const cached = this.cacheGet<CurrentWeatherDTO>(key, this.cfg.cacheMinutes);
    if (cached) return of(cached);
    const url = `${this.cfg.baseUrl}/weather`;
  const params = { q: city, units: 'metric', lang: 'es', appid: this.apiKey } as const;
    return this.http.get<CurrentWeatherDTO>(url, { params }).pipe(
      tap(v => this.cacheSet(key, v)),
      catchError(err => of(err?.status === 401 ? { name: city, weather: [{ main: 'Error', description: 'API key inválida', icon: '50d' }], main: { temp: 0, feels_like: 0, humidity: 0 } } as CurrentWeatherDTO : err))
    );
  }

  getCurrentByCoords(lat: number, lon: number) {
  if (!this.apiKey) {
      return of({ name: '', weather: [{ main: 'Error', description: 'Configura API key de OpenWeather en environment.ts', icon: '50d' }], main: { temp: 0, feels_like: 0, humidity: 0 } } as CurrentWeatherDTO);
    }
    const k = `ow:current:${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = this.cacheGet<CurrentWeatherDTO>(k, this.cfg.cacheMinutes);
    if (cached) return of(cached);
    const url = `${this.cfg.baseUrl}/weather`;
  const params = { lat, lon, units: 'metric', lang: 'es', appid: this.apiKey } as any;
    return this.http.get<CurrentWeatherDTO>(url, { params }).pipe(
      tap(v => this.cacheSet(k, v)),
      catchError(() => of({ name: '', weather: [{ main: 'Error', description: 'Sin datos', icon: '50d' }], main: { temp: 0, feels_like: 0, humidity: 0 } } as CurrentWeatherDTO))
    );
  }

  getForecastByCoords(lat: number, lon: number) {
  if (!this.apiKey) {
      return of({ list: [] } as ForecastDTO);
    }
    const key = `ow:forecast:${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = this.cacheGet<ForecastDTO>(key, this.cfg.cacheMinutes);
    if (cached) return of(cached);
    const url = `${this.cfg.baseUrl}/forecast`;
    const params = { lat, lon, units: 'metric', lang: 'es', appid: this.cfg.apiKey } as any;
    return this.http.get<ForecastDTO>(url, { params }).pipe(
      tap(v => this.cacheSet(key, v)),
      catchError(() => of({ list: [] } as ForecastDTO))
    );
  }

  geocodeCity(query: string, limit = 1) {
    let q = (query || '').trim();
    if (!q) return of<GeocodeDTO | null>(null);
  if (!this.apiKey) return of<GeocodeDTO | null>(null);
    // Normalizar y mapear nombres de países comunes a códigos ISO
    const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const parts = q.split(',').map(p => p.trim()).filter(Boolean);
    const countryMap: Record<string, string> = {
      chile: 'CL', argentina: 'AR', peru: 'PE', brasil: 'BR', brazil: 'BR',
      mexico: 'MX', colombia: 'CO', ecuador: 'EC', uruguay: 'UY', paraguay: 'PY',
      bolivia: 'BO', espana: 'ES', españa: 'ES'
    };
    if (parts.length >= 2) {
      const last = norm(parts[parts.length - 1]).toLowerCase();
      if (countryMap[last]) {
        parts[parts.length - 1] = countryMap[last];
        q = parts.join(',');
      }
    }
    const key = `ow:geo:${q.toLowerCase()}`;
    const cached = this.cacheGet<GeocodeDTO>(key, 1440); // cache 1 día
    if (cached) return of(cached);
    const url = `https://api.openweathermap.org/geo/1.0/direct`;
    const params = { q, limit, appid: this.cfg.apiKey } as any;
    return this.http.get<GeocodeDTO[]>(url, { params }).pipe(
      map(arr => (arr && arr.length ? arr[0] : null)),
      tap(v => { if (v) this.cacheSet(key, v); }),
      catchError(() => of(null))
    );
  }
}
