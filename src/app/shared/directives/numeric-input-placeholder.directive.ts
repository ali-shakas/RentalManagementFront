import { DestroyRef, Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: 'input.form-control[type=number]',
  standalone: true,
})
export class NumericInputPlaceholderDirective implements OnInit {
  /** Translation key for placeholder when the input has none. */
  @Input() numericPlaceholderKey = 'Enter value';

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.applyPlaceholder();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.applyPlaceholder();
    });
  }

  private applyPlaceholder(): void {
    const element = this.elementRef.nativeElement;
    if (element.hasAttribute('data-numeric-placeholder')) {
      element.placeholder = this.translate.instant(this.numericPlaceholderKey);
      return;
    }
    if (element.placeholder?.trim()) {
      return;
    }
    element.placeholder = this.translate.instant(this.numericPlaceholderKey);
    element.setAttribute('data-numeric-placeholder', '1');
  }
}
