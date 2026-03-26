import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  getItem<T = string>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return localStorage.getItem(key) as T | null;
    }
  }

  setItem(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorageService.setItem failed', e);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
