import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private count = 0;

  get isLoading(): boolean {
    return this.count > 0;
  }

  show(): void {
    this.count++;
  }

  hide(): void {
    if (this.count > 0) this.count--;
  }
}
