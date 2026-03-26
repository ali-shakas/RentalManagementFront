import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private idCounter = 0;

  show(type: ToastType, message: string): void {
    const id = ++this.idCounter;
    const entry: ToastMessage = {
      id,
      type,
      message,
      cssClass: this.mapCssClass(type),
    };

    setTimeout(() => {
      this.toasts.update(messages => [...messages, entry]);
      setTimeout(() => this.remove(id), 5000);
    }, 0);
  }

  remove(id: number): void {
    this.toasts.update(messages => messages.filter(message => message.id !== id));
  }

  private mapCssClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info',
    };
    return map[type];
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }
}
