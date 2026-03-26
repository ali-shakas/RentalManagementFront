import { Directive, ElementRef, Input, Renderer2, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';

import { AuthStateService } from '../../core/auth/auth-state.service';

@Directive({
  selector: '[hasPrivilege]',
  standalone: true,
})
export class HasPrivilegeDirective {
  private tpl = inject(TemplateRef<any>, { optional: true });
  private vcr = inject(ViewContainerRef, { optional: true });
  private elementRef = inject(ElementRef<HTMLElement>, { optional: true });
  private renderer = inject(Renderer2);
  private authState = inject(AuthStateService);

  private required: string[] = [];
  private last = false;

  constructor() {
    effect(() => {
      const ok = this.authState.hasAnyPrivilege(this.required);
      this.render(ok);
    });
  }

  @Input('hasPrivilege')
  set hasPrivilege(value: string | string[] | null | undefined) {
    if (!value) this.required = [];
    else this.required = Array.isArray(value) ? value : [value];
    this.render(this.authState.hasAnyPrivilege(this.required));
  }

  private render(ok: boolean): void {
    if (ok === this.last) return;
    this.last = ok;

    if (this.tpl && this.vcr) {
      this.vcr.clear();
      if (ok) {
        this.vcr.createEmbeddedView(this.tpl);
      }
      return;
    }

    if (this.elementRef) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', ok ? '' : 'none');
    }
  }
}

