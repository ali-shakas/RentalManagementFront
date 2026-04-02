import { DestroyRef, Directive, ElementRef, HostBinding, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input.form-control, textarea.form-control, select.form-select',
  standalone: true,
})
export class FieldValueStateDirective implements OnInit {
  @HostBinding('class.form-value-empty') isEmpty = false;
  @HostBinding('class.form-value-filled') isFilled = false;

  private readonly elementRef = inject(
    ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  ngOnInit(): void {
    this.syncState();

    this.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncState();
    });

    this.ngControl?.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncState();
    });
  }

  @HostListener('input')
  onInput(): void {
    this.syncState();
  }

  @HostListener('change')
  onChange(): void {
    this.syncState();
  }

  private syncState(): void {
    const element = this.elementRef.nativeElement;
    const isTracked = Boolean(element.closest('.app-form-value-state'));

    if (!isTracked) {
      this.isEmpty = false;
      this.isFilled = false;
      return;
    }

    const normalized = this.getNormalizedValue(element);
    const baseEmpty = !normalized || normalized === '-' || normalized === '—';

    if (element instanceof HTMLSelectElement) {
      const firstOptionLabel = (element.options.item(0)?.textContent || '').trim().toLowerCase();
      const hasSelectPrompt =
        firstOptionLabel.includes('select') ||
        firstOptionLabel.includes('choose') ||
        firstOptionLabel.includes('اختر');
      const emptyByPrompt = hasSelectPrompt && element.selectedIndex <= 0;
      this.isEmpty = baseEmpty || emptyByPrompt;
    } else {
      this.isEmpty = baseEmpty;
    }

    this.isFilled = !this.isEmpty;
  }

  private getNormalizedValue(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): string {
    const rawValue =
      element instanceof HTMLSelectElement
        ? element.value
        : element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
          ? element.value
          : '';
    return String(rawValue ?? '').trim();
  }
}
