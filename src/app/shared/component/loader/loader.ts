import { Component, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss'],
  imports: [],
})
export class Loader implements OnDestroy {
  public show = true;
  private router = inject(Router);
  private hideTimeout = 0;

  constructor() {
    // إخفاء الـ loader عند اكتمال أول تنقل
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        this.show = false;
      });

    // fallback: إخفاء بعد 1.5 ثانية كحد أقصى إن لم يحصل تنقل
    this.hideTimeout = window.setTimeout(() => {
      this.show = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
    }
  }
}
