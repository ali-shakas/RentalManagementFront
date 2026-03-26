import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  readonly clickOutside = output<MouseEvent>();
  private elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}
