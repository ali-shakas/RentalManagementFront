import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthStateService } from './core/auth/auth-state.service';
import { Loader } from './shared/component/loader/loader';
import { TapToTop } from './shared/component/tap-to-top/tap-to-top';
import { ToastContainerComponent } from './shared/component/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Loader, TapToTop, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly authState = inject(AuthStateService);
}
