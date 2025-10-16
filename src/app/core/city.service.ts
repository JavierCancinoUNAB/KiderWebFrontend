import { Injectable, signal } from '@angular/core';

const KEY = 'selectedCity';
const RECENT_KEY = 'recentCities';

@Injectable({ providedIn: 'root' })
export class CityService {
  city = signal<string>(this.load());
  recent = signal<string[]>(this.loadRecent());

  private load() {
    try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
  }
  setCity(value: string) {
    this.city.set(value);
    try { localStorage.setItem(KEY, value); } catch {}
    this.pushRecent(value);
  }

  private loadRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  }
  private saveRecent(list: string[]) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
  }
  private pushRecent(value: string) {
    const v = (value || '').trim(); if (!v) return;
    const list = [v, ...this.recent().filter(x => x.toLowerCase() !== v.toLowerCase())].slice(0, 5);
    this.recent.set(list);
    this.saveRecent(list);
  }
}
