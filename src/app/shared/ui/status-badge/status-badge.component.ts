import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="badgeClass">{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() tone: 'success' | 'warning' | 'danger' | 'secondary' | 'info' = 'secondary';

  get badgeClass(): string {
    return `bg-${this.tone}`;
  }
}
