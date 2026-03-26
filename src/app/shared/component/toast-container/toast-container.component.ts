import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        position: fixed;
        top: 1rem;
        inset-inline-end: 1rem;
        z-index: 10020;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.55rem;
        pointer-events: none;
      }

      .app-toast {
        pointer-events: auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 0.5rem;
        width: min(320px, calc(100vw - 1.5rem));
        min-width: 220px;
        margin: 0;
        padding: 0.7rem 0.8rem;
        border-width: 1px;
        border-style: solid;
        border-radius: 14px;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        font-size: 0.82rem;
        line-height: 1.45;
        animation: toast-slide-in 180ms ease-out;
      }

      .app-toast__message {
        min-width: 0;
        font-weight: 600;
        overflow-wrap: anywhere;
      }

      .app-toast__close {
        width: 0.8rem;
        height: 0.8rem;
        padding: 0;
        margin: 0.1rem 0 0;
        opacity: 0.88;
        filter: brightness(0.2);
      }

      .app-toast__close:hover {
        opacity: 1;
      }

      .app-toast--error {
        background: rgba(255, 244, 246, 0.96);
        border-color: rgba(220, 53, 69, 0.32);
        color: #6f1020;
        box-shadow:
          0 12px 28px rgba(220, 53, 69, 0.16),
          0 0 0 1px rgba(220, 53, 69, 0.08);
      }

      .app-toast--success {
        background: rgba(242, 252, 244, 0.96);
        border-color: rgba(40, 167, 69, 0.24);
        color: #165c2a;
      }

      .app-toast--warning {
        background: rgba(255, 249, 237, 0.97);
        border-color: rgba(255, 193, 7, 0.28);
        color: #7a5500;
      }

      .app-toast--info {
        background: rgba(239, 248, 255, 0.97);
        border-color: rgba(13, 110, 253, 0.24);
        color: #114f98;
      }

      body.dark-only .app-toast {
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.34);
      }

      body.dark-only .app-toast--error {
        background: rgba(118, 24, 42, 0.94);
        border-color: rgba(255, 99, 132, 0.34);
        color: #fff4f6;
        box-shadow:
          0 16px 36px rgba(59, 10, 22, 0.44),
          0 0 22px rgba(255, 99, 132, 0.18);
      }

      body.dark-only .app-toast--success {
        background: rgba(20, 83, 45, 0.94);
        border-color: rgba(74, 222, 128, 0.26);
        color: #f0fdf4;
      }

      body.dark-only .app-toast--warning {
        background: rgba(120, 53, 15, 0.94);
        border-color: rgba(251, 191, 36, 0.28);
        color: #fff7ed;
      }

      body.dark-only .app-toast--info {
        background: rgba(17, 75, 132, 0.94);
        border-color: rgba(96, 165, 250, 0.28);
        color: #eff6ff;
      }

      body.dark-only .app-toast__close {
        filter: brightness(0) invert(1);
      }

      @keyframes toast-slide-in {
        from {
          opacity: 0;
          transform: translate3d(10px, -8px, 0) scale(0.98);
        }

        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @media (max-width: 767.98px) {
        :host {
          top: 0.75rem;
          inset-inline-end: 0.75rem;
          inset-inline-start: 0.75rem;
          align-items: stretch;
        }

        .app-toast {
          width: 100%;
          min-width: 0;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
